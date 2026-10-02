# Repurpose — Evidence-Based Drug Repurposing Explorer

> **Mandatory Research Disclaimer:**  
> **For education and research only.** This tool does not provide medical advice, diagnosis, or treatment recommendations. Never use this application for clinical decision-making. Verify all findings with primary literature and qualified healthcare professionals.

---

## 1. Overview & Philosophy

**Repurpose** is a production-quality, installable Progressive Web Application (PWA) tailored for pharmacy students, medicinal chemists, and biomedical researchers to explore evidence-based drug repurposing opportunities.

Unlike generative chatbots that fabricate studies or hallucinate medical claims, **Repurpose enforces strict deterministic biomedical retrieval**:
- **Zero Mock / Fabricated Data:** Real live queries to RxNorm, openFDA, PubChem, ClinicalTrials.gov API v2, and NCBI PubMed.
- **Source-Level Failure Isolation:** If a source cannot return data, a transparent *"No verified evidence available from this source"* state is displayed.
- **Separation of Approved vs. Investigational Indications:** Clearly separates FDA-approved labeled indications from investigational, off-label, or preclinical exploration.
- **Transparent 100-Point Evidence Score:** Deterministic breakdown with visible contributing factors and uncertainty flags.
- **Strict Guardrails for AI:** Gemini is invoked strictly server-side after deterministic retrieval, restricted by schema validation and a prompt that strictly forbids adding unverified facts, dosages, or advice.
- **Offline Clinical Data Integrity:** The PWA caches its app shell for instant loading, but **never caches clinical results as current when offline** to prevent researchers from consulting stale regulatory data.

---

## 2. Live Biomedical Data Pipeline

When a user searches for an active pharmaceutical ingredient (e.g. *Metformin*, *Imatinib*, *Thalidomide*):

```
User Query
    │
    ▼
[RxNorm (NLM)] ──► Normalizes drug entity, extracts generic ingredient & RxCUI
    │
    ├─► [openFDA / DailyMed] ──────► Approved indications, boxed warnings, contraindications, MoA
    ├─► [PubChem (NCBI)] ─────────► Compound ID (CID), chemical structure, bioactivity summary
    ├─► [ClinicalTrials.gov v2] ──► Mapped interventional studies (phases, recruitment, sponsors)
    └─► [NCBI PubMed E-utilities] ─► Peer-reviewed clinical citations, PMIDs, DOIs, journals
    │
    ▼
[Evidence Synthesizer & Scoring Engine] ──► Categorization & 100-point transparent score
    │
    ▼ (Optional Server-Side Gemini)
[Schema-Validated AI Synthesis] ──► Factual summary strictly constrained to retrieved evidence
```

---

## 3. Transparent 100-Point Evidence Scoring Algorithm

Repurpose employs a 5-pillar scoring model out of 100 points:

| Dimension | Points | Evaluation Criteria |
| :--- | :--- | :--- |
| **Clinical Trial Evidence** | **0 – 40** | Phase progression, completion status, and active interventional trials registered in ClinicalTrials.gov (Phase 4: 36–40, Phase 3: 28–35, Phase 2: 18–26, Phase 1: 6–15). Terminated/withdrawn trials are penalized and capped at 4 points. |
| **Human / Observational Evidence** | **0 – 20** | Peer-reviewed clinical literature indexed in NCBI PubMed (4+ citations: 20, 2–3: 12–16, 1: 7, 0: 0). |
| **Mechanistic & Target Plausibility** | **0 – 20** | Documented drug mechanism (e.g., AMPK activation, tyrosine kinase inhibition) aligned with disease pathophysiology. |
| **Reproducibility & Publication Signals**| **0 – 10** | Cross-institutional replication across multiple distinct academic and clinical sponsors. |
| **Safety & Contraindication Compatibility**| **0 – 10** | Safety profile reviewed against FDA boxed warnings and contraindications. Direct contraindication collision with target condition penalizes score to 1 point. |

### Uncertainty Badges & Caution Language
Candidates are tagged with prominent uncertainty badges:
- `Evidence is preliminary` (Early Phase 1 or pilot data only)
- `Human evidence unavailable` (No PubMed citations indexed for pairing)
- `Trial stopped` (Prematurely terminated, withdrawn, or suspended trials)
- `Safety alert` (FDA label lists condition or target organ as a contraindication)

*Candidates are never labeled "effective" merely because they have a high score.*

---

## 4. Technology Stack & Design Direction

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Vanilla Tailwind CSS with a calm clinical palette:
  - Deep ink navy (`#0f172a`), warm off-white (`#f8fafc`), muted teal (`#0f766e`), restrained rust (`#c2410c`)
  - Flat surfaces only: **No gradients, no neon glows, no AI sparkles, no chatbot bubbles, no robot illustrations**
  - Minimum 44px touch targets, visible focus rings, ARIA labels for full WCAG accessibility
- **Mobile-First PWA:** Web App Manifest (`manifest.json`), service worker (`sw.js`), offline app shell (`offline.html`), and installation prompt.
- **Authentication & Database:** Firebase Authentication (Google Sign-In & Anonymous Guest access) + Cloud Firestore, with automatic fallback to persistent browser local storage.
- **Testing:** Vitest test suite covering scoring formulas, input sanitization, rate limiters, AI JSON schema validators, and integration fixtures.

---

## 5. Local Setup & Configuration

### Prerequisites
- Node.js 20+ (Node 24 tested)
- npm 10+

### Installation
```bash
git clone <repository-url>
cd Repurpose
npm install --legacy-peer-deps
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in the optional variables:
- `GEMINI_API_KEY`: Server-side API key for Google Gemini (App runs fully without it).
- `NEXT_PUBLIC_FIREBASE_*`: Firebase project credentials for cross-device synchronization (App runs in local guest mode if omitted).

### Run Test Suite
```bash
npm test
```

### Run Production Build
```bash
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Firebase Firestore Security Rules

Deploy the included `firestore.rules` file to your Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /saved_drugs/{drugId} {
        allow read, write, delete: if request.auth != null && request.auth.uid == userId;
      }

      match /searches/{searchId} {
        allow read, write, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 7. Deployment to Vercel

### Deploying via GitHub to Vercel (Recommended)
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the GitHub repository.
3. In the Environment Variables settings, add:
   - `GEMINI_API_KEY` (optional)
   - `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, etc. (optional)
4. Click **Deploy**. Vercel will build and serve the App Router project and serverless API endpoints.

---

## 8. Exporting Research

Repurpose includes built-in academic citation export tools:
- **RIS Format (`.ris`):** Import direct PubMed citations and clinical trial reports into **Zotero, Mendeley, or EndNote**.
- **CSV Format (`.csv`):** Export complete candidate evaluation spreadsheets with scores, phases, trial IDs, and notes for spreadsheet analysis.

---

## 9. Known Limitations & Research Boundaries

1. **DrugBank Data Policy:** In adherence to licensing terms, DrugBank data is **not** used. All compound data is derived from open public registries (RxNorm, openFDA, PubChem).
2. **Rate Limits on Public Registries:** NCBI PubMed and openFDA have public request limits (max 3 req/sec). In-memory rate limiting and exponential backoff are built-in to prevent IP throttling.
3. **No Direct Clinical Application:** Evidence scores measure research maturity and biological hypothesis plausibility. A high score does not imply that an off-label drug is safe or clinically effective for a patient.
