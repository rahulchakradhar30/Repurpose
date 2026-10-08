# Repurpose — Technical Architecture & Data Flow

This document details the architectural design, security boundaries, and data processing workflows powering **Repurpose**.

---

## 1. System Architecture Diagram

```
                       [ Web Client (Browser / PWA) ]
                                     │
                 ┌───────────────────┴───────────────────┐
                 │ HTTPS (TLS 1.3) / CSP / HSTS Preload   │
                 ▼                                       ▼
      [ Next.js Edge Proxy ]                  [ Firebase Auth SDK ]
      • Strict CORS Allowlist                 • Google OAuth 2.0
      • Rate Limiter Token Bucket             • Token Refresh Loop
      • X-Robots Deduplication                           │
                 │                                       ▼
                 ▼                           [ Cloud Firestore DB ]
      [ Next.js Route Handlers ]             • User Private Notebooks
      • /api/drugs/search                    • 30-Day Auto Purge Rules
      • /api/drugs/research                  • Strict Owner UID Rules
      • /api/repurposing/ai-summary                      ▲
                 │                                       │
     ┌───────────┴───────────────────────────────────────┤
     │ Concurrent Upstream Pipeline                      │
     ▼                                                   ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  NLM RxNorm  │ │   openFDA    │ │ClinicalTrials│ │ NCBI PubMed  │ │ PubChem PUG  │
│ REST Service │ │  Drug Labels │ │   .gov v2    │ │  E-utilities │ │     REST     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. Evidence Aggregation & Deterministic Scoring Engine

### Parallel Aggregation
When a user searches or opens an evidence dossier:
1. **RxNorm Normalization:** Identifies the canonical RxCUI, generic active ingredient, and brand synonyms.
2. **Parallel Upstream Dispatch:** Queries openFDA (approved indications and boxed warnings), ClinicalTrials.gov (interventional trial protocols), NCBI PubMed (clinical study citations), and PubChem (chemical structure and pharmacology).
3. **SSRF & Rate Defense:** All upstream URLs are strictly validated against an immutable domain allowlist in `src/lib/network.ts`.
4. **Deterministic Scoring (100 Points):**
   - **Clinical Trial Maturity (0–40):** Phase 4 (36–40 pts), Phase 3 (28–35 pts), Phase 2 (18–26 pts), Phase 1 (6–15 pts). Terminated trials are capped at 4 pts with explicit warnings.
   - **Human Evidence & Literature (0–20):** Based on indexed PubMed PMIDs (4+ citations = 20 pts, 2–3 = 12–16 pts, 1 = 7 pts).
   - **Mechanistic Plausibility (0–20):** Overlap between pharmacological target mechanisms and disease pathophysiology.
   - **Reproducibility & Publication Signals (0–10):** Independent trial sponsors vs. single-center pilot studies.
   - **Safety & Contraindication Compatibility (0–10):** Evaluated against FDA black box warnings and severe adverse reaction profiles.

---

## 3. Strict AI Guardrails & Zero Hallucination Pipeline

When generating AI evidence summaries via Google Gemini (`/api/repurposing/ai-summary`):
1. **Data Pre-flight:** Only deterministic facts gathered from ClinicalTrials.gov, PubMed, and openFDA are injected into the prompt context.
2. **Structural Validation:** The response is validated against strict JSON schemas in `src/lib/gemini.ts`.
3. **Clinical Safety Filter:** An active regex/keyword scanner rejects any generated text containing clinical prescribing instructions, dosages (e.g. `mg`, `take orally`, `BID`), or therapeutic guarantees before it reaches the client.
4. **Resilience:** If AI fails, exceeds rate limits, or is disabled, the application continues to provide 100% functionality from deterministic biomedical records.

---

## 4. Privacy & 30-Day Data Minimization

- **Guest Mode:** Guest users store notebook notes and saved dossiers in browser `localStorage`.
- **Authenticated Mode:** Google authenticated users store notebooks in Cloud Firestore under `/users/{userId}/notebook/{noteId}`.
- **Auto-Purge Lifecycle:** Client and Firestore policies enforce a mandatory 30-day retention limit, automatically expiring stale research records to prevent permanent data accumulation.
- **HIPAA/PHI Prohibition:** The system forbids clinical patient identifiers, operating purely on public drug names and MeSH disease terms.
