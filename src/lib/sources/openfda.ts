import { fetchWithTimeoutAndRetry } from '@/lib/network';
import { SourceProvenance } from '@/types';
import { filterDistinctBrandNames } from '@/lib/normalization';

export interface OpenFDALabelData {
  approvedIndications: string[];
  warnings: string[];
  contraindications: string[];
  drugClass?: string;
  mechanismOfAction?: string;
  brandNames: string[];
  provenance: SourceProvenance;
}

function cleanFDASection(textArray?: string[]): string[] {
  if (!textArray || !Array.isArray(textArray) || textArray.length === 0) return [];
  const full = textArray.join(' ');
  // Split by bullet points or common section headings if present, or clean paragraphs
  const cleaned = full
    .replace(/INDICATIONS AND USAGE:?/i, '')
    .replace(/CONTRAINDICATIONS:?/i, '')
    .replace(/WARNINGS AND PRECAUTIONS:?/i, '')
    .trim();

  // If long text, extract key bulleted or numbered sentences, or keep up to 300 words
  const sentences = cleaned.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 15);
  return sentences.slice(0, 5);
}

export async function fetchOpenFDALabel(drugName: string): Promise<OpenFDALabelData | null> {
  const timestamp = new Date().toISOString();
  const cleanName = drugName.trim().replace(/[^\w\s-]/g, '');
  
  // Search openfda by generic_name or brand_name
  const searchUrl = `https://api.fda.gov/drug/label.json?search=(openfda.generic_name:"${encodeURIComponent(cleanName)}"+openfda.brand_name:"${encodeURIComponent(cleanName)}")&limit=1`;

  try {
    const res = await fetchWithTimeoutAndRetry(searchUrl, { timeoutMs: 6500, retries: 1 });
    if (!res.ok) {
      return {
        approvedIndications: [],
        warnings: [],
        contraindications: [],
        brandNames: [],
        provenance: {
          name: 'openFDA',
          url: `https://open.fda.gov/apis/drug/label/`,
          timestamp,
          status: 'unavailable',
          statusMessage: 'No verified FDA structured product label found for this exact identifier',
        },
      };
    }

    const data = await res.json();
    const result = data?.results?.[0];
    if (!result) return null;

    const openfda = result.openfda || {};
    const indications = cleanFDASection(result.indications_and_usage);
    const contraindications = cleanFDASection(result.contraindications);
    const warnings = cleanFDASection(result.boxed_warning || result.warnings_and_cautions || result.warnings);

    let pharmClass = openfda.pharm_class_epc?.[0] || openfda.pharm_class_moa?.[0] || openfda.pharm_class_cs?.[0];
    if (pharmClass) {
      pharmClass = pharmClass.replace(/\s*\[(EPC|MoA|CS|PE)\]/gi, '').trim();
    }
    const moaText = cleanFDASection(result.mechanism_of_action || result.clinical_pharmacology)?.[0];
    const rawBrandNames: string[] = Array.isArray(openfda.brand_name) ? openfda.brand_name : [];
    const brandNames = filterDistinctBrandNames(rawBrandNames, cleanName).slice(0, 6);

    return {
      approvedIndications: indications.length > 0 ? indications : ['FDA label indications available in official prescribing insert.'],
      warnings,
      contraindications,
      drugClass: pharmClass,
      mechanismOfAction: moaText,
      brandNames,
      provenance: {
        name: 'openFDA',
        url: `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(cleanName)}`,
        responseId: result.id || openfda.spl_id?.[0],
        timestamp,
        status: 'ok',
      },
    };
  } catch (error) {
    console.error(`openFDA error for ${drugName}:`, error);
    return {
      approvedIndications: [],
      warnings: [],
      contraindications: [],
      brandNames: [],
      provenance: {
        name: 'openFDA',
        url: `https://open.fda.gov/apis/drug/label/`,
        timestamp,
        status: 'unavailable',
        statusMessage: 'Official FDA label service query timed out or returned no records',
      },
    };
  }
}
