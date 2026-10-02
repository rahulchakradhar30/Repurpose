# Repurpose — Evidence-Based Drug Repurposing Research Explorer

> **Mandatory Biomedical Research Notice:**  
> **For scientific exploration and educational reference only.** Repurpose is an academic computational research platform. It does not provide medical advice, diagnosis, prescribing guidelines, or therapeutic recommendations. Drug repurposing hypotheses must undergo rigorous preclinical validation and formal randomized clinical trials before any clinical translation.

---

## 1. What is Repurpose?

**Repurpose** is an open-source, evidence-grounded computational research platform engineered to help pharmacy students, pharmacologists, medicinal chemists, and translational researchers systematically explore and evaluate drug repositioning opportunities.

In modern biomedical research, discovering new therapeutic indications for existing, approved pharmacotherapies offers substantial advantages over de novo drug discovery—including characterized human pharmacokinetics, established safety profiles, and compressed development timelines. However, translational researchers and students often face fragmented public databases: chemical structures reside in PubChem, regulatory labeling in FDA DailyMed, clinical investigations in ClinicalTrials.gov, and published outcomes in PubMed.

Repurpose eliminates this fragmentation by acting as a **unified, real-time biomedical intelligence pipeline**. It aggregates, normalizes, and grades clinical and mechanistic evidence across authoritative public domain registries, transforming disparate raw records into structured, verifiable repurposing dossiers.

### Core Architectural Philosophy: Zero-Fabrication

Unlike generic AI assistants that hallucinate non-existent clinical trials, invent biomedical citations, or make unverified efficacy claims, **Repurpose enforces a strict deterministic, zero-fabrication architecture**:
1. **Direct Public Domain Grounding:** Every chemical target, active clinical trial, FDA label section, and PubMed citation displayed in the application is retrieved directly from official government APIs (NIH, FDA, NCBI).
2. **Transparent Evidence Provenance:** Every candidate condition visibly links back to original public records with verified identifiers (RxCUI, PubChem CID, ClinicalTrials.gov NCT IDs, and PubMed PMIDs).
3. **Objective Research Reporting:** No candidate is ever described as "effective," "proven," "recommended," or "clinically useful." Evidence is reported purely by clinical maturity, trial phase progression, and peer-reviewed publication signals.
4. **Source-Level Failure Isolation:** If a biomedical registry is temporarily unavailable or returns no matching records, Repurpose displays a transparent coverage notice rather than fabricating synthetic data.
5. **Read-Only & Privacy-Preserving:** The platform requires no user registration, stores no personal cookies, collects no health information, and maintains no private databases. Exact research queries are preserved through deterministic URL states that can be copied and shared.

---

## 2. What is the Platform About?

Repurpose is focused on **systematic drug repurposing intelligence**. When an investigator queries a pharmaceutical compound (e.g., *Azithromycin*, *Metformin*, *Thalidomide*), the platform answers three foundational biomedical research questions:

1. **What is the drug's verified baseline?**
   - Normalized chemical identity and active generic ingredient.
   - Verified distinct proprietary brand names (filtering out generic names and salt formulations).
   - Characterized pharmacological drug class and biological mechanism of action.
   - Official FDA/DailyMed regulatory approved indications, boxed warnings, and contraindications.
2. **What non-approved conditions are being investigated?**
   - Candidate disease indications currently or previously under interventional evaluation in registered clinical trials.
   - Identification of exploratory and off-label therapeutic hypotheses.
3. **What is the maturity and integrity of the supporting evidence?**
   - Separation of registered trial activity from published peer-reviewed outcomes.
   - Detection of discontinued, withdrawn, or terminated trials.
   - Evaluation of biological plausibility, independent multi-center replication, and safety conflict risks.
   - A deterministic, 100-point **Evidence Score** accompanied by transparent uncertainty flags and scoring notes.

---

## 3. How the Information is Gathered

Repurpose does not rely on static web scraping, commercial proprietary databases, or synthetic language model memory. Instead, it queries authoritative, publicly accessible biomedical repositories via official REST APIs in parallel:

```
                                  [ User Query ]
                                         │
                                         ▼
                       ┌───────────────────────────────────┐
                       │   Parallel Biomedical Ingestion   │
                       └───────────────────────────────────┘
                         │           │           │        │
           ┌─────────────┘           │           │        └─────────────┐
           ▼                         ▼           ▼                      ▼
    ┌─────────────┐           ┌─────────────┐ ┌─────────────┐    ┌──────────────┐
    │   RxNorm    │           │   openFDA   │ │   PubChem   │    │ClinicalTrials│
    │  (NLM API)  │           │  (DailyMed) │ │ (NCBI PUG)  │    │  (.gov v2)   │
    └─────────────┘           └─────────────┘ └─────────────┘    └──────────────┘
           │                         │           │                      │
           ▼                         ▼           ▼                      ▼
     Normalized Name          Official Label    Chemical Target       Interventional
     & Concept RxCUI           & Warnings        & Pharmacology        Study Records
           │                         │           │                      │
           └─────────────────────────┼───────────┴──────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │ Disease Normalization Engine│
                      └─────────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │    NCBI PubMed E-Utilities  │
                      │  (Peer-Reviewed Literature) │
                      └─────────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │ 5-Pillar Deterministic Score│
                      └─────────────────────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │ Real-Time Research Dossier  │
                      └─────────────────────────────┘
```

### Authoritative Registries Queried

| Biomedical Registry | Managing Agency | Data Extracted & Role |
| :--- | :--- | :--- |
| **RxNorm** | U.S. National Library of Medicine (NLM) | Normalizes raw user queries into standardized generic chemical concepts and Concept Unique Identifiers (RxCUIs). Resolves synonyms, spelling variations, and international names. |
| **openFDA / DailyMed** | U.S. Food and Drug Administration (FDA) | Extracts manufacturer Structured Product Labeling (SPL), baseline approved therapeutic indications, boxed warnings, and physiological contraindications. |
| **PubChem** | National Center for Biotechnology Information (NCBI) | Retrieves Compound Identifiers (CIDs), IUPAC names, molecular descriptions, and biochemical target engagement mechanisms. |
| **ClinicalTrials.gov (API v2)** | U.S. National Institutes of Health (NIH) | Discovers all active, recruiting, completed, and terminated human interventional studies. Extracts trial phase (Phase 1–4), enrollment numbers, study status, sponsors, and brief protocol summaries. |
| **PubMed (E-Utilities)** | National Center for Biotechnology Information (NCBI) | Performs structured literature searches pairing the normalized drug concept with each candidate disease condition to retrieve peer-reviewed publication citations, journals, publication dates, and DOIs. |

---

## 4. The Working Structure & Processing Pipeline

Repurpose processes every research query through an eight-stage deterministic pipeline:

### Stage 1: Identity Resolution & Disambiguation
The search term is normalized using the RxNorm REST API. This step resolves generic drug identity, links the compound to its primary RxCUI, and extracts verified trade names. This ensures searches for brand names (e.g., *"Glucophage"*) correctly resolve to their active generic molecule (*"Metformin"*).

### Stage 2: Regulatory Baseline Mapping
The normalized generic concept is queried against openFDA's Structured Product Labeling API. The platform parses:
- **Baseline Approved Indications:** Conditions for which the drug is already legally indicated.
- **Boxed Warnings & Precautions:** Critical safety signals, organ toxicity risks, and monitored adverse effects.
- **Contraindications:** Pathologies or patient demographics where the drug is medically prohibited.

### Stage 3: Chemical Pharmacology & Mechanism Characterization
The platform interfaces with NCBI PubChem to retrieve chemical pharmacology summaries and molecular pathways. If openFDA provides broad administrative tags (e.g., *"Small molecule therapeutic agent"*), Repurpose resolves the drug to a curated pharmacological class (e.g., *"Macrolide antibiotic"* for azithromycin, *"Biguanide oral antihyperglycemic"* for metformin).

### Stage 4: Interventional Trial Mining
The compound is queried against the ClinicalTrials.gov API v2 to uncover registered human studies. The platform parses study protocols, extracting:
- Phase classification (`EARLY_PHASE1`, `PHASE1`, `PHASE2`, `PHASE3`, `PHASE4`).
- Recruitment status (`COMPLETED`, `RECRUITING`, `ACTIVE_NOT_RECRUITING`, `TERMINATED`, `WITHDRAWN`).
- Lead sponsor and academic/institutional collaborators.
- Conditions targeted by the intervention.

### Stage 5: Medical Condition Normalization & Deduplication
Raw condition strings reported by clinical trial investigators often contain spelling variations, grammatical differences, and synonyms. Repurpose passes all conditions through a specialized **Normalization Engine** (`src/lib/normalization.ts`):
- **Alias Merging:** Normalizes variants such as `"Covid-19"`, `"covid19"`, `"SARS-CoV-2"`, and `"coronavirus disease 2019"` into standard canonical `"COVID-19"`.
- **Taxonomic Casing:** Formats conditions in medical title/sentence casing while strictly preserving acronyms in uppercase (e.g., `"COVID-19"`, `"HIV infection"`, `"Chronic obstructive pulmonary disease with exacerbation"`).
- **Duplicate Merging:** Groups trials investigating identical diseases under a unified candidate record, avoiding fragmented candidate cards.
- **Trial & Citation Deduplication:** Merges redundant trial records by unique NCT identifier and deduplicates literature citations by PMID and title hash.
- **Brand Name Disambiguation:** Filters out repetitions of generic names and generic dosage forms (e.g., *"Azithromycin"*, *"Azithromycin Dihydrate"*, *"Oral Suspension"*), preserving only verified proprietary brand identifiers (e.g., *"Zithromax"*, *"Zmax"*).

### Stage 6: Peer-Reviewed Literature Ingestion
For top candidate conditions that represent potential repurposing targets (conditions not included in the drug's FDA-approved label), Repurpose queries NCBI PubMed E-Utilities. It retrieves indexed, peer-reviewed clinical and translational publications documenting the drug-disease pair.

### Stage 7: Deterministic 5-Pillar Evidence Scoring
Rather than relying on arbitrary heuristics or black-box predictions, Repurpose calculates an evidence score between 0 and 100 based on five deterministic pillars:

$$\text{Total Evidence Score} = S_{\text{trials}} + S_{\text{literature}} + S_{\text{mechanism}} + S_{\text{reproducibility}} + S_{\text{safety}}$$

1. **Clinical Trial Evidence (0–40 points):** Evaluates trial phase maturity (Phase 4 completed awards highest points), recruitment completion, active multi-center volume, and penalizes prematurely terminated or withdrawn trials.
2. **Human / Observational Literature (0–20 points):** Measures the volume and presence of peer-reviewed clinical citations indexed in NCBI PubMed.
3. **Mechanistic & Target Plausibility (0–20 points):** Evaluates characterized biological targets, receptor binding rationale, and published pathway interactions.
4. **Reproducibility & Publication Quality (0–10 points):** Assesses study replication across independent sponsors and academic institutions.
5. **Safety & Contraindication Compatibility (0–10 points):** Assesses whether the candidate condition conflicts with FDA boxed warnings or official contraindications (heavy penalties apply if a contraindication overlap is detected).

#### Critical Scoring Safeguards:
- **Separation of Trial Existence from Outcome:** If Phase 2 or Phase 3 trials are registered but no published PubMed outcomes exist, the candidate is explicitly labeled:
  > *"Clinical trial activity identified; published outcome evidence unavailable."*
- **Citation Gating:** A candidate **cannot** receive a "High" score ($\ge 70$) when zero citations and no verified human outcome publications exist, unless an independently verified, completed Phase 3/4 trial justifies it.
- **Insufficient Evidence Cap:** If a candidate has zero registered trials and zero PubMed citations, the score is capped at a maximum of 20 and designated as *"Insufficient evidence"*.

### Stage 8: Constrained AI-Assisted Synthesis (Optional)
When requested by the researcher, an AI synthesis can summarize the retrieved evidence. This synthesis operates under strict programmatic constraints:
- Input is limited exclusively to the verified records retrieved in Stages 1–6.
- Output is validated against a strict schema.
- If the AI output contains prescriptive language (e.g., *"take orally"*, *"prescribe"*, *"dosage"*, *"recommended therapy"*), it is **programmatically rejected** and discarded.

---

## 5. User Workflow & Features

- **Real-Time Interactive Search:** Instant exploration of any therapeutic compound with debounced query suggestions and live progress feedback.
- **Regulated Overview:** Direct comparison of approved indications vs. off-label/investigational candidates.
- **Multi-Pillar Evidence Modal:** In-depth breakdown of every evaluated candidate, displaying trial completion dates, lead sponsors, brief protocol summaries, and literature DOIs.
- **Evidence Notes & Direct Provenance:** Clickable links to NLM RxNav, openFDA DailyMed labels, NCBI PubChem, ClinicalTrials.gov studies, and PubMed.
- **Academic Export:** One-click generation and export of standard reference formats:
  - **RIS format** (`.ris`): For direct import into reference managers (Zotero, Mendeley, EndNote).
  - **CSV format** (`.csv`): Structured tabular data for spreadsheet analysis and laboratory documentation.
- **Direct Link Sharing:** Researchers can share exact drug and candidate states without storing data on third-party servers.

---

## 6. Technical Stack

Repurpose is built using modern, type-safe web technologies:

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components & Static Site Generation)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict type safety across biomedical models)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Responsive, accessible, high-density scientific UI)
- **Icons:** [Lucide React](https://lucide.react.dev/)
- **Test Runner:** [Vitest](https://vitest.dev/) (Comprehensive test suite covering normalization, scoring safeguards, and SEO rules)
- **APIs:** RxNorm REST, openFDA Drug Label API, NCBI PubChem PUG REST, ClinicalTrials.gov API v2, NCBI Entrez E-Utilities.

---

## 7. Project Founder & Creator Attribution

**Repurpose** was conceived, architected, and developed by **P. Rahul Chakradhar** as an open-source educational contribution to biomedical informatics and pharmaceutical research.

- **Founder & Lead Developer:** P. Rahul Chakradhar
- **Contact:** [rahulchakradhar30@outlook.com](mailto:rahulchakradhar30@outlook.com)
- **Repository:** [https://github.com/rahulchakradhar30/Repurpose](https://github.com/rahulchakradhar30/Repurpose)
- **License:** Open Source for Educational and Scientific Research

> *"This platform was created to democratize evidence-grounded drug repurposing research—giving pharmacy students, bioinformatics researchers, and future scientists a transparent, zero-hallucination reference tool to examine the frontier of clinical pharmacology."*
