# Repurpose — Evidence-Based Drug Repurposing Explorer

> **Mandatory Research Disclaimer:**  
> **For education and research only.** This tool does not provide medical advice, diagnosis, or treatment recommendations. Never use this application for clinical decision-making. Verify all findings with primary literature and qualified healthcare professionals.

Open-source educational tool prepared by **P. Rahul Chakradhar** · Contact: [rahulchakradhar30@outlook.com](mailto:rahulchakradhar30@outlook.com)

---

## 1. Overview & Philosophy

**Repurpose** is a production-grade, installable web application tailored for pharmacy students, medicinal chemists, and biomedical researchers to explore evidence-based drug repurposing opportunities.

Unlike generative chatbots that fabricate studies or hallucinate medical claims, **Repurpose enforces strict deterministic biomedical retrieval**:
- **Zero Mock / Fabricated Data:** Live queries to RxNorm, openFDA, PubChem, ClinicalTrials.gov API v2, and NCBI PubMed.
- **Source-Level Failure Isolation:** If a source cannot return data, a transparent *"No verified evidence available from this source"* state is displayed.
- **Separation of Approved vs. Investigational Indications:** Clearly separates FDA-approved labeled indications from investigational, off-label, or preclinical exploration.
- **Transparent 100-Point Evidence Score:** Deterministic breakdown with visible contributing factors and uncertainty flags.
- **Read-Only & Privacy-First:** No accounts, no logins, no personal tracking, and no client-side database writes. Researchers can share exact research states via native URL copy buttons.
- **Strict Guardrails for AI:** Groq / LLM summaries are strictly constrained to retrieved evidence and rejected if they contain prescriptive language or dosages.

---

## 2. Production SEO Architecture

Repurpose implements production-grade technical and content SEO designed to make evidence-based research discoverable without manipulative tactics, keyword stuffing, or thin auto-generated pages.

### Canonical Domain Configuration
The canonical site URL is read from the `NEXT_PUBLIC_SITE_URL` environment variable.
- Example: `NEXT_PUBLIC_SITE_URL=https://repurpose-research.org` (or your production Vercel domain `https://repurpose.vercel.app`)
- **Important:** Do not include a trailing slash. All canonical links, Open Graph tags, and sitemaps use this base URL.

### Search Engine Assets
- **`robots.txt`**: Accessible at `/robots.txt`
  - Allows search engines to crawl public educational pages (`/what-is-drug-repurposing`, `/methodology`, `/sources`, `/about`), static assets, and published drug dossiers (`/drug/*`).
  - Disallows internal API routes (`/api/*`), Next.js runtime chunks (`/_next/*`), and dynamic query parameters (`/*?*`) to prevent indexing unverified search parameters.
  - Dynamically declares canonical `Sitemap: <canonical-domain>/sitemap.xml`.
- **`sitemap.xml`**: Dynamically generated at `/sitemap.xml`
  - Emits valid XML adhering to Sitemaps.org standards.
  - Contains only canonical, indexable public URLs.
  - Never includes search query parameters, unverified searches, or thin pages.

### Indexable Public Content Hub
| Route | Purpose & Content | Structured Data |
| :--- | :--- | :--- |
| `/` | Application overview, search entry point, featured verified drug dossiers. | `WebSite`, `SoftwareApplication`, `Person` |
| `/what-is-drug-repurposing` | Original guide on off-target pharmacology, regulatory phases, and clinical trials. | `Article`, `BreadcrumbList` |
| `/methodology` | Deterministic 5-pillar scoring algorithm, uncertainty handling, AI safety guardrails. | `Article`, `BreadcrumbList` |
| `/sources` | Documentation of open registries: RxNorm, openFDA, PubChem, ClinicalTrials.gov, PubMed. | `Article`, `BreadcrumbList` |
| `/about` | Project mission, zero-tracking privacy policy, medical disclaimer, creator credit. | `AboutPage`, `BreadcrumbList` |
| `/drug/[slug]` | Verified biomedical dossiers with clinical trials, citations, and source audit trails. | `MedicalWebPage`, `BreadcrumbList` |

---

## 3. Drug Page Publishing Rules & Anti-Thin-Page Policy

To ensure high domain authority and prevent search engines from indexing low-quality automated pages, Repurpose adheres to strict publishing thresholds via `isDrugPublishable()`:

1. **No Indexing of User Searches:** A `/drug/[slug]` page is **never** created or indexed simply because an anonymous user entered a query into the search bar. Dynamic searches run on client-side state or parameter URLs (`/?drug=...`) which are explicitly disallowed in `robots.txt`.
2. **Strict Verification Threshold:** A drug dossier `/drug/[slug]` is only rendered and published in `sitemap.xml` if it meets all of the following:
   - Verified generic chemical name (normalized via RxNorm).
   - Minimum of 2 independent biomedical source links (e.g. RxNorm + openFDA + ClinicalTrials.gov).
   - Valid last-verified timestamp.
   - At least one documented repurposing candidate backed by registered clinical trials or peer-reviewed PubMed citations.
   - Comprehensive educational overview of pharmacological mechanism.
   - Explicit `isIndexable: true` verification flag.
3. **Graceful Fallback for Unverified Slugs:** Any non-publishable or unknown slug returns an HTTP 404 (`notFound()`) with `noindex, follow` directives, ensuring search engines never index incomplete records.

---

## 4. Medical-Content Safety Policy

Repurpose is an educational research platform, not medical advice. The following rules govern all content:
- **No Fabricated Claims:** Zero synthetic studies, fake citations, fake authors, or simulated trial statistics.
- **Evidence Labeling:** Evidence is explicitly labeled by status (`Investigational`, `Off-label`, `Preclinical`, `Insufficient`, `Conflicting`).
- **No Direct Prescribing or Efficacy Assurances:** High evidence scores reflect research maturity, never safety or therapeutic efficacy for a patient.
- **Prominent Disclaimers:** Visible research notices appear on every page, modal, and export file.
- **Transparent Attribution:** Creator attribution states *"Open-source tool prepared by P. Rahul Chakradhar"*. No unverified medical credentials (MD/PharmD) are claimed.

---

## 5. Google Search Console & Post-Deployment Manual Checklist

After deploying Repurpose to production on Vercel or your custom domain, complete these manual steps:

### 1. Set Production Environment Variables in Vercel
1. Go to your **Vercel Dashboard** -> select your project -> **Settings** -> **Environment Variables**.
2. Add or update:
   - `NEXT_PUBLIC_SITE_URL`: Set to your production canonical domain (e.g. `https://repurpose-research.org` or `https://repurpose.vercel.app`).
   - `GROQ_API_KEY`: Set your server-side Groq API key for evidence-constrained AI summaries.
3. Trigger a redeploy (or promote the latest deployment) so the environment variable is baked into the build.

### 2. Verify Google Search Console (GSC) Ownership
1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** and enter your production URL (either as a Domain property or URL Prefix).
3. Verify ownership via DNS TXT record (recommended) or HTML tag.

### 3. Submit the Dynamic Sitemap
1. In the left navigation of Google Search Console, click **Sitemaps**.
2. Under "Add a new sitemap", enter:
   ```
   sitemap.xml
   ```
3. Click **Submit**. Verify that GSC successfully reads all canonical URLs.

### 4. Perform URL Inspection on Primary Pages
1. Use the **URL Inspection Tool** in GSC to test the following live URLs:
   - `https://your-domain.com/`
   - `https://your-domain.com/what-is-drug-repurposing`
   - `https://your-domain.com/methodology`
   - `https://your-domain.com/sources`
   - `https://your-domain.com/about`
   - `https://your-domain.com/drug/metformin`
2. Click **Test Live URL**.
3. Confirm that:
   - Status is "URL is available to Google".
   - Canonical URL matches your production URL.
   - Structured data (Rich Results) detects `WebSite`, `SoftwareApplication`, and `MedicalWebPage` without errors.
4. Click **Request Indexing** on the primary educational pages.

---

## 6. Local Development & Testing

### Installation
```bash
git clone https://github.com/rahulchakradhar30/Repurpose.git
cd Repurpose
npm install --legacy-peer-deps
```

### Environment Setup
```bash
cp .env.example .env.local
```

### Run Full Test Suite
```bash
npm test
```
The test suite includes 30 unit and integration tests covering:
- Robots.txt crawl rules and disallow paths
- Dynamic sitemap generation and canonical URL normalization
- Drug publishing thresholds and anti-thin-page validation
- JSON-LD structured data schemas (WebSite, SoftwareApplication, MedicalWebPage, BreadcrumbList, Article)
- Evidence scoring algorithms and uncertainty penalties
- AI output schema and safety guardrails

### Production Build Validation
```bash
npm run build
npm run start
```
Starts the production Next.js server on [http://localhost:3000](http://localhost:3000).

---

## 7. Contact & License

Open-source project developed for computational pharmacology education and research support.  
**Prepared by:** P. Rahul Chakradhar  
**Contact:** [rahulchakradhar30@outlook.com](mailto:rahulchakradhar30@outlook.com)  
**License:** MIT
