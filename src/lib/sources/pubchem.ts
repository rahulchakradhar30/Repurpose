import { fetchWithTimeoutAndRetry } from '@/lib/network';
import { SourceProvenance } from '@/types';

export interface PubChemData {
  cid: string;
  description?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  iupacName?: string;
  provenance: SourceProvenance;
}

export async function fetchPubChemData(drugName: string): Promise<PubChemData | null> {
  const timestamp = new Date().toISOString();
  const cleanName = drugName.trim();

  try {
    // 1. Get CID
    const cidUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanName)}/cids/JSON`;
    const cidRes = await fetchWithTimeoutAndRetry(cidUrl, { timeoutMs: 5000, retries: 1 });
    
    if (!cidRes.ok) {
      return {
        cid: '',
        provenance: {
          name: 'PubChem',
          url: 'https://pubchem.ncbi.nlm.nih.gov/',
          timestamp,
          status: 'unavailable',
          statusMessage: 'No compound record verified in PubChem database for this term',
        },
      };
    }

    const cidData = await cidRes.json();
    const cidList = cidData?.IdentifierList?.CID;
    if (!Array.isArray(cidList) || cidList.length === 0) {
      return null;
    }

    const cid = String(cidList[0]);

    // 2. Get description
    const descUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/description/JSON`;
    let description = '';

    try {
      const descRes = await fetchWithTimeoutAndRetry(descUrl, { timeoutMs: 5000, retries: 1 });
      if (descRes.ok) {
        const descData = await descRes.json();
        const descriptions = descData?.InformationList?.Information || [];
        for (const item of descriptions) {
          if (item.Description && item.Description.length > 30) {
            description = item.Description;
            break;
          }
        }
      }
    } catch {
      // Continue without full description
    }

    return {
      cid,
      description,
      provenance: {
        name: 'PubChem',
        url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
        responseId: cid,
        timestamp,
        status: 'ok',
      },
    };
  } catch (error) {
    console.error(`PubChem error for ${drugName}:`, error);
    return {
      cid: '',
      provenance: {
        name: 'PubChem',
        url: 'https://pubchem.ncbi.nlm.nih.gov/',
        timestamp,
        status: 'unavailable',
        statusMessage: 'PubChem API service connection failed or timed out',
      },
    };
  }
}
