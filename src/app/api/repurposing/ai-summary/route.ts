import { NextRequest, NextResponse } from 'next/server';
import { generateCandidateAISummary } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/network';
import { DrugConcept, RepurposingCandidate } from '@/types';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'localhost';
  const rateLimit = checkRateLimit(`ai:${ip}`, 15, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'AI summary request limit reached. Please try again shortly.' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
        }
      }
    );
  }

  try {
    const body = await request.json();
    const drug: DrugConcept = body.drug;
    const candidate: RepurposingCandidate = body.candidate;

    if (!drug || !candidate) {
      return NextResponse.json(
        { error: 'Invalid payload: drug and candidate objects are required.' },
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
    console.error('AI Summary endpoint error:', error);
    return NextResponse.json(
      { aiSummary: null, available: false, error: 'Failed to process AI summary request.' },
      { status: 500 }
    );
  }
}
