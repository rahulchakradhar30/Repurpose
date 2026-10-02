import { ShieldAlert, Database, Scale, Cpu, CheckCircle } from 'lucide-react';

export function AboutView() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 text-slate-800">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
          About Repurpose & Evidence Methodology
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          An open educational and research-support platform for pharmacy students, medicinal chemists, and clinical pharmacologists to evaluate evidence-based drug repurposing opportunities.
        </p>
      </div>

      {/* Mandatory Regulatory & Medical Disclaimer Box */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs sm:text-sm text-amber-950">
            <h2 className="font-bold text-amber-900 text-sm sm:text-base">
              Educational & Research Purpose Only
            </h2>
            <p className="leading-relaxed">
              <strong>Repurpose is strictly an educational research platform.</strong> It does not provide medical advice, diagnosis, treatment recommendations, or prescribing guidelines. Drug repurposing hypotheses must undergo rigorous preclinical validation and formal randomized clinical trials before any clinical translation.
            </p>
            <p className="leading-relaxed font-semibold">
              Always verify all findings against primary peer-reviewed medical literature and consult licensed healthcare professionals for medical care.
            </p>
          </div>
        </div>
      </div>

      {/* 100-Point Transparent Evidence Score Breakdown */}
      <section aria-labelledby="scoring-methodology-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-800" />
          <h2 id="scoring-methodology-heading" className="text-lg font-bold text-slate-900">
            Transparent 100-Point Evidence Scoring Formula
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600">
          The Repurpose Evidence Score is deterministic and transparent. A high score signifies mature registered trials and indexed literature—it never guarantees clinical efficacy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-900 text-sm">1. Clinical Trial Evidence</span>
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                0 – 40 pts
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Assesses active and completed interventional trials registered in ClinicalTrials.gov API v2.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Phase 4 completed / active: 36–40 pts</li>
              <li>Phase 3 completed / active: 28–35 pts</li>
              <li>Phase 2 completed / active: 18–26 pts</li>
              <li>Phase 1 / Early Phase 1: 6–15 pts</li>
              <li>Terminated or withdrawn trials: capped at 4 pts with explicit stopped-trial warning</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-900 text-sm">2. Human / Observational Evidence</span>
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                0 – 20 pts
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Based on verified peer-reviewed publications indexed in NCBI PubMed.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>4+ indexed peer-reviewed citations: 20 pts</li>
              <li>2–3 indexed peer-reviewed citations: 12–16 pts</li>
              <li>1 indexed citation: 7 pts</li>
              <li>0 citations: 0 pts with &quot;Human evidence unavailable&quot; flag</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-900 text-sm">3. Mechanistic & Target Plausibility</span>
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                0 – 20 pts
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Evaluates documented pharmacological target interaction against disease pathophysiology.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Well-characterized pathway & target overlap: 20 pts</li>
              <li>Hypothesized or secondary mechanism: 14 pts</li>
              <li>Inferred or uncharacterized: 5 pts</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-900 text-sm">4. Reproducibility & Publication Signals</span>
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                0 – 10 pts
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Measures trial diversity across multiple independent academic and clinical sponsors.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Multiple independent study sponsors: 10 pts</li>
              <li>Single sponsor / single institution investigation: 6 pts</li>
              <li>Single pilot study: 2 pts</li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs sm:col-span-2">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-bold text-slate-900 text-sm">5. Safety & Contraindication Compatibility</span>
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                0 – 10 pts
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              Cross-checked against official FDA structured product labeling (warnings and contraindications).
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Compatible profile without condition-specific contraindication: 9–10 pts</li>
              <li>Specific boxed warning or organ toxicity monitoring needed: 5 pts</li>
              <li>Direct contraindication conflict with target disease: reduced to 1 pt with high-risk alert</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Trusted Live-Data Workflow */}
      <section aria-labelledby="live-data-sources-heading" className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-800" />
          <h2 id="live-data-sources-heading" className="text-lg font-bold text-slate-900">
            Trusted Live Biomedical Sources & Integrity Rules
          </h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 text-xs sm:text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle className="w-4 h-4 text-teal-700" />
              <span>RxNorm (National Library of Medicine)</span>
            </div>
            <p className="text-slate-600 text-xs pl-6">
              Normalizes drug names, identifies standardized generic ingredients, and resolves RxCUI identifiers.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle className="w-4 h-4 text-teal-700" />
              <span>openFDA & DailyMed (U.S. Food and Drug Administration)</span>
            </div>
            <p className="text-slate-600 text-xs pl-6">
              Retrieves current approved indications, boxed warnings, contraindications, and established pharmacological class.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle className="w-4 h-4 text-teal-700" />
              <span>ClinicalTrials.gov API v2</span>
            </div>
            <p className="text-slate-600 text-xs pl-6">
              Live protocol inspection for active, recruiting, completed, and terminated interventional studies exploring novel indications.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle className="w-4 h-4 text-teal-700" />
              <span>NCBI PubMed (E-utilities)</span>
            </div>
            <p className="text-slate-600 text-xs pl-6">
              Indexes peer-reviewed clinical citations with verifiable PMIDs, titles, journals, and DOI links.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle className="w-4 h-4 text-teal-700" />
              <span>PubChem (NCBI)</span>
            </div>
            <p className="text-slate-600 text-xs pl-6">
              Provides chemical structure identifiers (CID), pharmacological descriptions, and target interactions.
            </p>
          </div>
        </div>
      </section>

      {/* AI Principles */}
      <section aria-labelledby="ai-principles-heading" className="space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-teal-800" />
          <h2 id="ai-principles-heading" className="text-lg font-bold text-slate-900">
            Strict AI Boundaries & Source Determinism
          </h2>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-xs sm:text-sm space-y-2 text-slate-700">
          <p>
            Repurpose adheres to strict biomedical integrity standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>No synthetic or fabricated facts:</strong> The large language model (Gemini) is only invoked after deterministic data retrieval, receiving exclusively verified trial IDs, PubMed records, and FDA label excerpts.</li>
            <li><strong>Strict JSON Schema Enforcement:</strong> Responses are validated programmatically. Any unverified hallucination or non-conforming JSON is instantly rejected.</li>
            <li><strong>Zero Medical Advice:</strong> The model is constrained against emitting dosages, prescribing guidelines, or clinical efficacy assurances.</li>
            <li><strong>Transparent Attribution:</strong> All AI-assisted summaries are explicitly badged with direct links to supporting source records.</li>
            <li><strong>Full Utility Without AI:</strong> The application functions completely when AI is disabled or when no API key is provided.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
