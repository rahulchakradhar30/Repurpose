import { describe, it, expect } from 'vitest';
import { validateAISummaryResponse } from '@/lib/gemini';

describe('Gemini AI Output Schema & Safety Validator', () => {
  it('validates and accepts strictly structured factual JSON', () => {
    const validPayload = {
      summary: 'Metformin has been investigated in oncology trials due to AMPK-dependent inhibition of mTOR signaling.',
      limitations: ['Heterogeneous patient cohorts', 'Lack of Phase 3 primary survival endpoint replication'],
      mechanismExplanation: 'Activates cellular AMP-activated protein kinase and reduces circulating insulin/IGF-1 levels.',
      evidenceGaps: ['Optimal molecular biomarker selection in prospective randomized trials'],
      sourcesUsed: ['NCT01101438', 'PMID:31234567'],
    };

    const validated = validateAISummaryResponse(validPayload);
    expect(validated).not.toBeNull();
    expect(validated?.summary).toBe(validPayload.summary);
    expect(validated?.limitations.length).toBe(2);
    expect(validated?.isAIAssisted).toBe(true);
  });

  it('rejects payloads missing mandatory fields or invalid structures', () => {
    expect(validateAISummaryResponse(null)).toBeNull();
    expect(validateAISummaryResponse({})).toBeNull();
    expect(validateAISummaryResponse({ summary: '' })).toBeNull();
    expect(validateAISummaryResponse({ summary: 'Valid', limitations: 'Not an array' })).toBeNull();
    expect(validateAISummaryResponse({ summary: 'Valid', limitations: [], mechanismExplanation: 123 })).toBeNull();
  });

  it('rejects outputs containing prescriptive clinical instructions or dosages', () => {
    const prescriptivePayload = {
      summary: 'Patients should take orally 500mg daily to observe potential anti-neoplastic benefits.',
      limitations: [],
      mechanismExplanation: 'AMPK activation.',
      evidenceGaps: [],
      sourcesUsed: ['NCT01101438'],
    };

    const validated = validateAISummaryResponse(prescriptivePayload);
    expect(validated).toBeNull();
  });
});
