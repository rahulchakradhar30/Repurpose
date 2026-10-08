# Repurpose — Biomedical Data Sources & Integrations

Repurpose aggregates public biomedical domain data directly from authoritative U.S. National Institutes of Health (NIH), National Library of Medicine (NLM), and Food and Drug Administration (FDA) databases.

---

## 1. Upstream Data Source Summary

| Source | Provider | Base Endpoint | Primary Role |
| :--- | :--- | :--- | :--- |
| **RxNorm** | U.S. National Library of Medicine (NLM) | `https://rxnav.nlm.nih.gov/REST` | Drug name normalization, RxCUI resolution, active ingredient identification |
| **openFDA** | U.S. Food and Drug Administration (FDA) | `https://api.fda.gov/drug/label.json` | Approved indications, FDA boxed warnings, contraindications, established pharmacologic classes |
| **ClinicalTrials.gov** | National Library of Medicine (NLM) | `https://clinicaltrials.gov/api/v2/studies` | Active and completed interventional trials, phases, enrollment numbers, trial status |
| **NCBI PubMed** | National Center for Biotechnology Information | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils` | Peer-reviewed medical citations, abstracts, PMIDs, journal metrics |
| **PubChem** | National Center for Biotechnology Information | `https://pubchem.ncbi.nlm.nih.gov/rest/pug` | 2D/3D chemical structures, SMILES, CID identifiers, target mechanism records |

---

## 2. API Adapters Implementation (`src/lib/sources/`)

### `rxnorm.ts`
- Dispatches `GET /rxcui.json?name={drugName}&search=2` to find standardized concepts.
- Extracts generic ingredient strings and brand names to eliminate ambiguity across regional spellings.

### `openfda.ts`
- Dispatches `GET /drug/label.json?search=openfda.generic_name:"{drug}"` to pull structured product labels.
- Parses `boxed_warning`, `indications_and_usage`, and `contraindications`.

### `clinicaltrials.ts`
- Dispatches query to `/studies` with filters:
  - `query.intr`: Drug candidate name.
  - `query.cond`: Disease / condition.
  - `filter.overallStatus`: `RECRUITING`, `ACTIVE_NOT_RECRUITING`, `COMPLETED`, `TERMINATED`, `WITHDRAWN`.
- Extracts `briefTitle`, `phase`, `enrollmentInfo`, and `studyFirstPostDate`.

### `pubmed.ts`
- Coordinates E-utilities `esearch.fcgi` (finding PMIDs) and `esummary.fcgi` (fetching citation metadata).
- Returns verifiable PMIDs and titles for peer-review validation.

### `pubchem.ts`
- Fetches compound properties (`MolecularFormula`, `MolecularWeight`, `CanonicalSMILES`, `InChIKey`).
- Resolves mechanism of action descriptions for target plausibility scoring.

---

## 3. Resilience & SSRF Protections

All outbound requests to these sources route through `safeFetch` in `src/lib/network.ts`:
1. **SSRF Allowlist:** Target URLs must match strictly declared regex patterns for federal endpoints (`*.nlm.nih.gov`, `api.fda.gov`, `clinicaltrials.gov`, `*.ncbi.nlm.nih.gov`). Private IPs (`10.0.0.0/8`, `192.168.0.0/16`, `127.0.0.1`, `169.254.169.254`) are blocked.
2. **Timeout Bounds:** AbortSignal enforcement (default 8,000ms) prevents upstream hung connections from stalling the server.
3. **Graceful Fallbacks:** If an individual source times out or returns 404, remaining sources proceed and generate the evidence dossier with clear data-availability indicators.
