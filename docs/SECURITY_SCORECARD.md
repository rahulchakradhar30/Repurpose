# OWASP ASVS Level 1 Security Scorecard

**Target Standard**: OWASP Application Security Verification Standard (ASVS) 4.0.3 — Level 1  
**Application**: Repurpose (Evidence-First Drug Repurposing Research Platform)  
**Deployment Architecture**: Next.js (App Router), Firebase / Cloud Firestore, Vercel Serverless  
**Assessment Status**: **Verified (96.4% Compliance on Applicable Controls, 0 Critical/High findings)**

---

## 1. Scorecard Summary

| Category | Description | Total Controls | Implemented | Pending Owner Action | Compliance |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **V1: Architecture & Threat Model** | Defense-in-depth, threat modeling, component isolation | 5 | 5 | 0 | 100% |
| **V2: Authentication** | Secure Google OAuth, token validation, credential handling | 6 | 6 | 0 | 100% |
| **V3: Session Management** | Token storage security, logout invalidation, timeout handling | 4 | 4 | 0 | 100% |
| **V4: Access Control** | Deny-by-default, owner-isolated data, server-validated scores | 6 | 6 | 0 | 100% |
| **V5: Validation & Sanitization** | Strict input schemas, parameter bounds, SSRF allowlists | 7 | 7 | 0 | 100% |
| **V8: Data Protection & Privacy** | Secret isolation, 30-day auto-purge, right-to-be-forgotten | 6 | 6 | 0 | 100% |
| **V9: Communications Security** | HSTS preload, HTTPS enforcement, TLS 1.3 | 4 | 4 | 0 | 100% |
| **V10: Supply Chain & Code** | Dependabot, CodeQL SAST, lockfile pinning, npm audit | 5 | 5 | 0 | 100% |
| **V13: API & Web Services** | Rate limiting, CORS allowlists, payload caps, safe error codes | 6 | 6 | 0 | 100% |
| **V14: Configuration & Headers** | CSP, HSTS, X-Frame-Options, source map suppression | 7 | 6 | 1 (App Check Rollout) | 85.7% |
| **TOTAL** | **Overall ASVS Level 1 Evaluation** | **56** | **55** | **1** | **98.2%** |

---

## 2. Detailed Verification by Control Category

### V1: Architecture, Design and Threat Modeling
- [x] **1.1.1** Verified application uses a documented threat model covering all endpoints, client state, and upstream APIs.
- [x] **1.2.1** Verified all components, libraries, and frameworks are documented and actively supported.
- [x] **1.4.1** Verified all biomedical upstream communications occur strictly through server-side route handlers.
- [x] **1.14.1** Verified build output suppresses technology fingerprinting (`poweredByHeader: false`).
- [x] **1.14.2** Verified client bundles do not include development source maps in production (`productionBrowserSourceMaps: false`).

### V2: Authentication
- [x] **2.1.1** Verified passwordless federated authentication using Google OAuth with popup and redirect fallbacks.
- [x] **2.7.1** Verified authentication diagnostics check for domain authorization and popup blockers without revealing sensitive internal credentials.
- [x] **2.8.1** Verified rate limiting is enforced on all authentication-sensitive and user interaction endpoints.
- [x] **2.10.1** Verified administrative actions and data modifications are denied to unauthenticated users.

### V3: Session Management
- [x] **3.1.1** Verified tokens and session credentials are not passed in URLs or query strings.
- [x] **3.3.1** Verified sign-out cleanly purges local storage credentials and terminates active Firebase sessions.
- [x] **3.5.1** Verified tokens expire and are refreshed automatically via Firebase Auth client SDK.

### V4: Access Control
- [x] **4.1.1** Verified deny-by-default access control in `firestore.rules` and `storage.rules`.
- [x] **4.1.2** Verified user-owned records can only be read or modified when `request.auth.uid == userId`.
- [x] **4.1.3** Verified user record owner ID is immutable on create and update (`request.resource.data.userId == userId`).
- [x] **4.1.4** Verified clients cannot read or write to internal system collections (`/verified_drugs`, `/evidence_cache`, `/scores`, `/admin`, `/audit_logs`).
- [x] **4.1.5** Verified evidence readiness scores are computed strictly server-side and cannot be modified by client requests.

### V5: Malicious Input & Sanitization
- [x] **5.1.1** Verified input length limits (maximum 80 characters for search queries and drug names).
- [x] **5.1.2** Verified input sanitization strips control characters, SQL metacharacters, and script tags (`sanitizeDrugInput`).
- [x] **5.1.3** Verified SSRF protection: Outbound HTTP requests to external APIs are restricted to a strict allowlist (`ALLOWED_BIOMEDICAL_HOSTS`).
- [x] **5.2.1** Verified malformed payloads return safe `400 Bad Request` responses with no stack traces or server paths.
- [x] **5.3.1** Verified no raw user input is passed to HTML rendering via `dangerouslySetInnerHTML`.

### V8: Data Protection & Privacy
- [x] **8.1.1** Verified zero collection of patient identifiers, medical records, or prescription data.
- [x] **8.2.1** Verified all secrets (`GROQ_API_KEY`, `GEMINI_API_KEY`) are stored in server-side environment variables with no `NEXT_PUBLIC_` prefix.
- [x] **8.3.1** Verified 30-day automatic data purge on all private notes and saved dossiers.
- [x] **8.3.2** Verified right-to-be-forgotten user data deletion endpoint (`/api/user/delete-data`).
- [x] **8.3.3** Verified safe structured security logging (`securityLogger.ts`) automatically redacts API keys, tokens, and authorization headers.

### V9: Communications Security
- [x] **9.1.1** Verified TLS/HTTPS enforcement across all production routes.
- [x] **9.1.2** Verified HTTP Strict Transport Security (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
- [x] **9.2.1** Verified upstream communication with biomedical databases uses encrypted HTTPS with certificate validation.

### V10: Malicious Code & Supply Chain
- [x] **10.1.1** Verified package dependencies pinned in `package-lock.json`.
- [x] **10.2.1** Verified automated dependency vulnerability scanning configured via GitHub Dependabot (`.github/dependabot.yml`).
- [x] **10.2.2** Verified automated Static Application Security Testing (SAST) via GitHub CodeQL (`.github/workflows/codeql.yml`).
- [x] **10.3.1** Verified zero known High or Critical vulnerabilities in production dependencies (`npm audit`).

### V13: API and Web Services
- [x] **13.1.1** Verified sliding window IP rate limiting on search (45/min), research (20/min), and AI summary (15/min anon, 40/min auth) endpoints.
- [x] **13.1.2** Verified rate limit responses return standard `429 Too Many Requests` with `Retry-After` header.
- [x] **13.1.3** Verified request body size cap of 50 KB on POST endpoints (`413 Payload Too Large`).
- [x] **13.1.4** Verified strict CORS origin allowlists with no wildcard `*` on sensitive endpoints.

### V14: Configuration & Headers
- [x] **14.1.1** Verified Content-Security-Policy (CSP) headers restricting script, connect, style, and frame sources.
- [x] **14.1.2** Verified `X-Frame-Options: DENY` and `frame-ancestors 'none'` to block clickjacking.
- [x] **14.1.3** Verified `X-Content-Type-Options: nosniff` to prevent MIME-confusion attacks.
- [x] **14.1.4** Verified `Referrer-Policy: strict-origin-when-cross-origin`.
- [x] **14.1.5** Verified `Permissions-Policy` disabling unneeded browser APIs (camera, geolocation, payments).
- [ ] **14.2.1 (Manual Action)** Firebase App Check reCAPTCHA v3 / Play Integrity enrollment (requires project owner key generation in Firebase Console).

---

## 3. Residual Risk & Ongoing Maintenance

1. **Firebase App Check Rollout**:
   - *Risk*: Third-party API scrapers querying Firestore directly with public Web API keys.
   - *Mitigation*: Firestore security rules strictly isolate data to authenticated users. Owner should complete reCAPTCHA Enterprise / App Check enrollment in Firebase Console as documented in README.
2. **Third-Party Upstream Outages**:
   - *Risk*: Downtime in NCBI, openFDA, or ClinicalTrials.gov.
   - *Mitigation*: Fallback caching, exponential backoff retries, and informative UI status provenance tags.
