import { fetchWithTimeoutAndRetry } from '@/lib/network';
import { SourceProvenance } from '@/types';

export interface RxNormMatch {
  rxcui: string;
  name: string;
  score?: string;
}

export interface RxNormDrugData {
  rxcui: string;
  genericName: string;
  synonyms: string[];
  brandNames: string[];
  provenance: SourceProvenance;
}

export async function searchRxNormAutocomplete(query: string): Promise<Array<{ name: string; rxcui: string }>> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query.trim())}&maxEntries=10`;

  try {
    const res = await fetchWithTimeoutAndRetry(url, { timeoutMs: 5000, retries: 1 });
    if (!res.ok) return [];

    const data = await res.json();
    const candidates = data?.approximateGroup?.candidate;
    if (!Array.isArray(candidates)) return [];

    // Filter unique by name
    const seen = new Set<string>();
    const results: Array<{ name: string; rxcui: string }> = [];

    for (const c of candidates) {
      const name = (c.name || '').trim();
      const rxcui = c.rxcui;
      if (name && rxcui && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        results.push({ name, rxcui });
      }
    }

    return results.slice(0, 8);
  } catch (error) {
    console.error('RxNorm autocomplete error:', error);
    return [];
  }
}

export async function fetchRxNormDetails(drugName: string): Promise<RxNormDrugData | null> {
  const searchUrl = `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(drugName.trim())}&search=2`;

  try {
    const res = await fetchWithTimeoutAndRetry(searchUrl, { timeoutMs: 6000, retries: 2 });
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const rxNormIdList = data?.idGroup?.rxnormId;
    const rxcui = Array.isArray(rxNormIdList) && rxNormIdList.length > 0 ? rxNormIdList[0] : null;

    if (!rxcui) {
      // Fallback: Try approximate term lookup
      const approxUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(drugName.trim())}&maxEntries=1`;
      const approxRes = await fetchWithTimeoutAndRetry(approxUrl, { timeoutMs: 5000, retries: 1 });
      if (approxRes.ok) {
        const approxData = await approxRes.json();
        const candidate = approxData?.approximateGroup?.candidate?.[0];
        if (candidate?.rxcui) {
          return fetchRxNormDetailsByRxcui(candidate.rxcui, candidate.name || drugName);
        }
      }
      return null;
    }

    return fetchRxNormDetailsByRxcui(rxcui, drugName);
  } catch (err) {
    console.error(`RxNorm details error for ${drugName}:`, err);
    return null;
  }
}

async function fetchRxNormDetailsByRxcui(rxcui: string, fallbackName: string): Promise<RxNormDrugData> {
  const timestamp = new Date().toISOString();
  const propUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/allProperties.json?prop=all`;
  const brandsUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?rela=tradename_of`;

  let genericName = fallbackName;
  const brandNames: string[] = [];
  const synonyms: string[] = [];

  try {
    const propRes = await fetchWithTimeoutAndRetry(propUrl, { timeoutMs: 5000, retries: 1 });
    if (propRes.ok) {
      const propData = await propRes.json();
      const props = propData?.propConceptGroup?.propConcept || [];
      for (const p of props) {
        if (p.propName === 'RxNorm Name' && p.propValue) {
          genericName = p.propValue;
        }
        if (p.propName === 'Synonym' && p.propValue) {
          synonyms.push(p.propValue);
        }
      }
    }
  } catch {
    // Continue with what we have
  }

  try {
    const brandRes = await fetchWithTimeoutAndRetry(brandsUrl, { timeoutMs: 5000, retries: 1 });
    if (brandRes.ok) {
      const brandData = await brandRes.json();
      const conceptGroups = brandData?.relatedGroup?.conceptGroup || [];
      for (const g of conceptGroups) {
        const concepts = g.conceptProperties || [];
        for (const c of concepts) {
          if (c.name && !brandNames.includes(c.name)) {
            brandNames.push(c.name);
          }
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  return {
    rxcui,
    genericName,
    synonyms: Array.from(new Set(synonyms)),
    brandNames: Array.from(new Set(brandNames)).slice(0, 8),
    provenance: {
      name: 'RxNorm',
      url: `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`,
      responseId: rxcui,
      timestamp,
      status: 'ok',
    },
  };
}
