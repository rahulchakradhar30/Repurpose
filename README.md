# Repurpose — Open-Source Evidence Workspace for Drug Repurposing

> **Mandatory Biomedical Research Notice:**  
> **For scientific exploration and educational research only.** Repurpose is an academic computational research workspace. It does not provide medical diagnoses, treatment recommendations, prescribing guidance, dose recommendations, or claims of clinical efficacy. Drug repurposing hypotheses must undergo rigorous preclinical validation and formal randomized clinical trials before any clinical translation.

---

## 1. Product Positioning

**Repurpose** is positioned strictly as:

> “An open-source evidence workspace for investigating drug-repurposing hypotheses through transparent clinical, biological, regulatory, safety, and literature evidence.”

The platform does not claim to be the first, largest, or best drug-repurposing database. Instead, it prioritizes **epistemic integrity, source-linked provenance, and methodological transparency**.

---

## 2. Core Differentiating Feature: Repurpose Compass™

The **Repurpose Compass™** is a source-linked research navigation and evidence alignment system generated for every evaluated drug–condition hypothesis. It consists of five tightly integrated pillars:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REPURPOSE COMPASS™                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. RESEARCH STATE                                                           │
│    Approved indication │ Off-label evidence │ Investigational │ Preclinical │
│    Insufficient evidence │ Conflicting evidence │ Trial terminated/withdrawn│
│    No verified evidence found                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. TRANSPARENT RESEARCH READINESS SCORE (0 - 100)                           │
│    • Clinical-Trial Maturity & Status:          0 – 25 pts                  │
│    • Published Human Evidence:                  0 – 25 pts                  │
│    • Mechanistic / Target Plausibility:         0 – 20 pts                  │
│    • Source Quality, Recency & Reproducibility: 0 – 15 pts                  │
│    • Safety & Context Compatibility:            0 – 15 pts                  │
│    • Evidence-Conflict Penalties:               Deductions (up to -15 pts)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. WHAT NEEDS VERIFICATION? (CONTRADICTION DETECTION)                       │
│    • Trial registered but zero published outcome found                      │
│    • High trial phase (Phase 2/3) without confirmed published results       │
│    • Discontinued, terminated, or withdrawn study protocols                 │
│    • Direct intersection with FDA product label contraindications           │
│    • Uncharacterized or inferred molecular targets                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. CHRONOLOGICAL SOURCE-PROVENANCE TIMELINE                                 │
│    Directly attributable events from RxNorm, openFDA, ClinicalTrials.gov,   │
│    and PubMed with persistent source URLs and identifiers.                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. DETERMINISTIC NON-CLINICAL RESEARCH CHECKLIST                            │
│    Actionable, reproducible steps for literature review, trial record audit,│
│    pathway verification, and citation export. (No patient care advice).     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Transparent Research Readiness Scoring Safeguards
- **Empirical Metric:** The Research Readiness Score measures the maturity and corroboration of public evidence. It is **not** an efficacy, safety, or prescribing score.
- **Published Citation Mandate:** A candidate with zero published peer-reviewed citations is **permanently capped at max 55/100** and will **never** receive a "High readiness" tier.
- **Trial Existence vs. Outcomes:** Registered clinical trials demonstrate ongoing research intent, not clinical efficacy. Candidates with active Phase 2/3 trials lacking indexed PubMed papers are explicitly flagged with:  
  *“Clinical trial activity identified; published outcome evidence unavailable.”*
- **Penalization for Terminations:** Studies terminated, withdrawn, or suspended deduct up to 15 points and trigger prominent visual warnings.
- **Visible Justification:** Every single score component displays the exact human-readable reason for its score.

---

## 3. Unified Research Features

### A. Normalized Drug & Disease Search
- Normalizes generic drug names, brand names, aliases, and salt forms via RxNorm.
- Employs canonical disease normalization (e.g., merging "COVID-19", "Covid19", "SARS-CoV-2", and "2019 novel coronavirus" into a single canonical entity).
- Automatically deduplicates clinical trials by NCT ID and literature citations by PMID.

### B. Dedicated Evidence Dossier (`/evidence/[drug-slug]/[condition-slug]`)
- Permalink route for every verified drug-condition hypothesis.
- **Approved Indications vs. Repurposing Hypotheses:** Keeps officially authorized label indications strictly separate from experimental repurposing candidates.
- Full Repurpose Compass view, target pharmacology, trial enrollment status, and safety warnings.
- **Citation Export:** One-click citation export in standard **RIS** (compatible with EndNote, Zotero, Mendeley) and **CSV** formats.
- **SEO & Indexability:** Only indexed by search engines when verified public human evidence exists with sufficient readiness; otherwise emits `noindex`.

### C. Compare Workspace (`/compare`)
- Side-by-side comparison of up to 3 candidate hypotheses simultaneously.
- Compares research state, readiness score breakdown, trial counts, literature volume, biological rationale, and flagged contradictions.
- One-click export to **CSV** and clean **Printable Research Summary**.

### D. Personal Research Notebook (`/notebook`)
- Authenticated personal research vault backed by Firebase Authentication and local storage fallback.
- Save candidate dossiers, add private hypothesis notes, organize custom tags (e.g., `#oncology`, `#review-needed`), and track research checklist completion.
- **Owner-Only Privacy:** User notes and saved hypotheses are never shared publicly, aggregated into public scores, or exported without explicit user action.
- Complete data deletion controls allowing users to purge all local and synced records.

### E. Data Source & Licence Registry (`/sources`)
- Public registry detailing all queried sources, access mechanisms, licensing requirements, update frequencies, and known limitations.
- Explicit status indicators (`Enabled`, `Awaiting lawful integration`, or `Source not configured`).

---

## 4. Permitted Source Strategy & Legal Compliance

Repurpose operates under a strict open-science and intellectual property compliance framework:

- **Direct Permitted Sources Only:** Queries official, documented, public-domain government APIs:
  - **RxNorm API** (U.S. National Library of Medicine)
  - **openFDA API** (U.S. Food and Drug Administration)
  - **PubChem PUG-REST** (National Center for Biotechnology Information)
  - **ClinicalTrials.gov API v2** (U.S. National Library of Medicine)
  - **NCBI PubMed Entrez E-Utilities** (U.S. National Library of Medicine)
- **Zero Scraping Policy:** Repurpose does **not** scrape, mirror, or rehost third-party proprietary databases such as DrugCentral, Broad Repurposing Hub, REFRAMEdb, repoDB, or Open Targets.
- **Attribution & Licensing:** All open-access datasets preserve required attribution, source links, and identifiers.
- **No Fake Data:** If source access is unavailable or a compound is unmapped, the application displays *“Source not configured”* or a graceful failure notice. It **never** fabricates synthetic trials, citations, scores, or claims.

---

## 5. Security & Threat Model Architecture (OWASP ASVS Level 1)

Repurpose implements production security hardening following **OWASP ASVS (Application Security Verification Standard) Level 1** controls (see [`SECURITY_SCORECARD.md`](SECURITY_SCORECARD.md) for full scorecard and [`SECURITY.md`](SECURITY.md) for vulnerability disclosure policies):

- **Zero Client-Side Secrets:** All API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, Firebase Admin credentials) operate strictly within server-side route handlers. Zero secrets use the `NEXT_PUBLIC_` prefix or appear in client bundles.
- **Server-Side Request Forgery (SSRF) Protection:** Outbound calls from backend route handlers are locked to an explicit allowlist of authorized biomedical hosts (`clinicaltrials.gov`, `api.fda.gov`, `pubchem.ncbi.nlm.nih.gov`, `eutils.ncbi.nlm.nih.gov`, `rxnav.nlm.nih.gov`).
- **Owner-Isolated Firestore & Storage Security Rules:** Deny-by-default security rules in [`firestore.rules`](firestore.rules) and [`storage.rules`](storage.rules) strictly enforce that users can only read or write their own documents (`request.auth.uid == userId`) with immutable owner IDs and size limits. Client access to internal collections (`/verified_drugs`, `/evidence_cache`, `/scores`, `/admin`, `/audit_logs`) is blocked.
- **Evidence Integrity & Score Protection:** Research readiness scores and evidence timelines are calculated deterministically on the server; clients cannot modify or forge candidate scores.
- **Production HTTP Security Headers:** Configured in `next.config.ts` with Content-Security-Policy (CSP), Strict-Transport-Security (HSTS preload), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, and restricted Permissions-Policy.
- **API Rate Limiting & Input Validation:** Sliding-window rate limiting on search (45/min), research (20/min), and AI synthesis (15/min anon, 40/min auth) endpoints. Strict length caps (80 chars for drug queries) and 50 KB request body caps (`413 Payload Too Large`).
- **Privacy & 30-Day Auto-Purge:** Private notes and dossiers are retained for a maximum of 30 days and automatically purged across databases. A dedicated right-to-be-forgotten endpoint (`/api/user/delete-data`) enables immediate data clearing.
- **Safe Structured Security Logging:** Automated redaction utility ([`src/lib/securityLogger.ts`](src/lib/securityLogger.ts)) logs security events while stripping tokens, credentials, cookies, and PII.

---

## 6. Secret-Rotation Runbook

If any service key is ever suspected of compromise:

1. **Groq / LLM Key:** Generate a new key in [Groq Console](https://console.groq.com/keys) -> update `GROQ_API_KEY` in Vercel -> revoke old key in Groq -> redeploy.
2. **Google AI / Gemini Key:** Generate new key in [Google AI Studio](https://aistudio.google.com/app/apikey) -> update `GEMINI_API_KEY` in Vercel -> delete old key in Google Cloud Console.
3. **Firebase API Credentials:** Rotate Web API keys in Google Cloud Console / Firebase Project Settings -> update `NEXT_PUBLIC_FIREBASE_*` variables -> redeploy.

---

## 7. Production Deployment Security Checklist

Before deploying to production on Vercel:

- [ ] **Vercel Production Secrets:** Set `GROQ_API_KEY` and `GEMINI_API_KEY` in Vercel Dashboard > Project Settings > Environment Variables (ensure they are only enabled for Production/Preview server environments, not exposed client-side).
- [ ] **Firebase Domain Authorization:** Open [Firebase Console > Authentication > Settings > Authorized domains](https://console.firebase.google.com/) and add your production domain (e.g., `repurpose.vercel.app` or custom domain).
- [ ] **Firebase App Check Rollout:** In Firebase Console > App Check, register your web app with reCAPTCHA Enterprise / reCAPTCHA v3 to prevent direct API abuse from non-browser clients.
- [ ] **GitHub 2FA & Branch Protection:** Enable 2-Factor Authentication on your GitHub account, require pull-request reviews on `main`, and require passing CI status checks (`npm test`, CodeQL) before merging.
- [ ] **Disable Production Source Maps:** Verified `productionBrowserSourceMaps: false` and `poweredByHeader: false` in `next.config.ts`.

---

## 6. Installation & Development

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Setup
```bash
# Clone the repository
git clone https://github.com/rahulchakradhar30/Repurpose.git
cd Repurpose

# Install dependencies
npm install

# Configure environment variables (optional for local guest mode)
cp .env.example .env.local
```

### Running Locally
```bash
# Start Next.js development server
npm run dev

# Open in browser
http://localhost:3000
```

### Testing & Validation
```bash
# Run Vitest test suite (scoring, normalization, voice search, compass, SEO)
npm test

# Run TypeScript type verification
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## 7. Production SEO & Google Search Console Runbook

### Core Production URLs & Endpoints
- **Production Domain:** `https://drugrepurpose.vercel.app`
- **Canonical Robots.txt:** `https://drugrepurpose.vercel.app/robots.txt`
- **Dynamic XML Sitemap:** `https://drugrepurpose.vercel.app/sitemap.xml`

### Google Search Console Verification & Setup
1. **Verification Meta Tag:**
   The verification meta tag is baked directly into the Next.js root layout HTML:
   ```html
   <meta name="google-site-verification" content="TVRormk2JxbUCOVNS_0kWGP5hn26StqTY5bJjs4Vi2s" />
   ```
2. **Adding the Property in Google Search Console:**
   - Log into [Google Search Console](https://search.google.com/search-console).
   - Click **Add Property** and select **URL prefix**: `https://drugrepurpose.vercel.app`.
   - Choose the **HTML tag** verification method and click **Verify**.

3. **Submitting the Dynamic Sitemap:**
   - In Search Console, navigate to **Sitemaps** in the left sidebar.
   - Under *Add a new sitemap*, enter `sitemap.xml` (i.e. `https://drugrepurpose.vercel.app/sitemap.xml`) and click **Submit**.
   - Verify that Google reports status **Success** and detects all indexable canonical URLs.

4. **Using URL Inspection:**
   - Paste any canonical public URL (e.g., `https://drugrepurpose.vercel.app/` or `https://drugrepurpose.vercel.app/drug/metformin`) into the top search bar.
   - Click **Test Live URL** to confirm that Googlebot can fetch the page, render text content, execute structured data, and view canonical tags.

5. **Requesting Re-Indexing After Substantial Content Updates:**
   - After updating drug dossiers, scoring rules, or educational guides, inspect the updated URL and click **Request Indexing**.
   - *Note:* Google enforces daily quotas on manual indexing requests; rely on the auto-updating `sitemap.xml` for routine updates.

6. **Monitoring Indexing, Core Web Vitals & Search Performance:**
   - **Pages / Coverage Report:** Check *Indexed* vs *Not indexed* pages. Confirm that `/api/*`, `/notebook`, and parameterized query URLs (`/?drug=...`) are excluded as intended.
   - **Performance Report:** Track impressions, search clicks, average CTR, and ranking queries for biomedical and drug repositioning terms.
   - **Core Web Vitals:** Monitor LCP (<2.5s), FID/INP (<200ms), and CLS (<0.1) across mobile and desktop.
   - **Crawl Errors:** Audit the *Crawl Stats* report in Settings to verify zero 5xx server errors or blocked rendering assets.

7. **Important Search Engine Disclaimer:**
   - **Indexing and Rankings Are Not Guaranteed:** Search engines evaluate crawl frequency, site quality, backlink authority, and content freshness autonomously. We do not engage in manipulative SEO, keyword stuffing, or artificial backlink schemes.

---

## 8. SEO Architecture & Indexability Matrix

| Route Pattern | Index Status | Canonical Target | Structured Data (JSON-LD) | Notes / Guardrails |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `index, follow` | `https://drugrepurpose.vercel.app` | `WebSite`, `SoftwareApplication`, `Person` | Clean discovery hub, search, and educational links. |
| `/?drug=...` | `noindex, follow` | `https://drugrepurpose.vercel.app` | None | Search query results prevent duplicate indexation. |
| `/what-is-drug-repurposing` | `index, follow` | `.../what-is-drug-repurposing` | `Article`, `BreadcrumbList` | Educational guide with peer-reviewed references. |
| `/methodology` | `index, follow` | `.../methodology` | `Article`, `BreadcrumbList` | 100-point Research Readiness Score specification. |
| `/sources` | `index, follow` | `.../sources` | `Article`, `BreadcrumbList` | Public biomedical API registry & license boundaries. |
| `/about` | `index, follow` | `.../about` | `AboutPage`, `Person`, `BreadcrumbList` | Mission, open-source principles, creator credit. |
| `/privacy` | `index, follow` | `.../privacy` | `Article`, `BreadcrumbList` | 30-day auto-purge, no PHI, zero tracking pixels. |
| `/compare` | `index, follow` | `.../compare` | `BreadcrumbList` | Side-by-side hypothesis comparison workspace. |
| `/drug/[slug]` | `index, follow` (verified only) | `.../drug/[slug]` | `MedicalWebPage`, `BreadcrumbList` | Verified compounds with last-verified date & trials. |
| `/evidence/[drug]/[cond]` | `index, follow` (qualifying only) | `.../evidence/[drug]/[cond]` | `MedicalWebPage`, `BreadcrumbList` | Verified dossiers (score ≥ 35 & public trials). |
| `/notebook` | `noindex, nofollow` | Excluded | None | Private authenticated notebook vault. |
| `/api/*` | `noindex, nofollow` | Excluded | None | Backend REST endpoints (disallowed in robots.txt). |

---

## 9. Known Limitations

1. **US Labeling Focus:** Primary structured product labeling is ingested from openFDA and DailyMed. International regulatory approvals (EMA, PMDA, CDSCO) are planned for future phases.
2. **ClinicalTrials.gov Data Latency:** Sponsor reporting of primary completion endpoints may lag by 12–24 months following trial completion.
3. **Full-Text Literature:** PubMed E-Utilities retrieves indexed metadata, titles, and abstracts. Access to full publisher manuscripts depends on open-access licenses or institutional subscriptions.
4. **Phase 4 Moderated Collaboration Hub:** Proposed for future implementation upon formal institutional review; not active in the current release.

---

## 10. License & Attribution

- **Code:** Open-source under the MIT License.
- **Biomedical Data:** Ingested from public domain sources provided by the U.S. National Institutes of Health (NIH), National Library of Medicine (NLM), and Food and Drug Administration (FDA).
- **Author:** P. Rahul Chakradhar · [rahulchakradhar30@outlook.com](mailto:rahulchakradhar30@outlook.com)

