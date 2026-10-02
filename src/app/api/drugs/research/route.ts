import { NextRequest, NextResponse } from 'next/server';
import { aggregateDrugResearch } from '@/lib/evidenceEngine';
import { checkRateLimit, sanitizeDrugInput } from '@/lib/network';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawDrug = searchParams.get('drug') || '';
  const drugName = sanitizeDrugInput(rawDrug);

  const ip = request.headers.get('x-forwarded-for') || 'localhost';
  const rateLimit = checkRateLimit(`research:${ip}`, 20, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Public biomedical sources recommend throttling requests. Please wait a moment.' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
        }
      }
    );
  }

  if (!drugName || drugName.length < 2) {
    return NextResponse.json(
      { error: 'A valid drug name parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const snapshot = await aggregateDrugResearch(drugName);
    
    if (!snapshot) {
      return NextResponse.json(
        { error: 'No verified drug entity found matching this query in biomedical databases.' },
        { status: 404 }
      );
    }

    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('Drug research aggregation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while communicating with biomedical data sources.' },
      { status: 500 }
    );
  }
}
