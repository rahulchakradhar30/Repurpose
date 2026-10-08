# Repurpose — Deployment & Operations Guide

This guide describes how to build, test, and deploy **Repurpose** to production environments (Vercel, Firebase, and CI/CD).

---

## 1. Prerequisites & Environment Setup

Ensure Node.js 20+ and npm 10+ are installed. Copy `.env.example` to `.env.local` for local execution:

```bash
cp .env.example .env.local
```

### Environment Variables

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Public (Client/Server) | Canonical production domain (e.g. `https://drugrepurpose.vercel.app`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public (Client) | Firebase Web App API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public (Client) | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public (Client) | Firebase Project Identifier |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public (Client) | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public (Client) | Firebase Cloud Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Public (Client) | Firebase App ID |
| `GEMINI_API_KEY` | **Secret (Server Only)** | Google Gemini API Key for `/api/repurposing/ai-summary` |

> ⚠️ **Security Reminder:** Never expose `GEMINI_API_KEY` with a `NEXT_PUBLIC_` prefix.

---

## 2. Local Development & Testing

```bash
# Install dependencies with lockfile integrity
npm ci

# Run development server with Turbopack
npm run dev

# Run automated Vitest test suite (Unit, Integration, Security, Rules)
npm test

# Run ESLint validation
npm run lint

# Validate TypeScript types without emitting artifacts
npx tsc --noEmit
```

---

## 3. Production Build & Verification

```bash
# Execute standard Next.js production build
npm run build

# Start production server locally for verification
npm run start
```

---

## 4. Deploying to Vercel

1. Connect the GitHub repository in the Vercel Dashboard.
2. Under **Project Settings > Environment Variables**, add all environment keys from Section 1.
3. Verify that the build command is `npm run build` and the output directory is `.next`.
4. Deploy the `main` branch.

---

## 5. Firebase Security Rules Deployment

Deploy Cloud Firestore and Storage security rules directly using the Firebase CLI:

```bash
# Log in to Firebase
npx firebase login

# Deploy declarative security rules
npx firebase deploy --only firestore:rules,storage:rules
```

Rules enforce strict deny-by-default and prevent unauthenticated write/read operations outside of a user's own `/users/{userId}` path.
