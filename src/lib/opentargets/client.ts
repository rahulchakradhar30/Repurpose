/**
 * Open Targets Platform API v4 GraphQL Client
 * Evaluates target-disease associations and genetic evidence for drug repurposing.
 * Data license: CC0 (Creative Commons Public Domain Dedication).
 * Endpoint: https://api.platform.opentargets.org/api/v4/graphql
 */

export interface OpenTargetsAssociation {
  diseaseId: string;
  diseaseName: string;
  score: number;
  datatypeScores: Array<{
    id: string;
    score: number;
  }>;
}

export interface OpenTargetsTargetResult {
  id: string; // Ensembl ID
  approvedSymbol: string;
  approvedName: string;
  biotype: string;
  associatedDiseases: OpenTargetsAssociation[];
}

const OPEN_TARGETS_GQL_ENDPOINT = 'https://api.platform.opentargets.org/api/v4/graphql';

const TARGET_ASSOCIATIONS_QUERY = `
  query TargetAssociationsQuery($symbol: String!, $size: Int!) {
    search(queryString: $symbol, entityNames: ["target"], page: { size: 1, index: 0 }) {
      hits {
        id
        name
        entity
        object {
          ... on Target {
            id
            approvedSymbol
            approvedName
            biotype
            associatedDiseases(page: { size: $size, index: 0 }) {
              count
              rows {
                disease {
                  id
                  name
                }
                score
                datatypeScores {
                  id
                  score
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches target-disease association evidence from Open Targets Platform GraphQL API.
 * Returns null if target cannot be found or if network request fails.
 */
export async function fetchOpenTargetsAssociations(
  targetSymbol: string,
  maxDiseases: number = 5
): Promise<OpenTargetsTargetResult | null> {
  const cleanSymbol = targetSymbol.trim().toUpperCase();
  if (!cleanSymbol) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(OPEN_TARGETS_GQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'RepurposeBiomedicalResearch/1.0 (educational-research; contact: hello@rahulchakradhar.dev)',
      },
      body: JSON.stringify({
        query: TARGET_ASSOCIATIONS_QUERY,
        variables: {
          symbol: cleanSymbol,
          size: maxDiseases,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Open Targets API responded with status ${res.status}`);
      return null;
    }

    const json = await res.json();
    const hits = json?.data?.search?.hits;
    if (!hits || !hits.length) {
      return null;
    }

    const targetObj = hits[0]?.object;
    if (!targetObj || !targetObj.approvedSymbol) {
      return null;
    }

    const rawRows = targetObj.associatedDiseases?.rows || [];
    const associatedDiseases: OpenTargetsAssociation[] = rawRows.map((row: {
      disease?: { id?: string; name?: string };
      score?: number;
      datatypeScores?: Array<{ id?: string; score?: number }>;
    }) => ({
      diseaseId: row.disease?.id || 'Unknown',
      diseaseName: row.disease?.name || 'Unspecified Condition',
      score: typeof row.score === 'number' ? Math.round(row.score * 100) / 100 : 0,
      datatypeScores: Array.isArray(row.datatypeScores)
        ? row.datatypeScores.map((dt) => ({
            id: dt.id || 'unknown',
            score: typeof dt.score === 'number' ? Math.round(dt.score * 100) / 100 : 0,
          }))
        : [],
    }));

    return {
      id: targetObj.id || cleanSymbol,
      approvedSymbol: targetObj.approvedSymbol,
      approvedName: targetObj.approvedName || cleanSymbol,
      biotype: targetObj.biotype || 'protein_coding',
      associatedDiseases,
    };
  } catch (err: unknown) {
    console.warn(`Open Targets query error for ${cleanSymbol}:`, (err as Error).message);
    return null;
  }
}
