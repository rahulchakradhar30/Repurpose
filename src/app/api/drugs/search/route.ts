import { NextRequest, NextResponse } from 'next/server';
import { searchRxNormAutocomplete } from '@/lib/sources/rxnorm';
import { searchDrugDirectory } from '@/lib/drugDirectory';
import { checkRateLimit, sanitizeDrugInput } from '@/lib/network';

export interface SearchSuggestionItem {
  name: string;
  genericName: string;
  brandNames?: string[];
  drugClass?: string;
  rxcui?: string;
  matchedOn?: 'generic' | 'brand';
  matchedTerm?: string;
  source: 'directory' | 'rxnorm';
}

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

  // Strict 3-character minimum requirement
  if (query.length < 3) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Instant local directory prefix elimination matching
    const dirResults = searchDrugDirectory(query, 8);
    const seenNames = new Set<string>();

    const results: SearchSuggestionItem[] = dirResults.map((item) => {
      seenNames.add(item.name.toLowerCase());
      if (item.genericName) seenNames.add(item.genericName.toLowerCase());
      if (item.matchedTerm) seenNames.add(item.matchedTerm.toLowerCase());

      return {
        name: item.matchedOn === 'brand' && item.matchedTerm ? item.matchedTerm : item.name,
        genericName: item.genericName,
        brandNames: item.brandNames,
        drugClass: item.drugClass,
        rxcui: item.rxcui,
        matchedOn: item.matchedOn || 'generic',
        matchedTerm: item.matchedTerm || item.name,
        source: 'directory' as const,
      };
    });

    // 2. Supplement with remote RxNorm autocomplete if fewer than 8 directory matches
    if (results.length < 8) {
      const rxNormMatches = await searchRxNormAutocomplete(query);
      for (const rx of rxNormMatches) {
        if (results.length >= 8) break;
        const lowerName = rx.name.toLowerCase();
        if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          results.push({
            name: rx.name,
            genericName: rx.name,
            rxcui: rx.rxcui,
            matchedOn: 'generic',
            matchedTerm: rx.name,
            source: 'rxnorm' as const,
          });
        }
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Drug search API error:', error);
    return NextResponse.json({ error: 'Failed to search drug directory' }, { status: 500 });
  }
}
