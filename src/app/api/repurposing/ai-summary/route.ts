import { NextRequest, NextResponse } from 'next/server';
import { generateCandidateAISummary } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/network';
import { logSecurityEvent } from '@/lib/securityLogger';
import { DrugConcept, RepurposingCandidate } from '@/types';

const MAX_PAYLOAD_BYTES = 50 * 1024; // 50 KB

function isValidDrugConcept(drug: unknown): drug is DrugConcept {
  if (!drug || typeof drug !== 'object') return false;
  const d = drug as Partial<DrugConcept>;
  return (
    typeof d.genericName === 'string' &&
    d.genericName.trim().length > 0 &&
    d.genericName.length <= 100 &&
    Array.isArray(d.approvedIndications)
  );
}

function isValidCandidate(cand: unknown): cand is RepurposingCandidate {
  if (!cand || typeof cand !== 'object') return false;
  const c = cand as Partial<RepurposingCandidate>;
  return (
    typeof c.condition === 'string' &&
    c.condition.trim().length > 0 &&
    c.condition.length <= 150 &&
    Array.isArray(c.clinicalTrials) &&
    Array.isArray(c.citations)
  );
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'localhost';
  const authHeader = request.headers.get('authorization');
  const isAuthenticated = Boolean(authHeader && authHeader.startsWith('Bearer '));

  // Differentiate rate limits: 15/min for anonymous, 40/min for authenticated
  const limitCount = isAuthenticated ? 40 : 15;
  const rateLimit = checkRateLimit(`ai:${isAuthenticated ? 'auth:' : 'anon:'}${ip}`, limitCount, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'AI summary request limit reached. Please wait a moment before submitting further requests.' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
        }
      }
    );
  }

  // 1. Content-Length / payload size check
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    logSecurityEvent({
      eventType: 'PAYLOAD_TOO_LARGE',
      path: '/api/repurposing/ai-summary',
      details: { contentLength },
      statusCode: 413,
    });
    return NextResponse.json(
      { error: 'Payload exceeds maximum allowed size of 50 KB.' },
      { status: 413 }
    );
  }

  try {
    const rawText = await request.text();
    if (rawText.length > MAX_PAYLOAD_BYTES) {
      logSecurityEvent({
        eventType: 'PAYLOAD_TOO_LARGE',
        path: '/api/repurposing/ai-summary',
        details: { bodyLength: rawText.length },
        statusCode: 413,
      });
      return NextResponse.json(
        { error: 'Payload exceeds maximum allowed size of 50 KB.' },
        { status: 413 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const drug = body.drug;
    const candidate = body.candidate;

    if (!isValidDrugConcept(drug) || !isValidCandidate(candidate)) {
      logSecurityEvent({
        eventType: 'INVALID_INPUT_DETECTED',
        path: '/api/repurposing/ai-summary',
        details: { hasDrug: !!drug, hasCandidate: !!candidate },
        statusCode: 400,
      });
      return NextResponse.json(
        { error: 'Invalid payload: Verified drug concept and repurposing candidate objects are required.' },
        { status: 400 }
      );
    }

    const aiSummary = await generateCandidateAISummary(drug, candidate);

    return NextResponse.json({
      aiSummary,
      available: !!aiSummary,
      note: aiSummary ? 'AI-assisted factual synthesis validated against source schema.' : 'AI summary unavailable or unconfigured.'
    });
  } catch (error) {
    logSecurityEvent({
      eventType: 'UPSTREAM_FAILURE',
      path: '/api/repurposing/ai-summary',
      statusCode: 500,
    });
    return NextResponse.json(
      { aiSummary: null, available: false, error: 'Failed to process AI summary request.' },
      { status: 500 }
    );
  }
}

