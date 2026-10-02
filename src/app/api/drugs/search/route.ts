import { NextRequest, NextResponse } from 'next/server';
import { searchRxNormAutocomplete } from '@/lib/sources/rxnorm';
import { checkRateLimit, sanitizeDrugInput } from '@/lib/network';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q') || '';
  const query = sanitizeDrugInput(rawQuery);

  // Client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'localhost';
  const rateLimit = checkRateLimit(`search:${ip}`, 45, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a few seconds before searching again.' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
        }
      }
    );
  }

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchRxNormAutocomplete(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Drug search API error:', error);
    return NextResponse.json({ error: 'Failed to search drug directory' }, { status: 500 });
  }
}
