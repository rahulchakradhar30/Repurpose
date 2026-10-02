import { AISummary, RepurposingCandidate, DrugConcept } from '@/types';

export function validateAISummaryResponse(data: unknown): AISummary | null {
  if (!data || typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;

  if (typeof obj.summary !== 'string' || obj.summary.trim().length === 0) {
    return null;
  }

  if (!Array.isArray(obj.limitations) || !obj.limitations.every(item => typeof item === 'string')) {
    return null;
  }

  if (typeof obj.mechanismExplanation !== 'string') {
    return null;
  }

  if (!Array.isArray(obj.evidenceGaps) || !obj.evidenceGaps.every(item => typeof item === 'string')) {
    return null;
  }

  if (!Array.isArray(obj.sourcesUsed) || !obj.sourcesUsed.every(item => typeof item === 'string')) {
    return null;
  }

  // Safety check: ensure response does not contain dosage or prescription instructions
  const textCheck = (obj.summary + ' ' + obj.mechanismExplanation).toLowerCase();
  const medicalAdviceTriggers = [
    'take orally',
    'take daily',
    'prescribe',
    'recommended dosage',
    'mg daily',
    'mg/day',
    'patients should take',
    'we recommend taking'
  ];

  for (const trigger of medicalAdviceTriggers) {
    if (textCheck.includes(trigger)) {
      console.warn('AI summary rejected: contained potential prescriptive language:', trigger);
      return null;
    }
  }

  return {
    summary: obj.summary.trim(),
    limitations: obj.limitations.map(l => (l as string).trim()),
    mechanismExplanation: obj.mechanismExplanation.trim(),
    evidenceGaps: obj.evidenceGaps.map(g => (g as string).trim()),
    sourcesUsed: obj.sourcesUsed.map(s => (s as string).trim()),
    isAIAssisted: true,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateCandidateAISummary(
  drug: DrugConcept,
  candidate: RepurposingCandidate
): Promise<AISummary | null> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!groqApiKey && !geminiApiKey) {
    // Graceful fallback when no AI API key is configured
    return null;
  }

  // Build compact structured factual payload only
  const structuredEvidence = {
    drug: {
      genericName: drug.genericName,
      drugClass: drug.drugClass,
      mechanism: drug.mechanismOfAction,
      approvedIndications: drug.approvedIndications.slice(0, 3),
    },
    candidateCondition: {
      condition: candidate.condition,
      highestTrialPhase: candidate.highestPhase,
      trialsCount: candidate.clinicalTrials.length,
      citationsCount: candidate.citations.length,
    },
    clinicalTrials: candidate.clinicalTrials.map(t => ({
      sourceId: t.nctId,
      title: t.title,
      phase: t.phase,
      status: t.status,
      sponsor: t.leadSponsor,
    })),
    literatureCitations: candidate.citations.map(c => ({
      sourceId: `PMID:${c.pmid}`,
      title: c.title,
      journal: c.journal,
      pubDate: c.pubDate,
    })),
    evidenceScoreBreakdown: candidate.evidenceScore,
  };

  const systemInstruction = 
    "Use only the supplied structured evidence. Do not add facts, citations, dosages, medical advice, or claims not present in the supplied evidence. If evidence is missing or uncertain, state that clearly. Output strictly valid JSON matching the required schema.";

  const userPrompt = `
Analyze the following verified biomedical evidence for investigating "${drug.genericName}" in the context of "${candidate.condition}".
Return ONLY a valid JSON object with the following structure:
{
  "summary": "Concise 2-3 sentence factual synthesis of verified trials and literature for this condition.",
  "limitations": ["Key limitation 1 (e.g. small sample size, lack of completed phase 3)", "Key limitation 2"],
  "mechanismExplanation": "Concise explanation of proposed biological mechanism strictly based on supplied drug class and targets.",
  "evidenceGaps": ["Critical unanswered question or missing trial data"],
  "sourcesUsed": ["NCT or PMID IDs from the provided facts that directly support this summary"]
}

STRUCTURED EVIDENCE FACTS:
${JSON.stringify(structuredEvidence, null, 2)}
`;

  // 1. Prioritize Groq if configured
  if (groqApiKey && groqApiKey.trim() !== '') {
    try {
      const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey.trim()}`,
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const content = groqData?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          const validated = validateAISummaryResponse(parsed);
          if (validated) return validated;
        }
      } else {
        console.error('Groq API responded with error:', groqRes.status);
      }
    } catch (err) {
      console.error('Groq API invocation error:', err);
    }
  }

  // 2. Fallback to Gemini if configured
  if (geminiApiKey && geminiApiKey.trim() !== '') {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          const parsed = JSON.parse(cleanJson);
          return validateAISummaryResponse(parsed);
        }
      }
    } catch (error) {
      console.error('Gemini processing error:', error);
    }
  }

  return null;
}
