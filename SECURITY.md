# Security Policy & Vulnerability Disclosure

## 1. Scope & Commitment
**Repurpose** is an open-source, evidence-first drug-repurposing research workspace. We are committed to maintaining robust security, data privacy, and strict protection of researcher information in compliance with **OWASP ASVS (Application Security Verification Standard) Level 1** controls.

---

## 2. Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 3. Reporting a Vulnerability (Responsible Disclosure)

If you discover a security vulnerability, flaw, or potential data exposure in Repurpose, please report it responsibly:

- **Security Contact**: `security@repurpose-research.org` (or create a private GitHub Security Advisory).
- **Required Details**:
  1. Description of the vulnerability and its potential impact.
  2. Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
  3. Affected endpoints, components, or files.
- **Response Commitment**:
  - Initial triage and acknowledgment within **48 hours**.
  - Remediation patch and release timeline within **7 business days** for High/Critical issues.
  - Please **do not** disclose the vulnerability publicly until a fix has been released.

---

## 4. Threat Model & Architecture Hardening

| Threat Vector | Mitigation Strategy | Implemented Controls |
| ------------- | ------------------- | -------------------- |
| **Server-Side Request Forgery (SSRF)** | Restrict outbound biomedical queries | Strict allowlist of approved upstream domains (`clinicaltrials.gov`, `api.fda.gov`, `pubchem.ncbi.nlm.nih.gov`, `eutils.ncbi.nlm.nih.gov`, `rxnav.nlm.nih.gov`). |
| **API Denial of Service (DoS)** | Limit request volume & payload sizes | Sliding-window IP rate limiting (search, research, AI endpoints), 50 KB request payload cap, and timeout controls. |
| **Evidence Tampering & Score Forgery** | Prevent client-side score modification | All evidence scores and readiness tiers are strictly computed server-side from primary verified sources. |
| **Data Leakage & Secret Exposure** | Eliminate secrets from client bundles | Server-side execution for LLM/API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`), production source maps disabled, and automated redaction logging. |
| **Cross-User Data Access** | Isolate user notebooks & dossiers | Deny-by-default Firestore rules; access granted strictly when `request.auth.uid == userId`. Owner ID is immutable. |
| **Browser Exploitation (XSS / Clickjacking)** | Restrictive HTTP headers & CSP | Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options: DENY, X-Content-Type-Options: nosniff. |
| **Data Retention & Privacy** | Enforce zero unnecessary PII retention | Strict 30-day automatic data purge on all private notes and dossiers; right-to-be-forgotten API endpoint (`/api/user/delete-data`). |

---

## 5. Secret-Rotation Runbook

If an API key or service credential is ever suspected of exposure:

1. **Groq API Key**:
   - Navigate to [Groq Console API Keys](https://console.groq.com/keys).
   - Create a new API key.
   - Update `GROQ_API_KEY` in Vercel Project Settings > Environment Variables (Production & Preview).
   - Revoke and delete the old key in Groq Console.
   - Trigger a redeployment in Vercel.

2. **Google AI / Gemini API Key**:
   - Navigate to [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Generate a new API key.
   - Update `GEMINI_API_KEY` in Vercel.
   - Delete the old key in Google Cloud Console Credentials.

3. **Firebase Web API Key / Project Config**:
   - Navigate to [Firebase Console](https://console.firebase.google.com/).
   - Under Project Settings > General > Web Apps, verify authorized domains in Authentication > Settings > Authorized Domains.
   - If rotating Firebase Service Account, go to Project Settings > Service Accounts, generate a new private key, update Vercel environment variables, and delete the obsolete key.

---

## 6. Production Deployment Security Checklist

Before deploying to production:
- [x] Environment variables configured exclusively in Vercel dashboard (no secrets committed to source control).
- [x] `firestore.rules` deployed with deny-by-default and owner isolation.
- [x] `storage.rules` deployed with deny-by-default rules.
- [x] Custom domain added to Firebase Authentication > Settings > Authorized Domains.
- [x] Production source maps disabled (`productionBrowserSourceMaps: false`).
- [x] Automated CI checks (`npm test`, `npm audit`, CodeQL) passing.
- [x] Dependabot alerts and automated dependency updates enabled.
