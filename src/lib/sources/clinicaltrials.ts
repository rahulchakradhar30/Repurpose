import { fetchWithTimeoutAndRetry } from '@/lib/network';
import { ClinicalTrial, SourceProvenance } from '@/types';

export interface ClinicalTrialsResponse {
  trials: ClinicalTrial[];
  conditionMap: Record<string, ClinicalTrial[]>;
  totalStudiesCount: number;
  provenance: SourceProvenance;
}

export async function fetchClinicalTrials(drugName: string): Promise<ClinicalTrialsResponse> {
  const timestamp = new Date().toISOString();
  const cleanName = drugName.trim();
  const url = `https://clinicaltrials.gov/api/v2/studies?query.intr=${encodeURIComponent(cleanName)}&pageSize=40&countTotal=true`;

  try {
    const res = await fetchWithTimeoutAndRetry(url, { timeoutMs: 9000, retries: 1 });
    if (!res.ok) {
      return {
        trials: [],
        conditionMap: {},
        totalStudiesCount: 0,
        provenance: {
          name: 'ClinicalTrials.gov',
          url: `https://clinicaltrials.gov/search?intr=${encodeURIComponent(cleanName)}`,
          timestamp,
          status: 'unavailable',
          statusMessage: 'ClinicalTrials.gov API v2 responded with non-200 code',
        },
      };
    }

    const data = await res.json();
    const studies = data?.studies || [];
    const totalCount = data?.totalCount || studies.length;

    const trials: ClinicalTrial[] = [];
    const conditionMap: Record<string, ClinicalTrial[]> = {};

    for (const study of studies) {
      const proto = study.protocolSection;
      if (!proto) continue;

      const nctId = proto.identificationModule?.nctId || '';
      const title = proto.identificationModule?.briefTitle || 'Untitled Clinical Study';
      const status = proto.statusModule?.overallStatus || 'UNKNOWN';
      const phases = proto.designModule?.phases || ['EARLY_PHASE1'];
      const conditions: string[] = proto.conditionsModule?.conditions || [];
      const sponsor = proto.sponsorCollaboratorsModule?.leadSponsor?.name || 'Academic / Institutional Sponsor';
      const completionDate = proto.statusModule?.completionDateStruct?.date;
      const briefSummary = proto.descriptionModule?.briefSummary || '';

      const phaseStr = phases.join(', ').replace(/_/g, ' ');

      const trial: ClinicalTrial = {
        nctId,
        title,
        phase: phaseStr || 'Not Specified',
        status,
        conditions,
        leadSponsor: sponsor,
        studyUrl: `https://clinicaltrials.gov/study/${nctId}`,
        completionDate,
        briefSummary: briefSummary.slice(0, 300),
      };

      trials.push(trial);

      // Map trial to each clean condition
      for (const rawCond of conditions) {
        const cond = cleanConditionName(rawCond);
        if (cond.length > 2 && !isGenericPlaceholder(cond)) {
          if (!conditionMap[cond]) {
            conditionMap[cond] = [];
          }
          conditionMap[cond].push(trial);
        }
      }
    }

    return {
      trials,
      conditionMap,
      totalStudiesCount: totalCount,
      provenance: {
        name: 'ClinicalTrials.gov',
        url: `https://clinicaltrials.gov/search?intr=${encodeURIComponent(cleanName)}`,
        responseId: `${totalCount} records`,
        timestamp,
        status: 'ok',
      },
    };
  } catch (error) {
    console.error(`ClinicalTrials.gov error for ${drugName}:`, error);
    return {
      trials: [],
      conditionMap: {},
      totalStudiesCount: 0,
      provenance: {
        name: 'ClinicalTrials.gov',
        url: `https://clinicaltrials.gov/search?intr=${encodeURIComponent(cleanName)}`,
        timestamp,
        status: 'unavailable',
        statusMessage: 'ClinicalTrials.gov API query timed out or failed to connect',
      },
    };
  }
}

function cleanConditionName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^the\s+/i, '')
    // Capitalize first letter of each word
    .split(' ')
    .map(w => w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())
    .join(' ');
}

function isGenericPlaceholder(condition: string): boolean {
  const genericTerms = [
    'healthy',
    'healthy volunteer',
    'healthy volunteers',
    'volunteers',
    'pharmacokinetics',
    'safety',
    'bioavailability',
    'drug interaction',
    'tolerability',
    'adverse events',
    'normal',
    'controls'
  ];
  return genericTerms.includes(condition.toLowerCase());
}
