# Repurpose — Project Directory Structure & Architectural Map

This document outlines the organized structure of the **Repurpose** codebase to help new contributors and developers quickly understand where components, APIs, libraries, security controls, tests, and configurations reside.

---

## 1. High-Level Repository Overview

```
/
├── .github/                  # CI/CD workflows (CodeQL, Deployment, Security scan, Dependabot)
├── android/                  # Native mobile shell (Capacitor Android wrapper)
├── docs/                     # Technical, architectural, security, and integration documentation
├── public/                   # Static assets directly served to web clients & PWA resources
├── src/                      # Next.js 16 (App Router) application source code
│   ├── app/                  # Next.js Routes, Pages, API endpoints, Layouts, and SEO files
│   ├── components/           # Reusable UI widgets and evidence exploration components
│   ├── hooks/                # Custom React client hooks (e.g. Web Speech API)
│   ├── lib/                  # Core algorithms, data structures, and API adapters
│   │   ├── firebase/         # Firebase client-side SDK & authentication initialization
│   │   └── sources/          # Adapters for NIH, FDA, PubMed, PubChem, and ClinicalTrials.gov
│   ├── types/                # Strict TypeScript type definitions and biomedical schemas
│   └── proxy.ts              # Next.js Edge proxy for CORS, rate-limiting, and SEO header enforcement
├── tests/                    # Vitest automated test suite organized by domain
│   ├── firebase/             # Firestore & Storage security rules assertions
│   ├── integration/          # Multi-source API fixtures and user-workflow retention tests
│   ├── security/             # OWASP ASVS Level 1 security headers, SSRF & AI validator tests
│   └── unit/                 # Pure scoring, normalization, SEO, compass, and export unit tests
├── .env.example              # Template of required and optional environment variables
├── firestore.rules           # Cloud Firestore declarative security rules (Owner-only / deny-by-default)
├── storage.rules             # Cloud Storage declarative security rules
├── next.config.ts            # Production Next.js configuration and OWASP security headers
├── package.json              # Project dependencies, scripts, and runtime engines
├── README.md                 # Primary open-source project overview and quickstart guide
├── SECURITY.md               # Security vulnerability reporting policy
├── tsconfig.json             # TypeScript compiler configuration & path aliases (@/* -> ./src/*)
└── vitest.config.ts          # Vitest unit & integration test runner configuration
```

---

## 2. Directory Responsibilities & File Classification

### `src/app/` — Application Routes & Pages (Next.js App Router)
All public pages and API routes follow Next.js App Router conventions:
- **`layout.tsx`**: Root layout establishing typography (`Noto Serif`, `Noto Sans`, `IBM Plex Mono`), SEO metadata defaults, OpenGraph tags, and persistent `<Header />`.
- **`page.tsx`**: High-performance homepage featuring biomedical drug query exploration, live multi-source search, and evidence visualization.
- **`globals.css`**: Tailwind CSS v4 design tokens, custom font variables, glassmorphic styling, and scrollbar utilities.
- **`error.tsx`** & **`not-found.tsx`**: Global error boundary and custom 404 handler with user-friendly recovery actions.
- **`robots.ts`** & **`sitemap.ts`**: Dynamic search engine crawling directives and structured XML sitemap generation for all verified drug dossiers.
- **`about/`**: Platform background, independent open-science mission, developer attribution, and concept acknowledgments.
- **`privacy/`**: Privacy policy, HIPAA/PHI strict prohibition notice, and 30-day auto-purge retention rules.
- **`terms-privacy-disclaimer/`**: Official terms of use, research disclaimers, liability terms, and open-source contribution details.
- **`methodology/`**: Transparent 100-point evidence scoring formula breakdown across 5 deterministic tiers.
- **`sources/`**: Directory of integrated live biomedical APIs with links to official federal documentation.
- **`compare/`**: Multi-drug side-by-side comparison matrix.
- **`notebook/`**: Private researcher workspace for saving dossiers and taking structured notes.
- **`what-is-drug-repurposing/`**: Foundational educational guide explaining computational pharmacology and off-target repositioning.
- **`drug/[slug]/`**: SSR-optimized drug guide with curated evidence profiles.
- **`evidence/[drug-slug]/[condition-slug]/`**: Comprehensive deep-dive evidence dossier for specific drug–condition pairs.
- **`api/drugs/search/`**: Route handler for autocomplete query resolution via RxNorm.
- **`api/drugs/research/`**: Route handler coordinating concurrent calls to openFDA, ClinicalTrials.gov, PubMed, and PubChem.
- **`api/repurposing/ai-summary/`**: Route handler invoking Gemini AI with strict JSON schema verification and clinical safety guardrails.
- **`api/user/delete-data/`**: GDPR/CCPA user data deletion endpoint.

---

### `src/components/` — UI & Evidence Exploration Components
- **`Header.tsx`**: Navigation bar with search shortcuts, Google OAuth login menu, and responsive mobile drawer.
- **`SearchSection.tsx`**: Primary search bar supporting keyboard navigation, autocomplete suggestions, and speech recognition.
- **`DrugOverview.tsx`**: Drug overview card displaying chemical structure, FDA boxed warnings, and approved indications.
- **`RepurposingList.tsx`**: Filterable list of candidate indications with evidence score meters and trial phase badges.
- **`RepurposeCompass.tsx`**: Interactive quadrant chart mapping clinical maturity vs. mechanistic plausibility.
- **`EvidenceDetailModal.tsx`**: Modal popup rendering primary clinical trial records (NCT IDs) and PubMed citations (PMIDs).
- **`SaveToNotebookButton.tsx`**: Interactive button syncing saved dossiers to local storage or Cloud Firestore.
- **`CompareDrugButton.tsx`**: Quick toggle adding candidate drugs to the comparison queue.
- **`CopyPageLinkButton.tsx`**: Clipboard utility for sharing canonical deep links.
- **`PrintSummaryButton.tsx`**: Generates clean print/PDF versions for local archival.
- **`DisclaimerBanner.tsx`**: Top educational notice banner.
- **`PWARegister.tsx`**: Lightweight client component registering `sw.js` for offline capability.

---

### `src/lib/` — Core Logic, Upstream Adapters & Utilities
- **`scoring.ts`**: The core deterministic 100-point scoring algorithm (Clinical Trials 0–40, Human Evidence 0–20, Mechanistic 0–20, Reproducibility 0–10, Safety Compatibility 0–10).
- **`evidenceEngine.ts`**: Parallelized aggregator retrieving and merging data from all 5 external biomedical APIs.
- **`evidenceDossier.ts`**: Transforms raw API payloads into strongly-typed evidence dossiers with normalized metrics.
- **`gemini.ts`**: Gemini API integration enforcing zero-hallucination constraints and safety checks.
- **`network.ts`**: SSRF prevention, sliding-window rate limiting, input sanitization, and resilient fetch wrappers.
- **`securityLogger.ts`**: In-memory security event logging for suspicious request patterns.
- **`normalization.ts`**: Disease/condition string normalization and slugification for canonical routing.
- **`drugDirectory.ts`**: Curated directory of top repositioned compounds for pre-rendering and fallbacks.
- **`publishedDrugs.ts`**: Canonical list of published drugs and guide metadata.
- **`notebookStorage.ts`**: Data retention logic, 30-day purge rules, and Firestore cloud synchronization.
- **`compareStorage.ts`**: Local storage manager for drug comparison state.
- **`export.ts` & `exportUtils.ts`**: Serialization utilities for exporting to CSV, JSON, formatted text, and PDF.
- **`seo.ts`**: Comprehensive SEO helper generating canonical URLs and JSON-LD schemas (`WebSite`, `SoftwareApplication`, `MedicalCondition`, `Drug`, `Article`, `BreadcrumbList`).
- **`firebase/client.ts`**: Safe browser-only Firebase initialization and authentication helpers.
- **`sources/`**:
  - `rxnorm.ts`: NLM RxNorm REST API adapter (RxCUI mapping, synonyms).
  - `openfda.ts`: openFDA API adapter (labels, boxed warnings, indications).
  - `clinicaltrials.ts`: ClinicalTrials.gov API v2 adapter (interventional protocols, recruitment status).
  - `pubmed.ts`: NCBI PubMed E-utilities adapter (peer-reviewed citations, PMIDs).
  - `pubchem.ts`: PubChem PUG-REST adapter (chemical properties, SMILES, target mechanisms).

---

### `tests/` — Automated Testing Hierarchy
Organized by testing scope to make running focused tests fast and intuitive:
- **`tests/unit/`**:
  - `scoring.test.ts`: Point allocation across all 5 tiers.
  - `score_integrity.test.ts`: Boundaries (0–100 clamp) and deterministic reproducibility.
  - `compass.test.ts`: Quadrant assignment and coordinate math.
  - `normalization.test.ts`: MeSH term and drug name canonicalization.
  - `validation.test.ts`: Biomedical data structure schema enforcement.
  - `export.test.ts`: CSV/JSON/text serialization integrity.
  - `voice_search.test.ts`: Voice recognition hook state machine.
  - `search_elimination.test.ts`: Search filtering and fuzzy match accuracy.
  - `seo.test.ts`: Canonical URLs, schema validation, and JSON-LD generation.
- **`tests/integration/`**:
  - `integration_fixtures.test.ts`: End-to-end evidence payload parsing with mock upstream responses.
  - `compare_flow.test.ts`: Multi-drug comparison state management.
  - `notebook_retention.test.ts`: 30-day auto-purge expiration validation.
- **`tests/security/`**:
  - `api_security.test.ts`: Input sanitization, oversized payload rejection, rate limiting.
  - `security_headers.test.ts`: CSP, HSTS, X-Frame-Options, permissions policy assertions.
  - `ssrf_protection.test.ts`: Upstream URL allowlist verification.
  - `ai_validation.test.ts`: Clinical safety filtering and hallucination rejection.
- **`tests/firebase/`**:
  - `firestore_rules.test.ts`: Declarative Firestore rules syntax and access control assertions.

---

### `docs/` — Developer & Operations Documentation
- **`docs/PROJECT_STRUCTURE.md`**: This directory and file map.
- **`docs/ARCHITECTURE.md`**: Technical architecture, data flow diagrams, and safety design.
- **`docs/DATA_SOURCES.md`**: Specification and rate limits for upstream federal APIs.
- **`docs/DEPLOYMENT.md`**: Deployment guidelines for Vercel, Firebase, and environment setup.
- **`docs/SECURITY_SCORECARD.md`**: Complete OWASP ASVS Level 1 verification audit.
