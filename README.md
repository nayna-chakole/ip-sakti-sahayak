# IP-SAKTI Sahayak
**Citation-Grounded AI Assistant for Intellectual Property & Regulatory Guidance in Ayurvedic Products**
*Smart India Hackathon 2026 | Problem Statement 26045 | Team Prism*
*Ministry of Ayush / All India Institute of Ayurveda (AIIA)*

---

## 1. Problem Statement Context
Ayurvedic formulations, poly-herbal mixtures, and traditional wellness products operate under complex, intersecting statutory frameworks in India:
- **The Patents Act, 1970** (Statutory exclusions under Section 3(p) for traditional knowledge and Section 3(e) for mere admixtures).
- **The Biological Diversity Act, 2002** (Mandatory Access and Benefit Sharing [ABS] approval under Section 3, Section 4, and Section 6 before filing IP applications or commercializing biological resources).
- **Food Safety and Standards (Ayurveda Aahar) Regulations, 2022** (FSSAI regulatory pathways for traditional dietary recipes without therapeutic claims).
- **Traditional Knowledge Digital Library (TKDL)** (Prior art citations from classical Samhitas).
- **The Geographical Indications of Goods Act, 1999** (GI recognition for regional herbal cultivars).

Entrepreneurs, vaidyas, and researchers often face regulatory confusion or patent rejections due to lack of citation-grounded guidance. **IP-SAKTI Sahayak** solves this by establishing a deterministic, citation-backed legal guidance workspace.

---

## 2. Architecture & Pipeline

```
[ User Query / Product Description ]
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Classification Engine (Deterministic Rule-Based)         │
│    - 6 statutory attributes (use, origin, form, novelty,     │
│      sourcing, target market)                               │
│    - LLM NEVER decides the category                          │
│    - Categorizes into: Classical / Modified / Proprietary / │
│      Phytopharmaceutical / Ayurveda Aahar / Cosmetic        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Keyword-Based Statutory Retriever                         │
│    - Scans ONLY loaded statutory Acts and Regulations       │
│    - Respects active jurisdiction (India vs International)  │
│    - Scores sections based on title, keywords & category    │
│    - If 0 sections match: Refuses out-of-scope question     │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Top 5 statutory sections)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Gemini LLM Grounded Generator (Server-Side Only)         │
│    - Strictly instructed to answer ONLY from provided text  │
│    - Returns structured JSON: { answer, citations, conf }   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Plain-Code Citation Validator (Deterministic)            │
│    - Verifies that every cited Act and Section was actually │
│      retrieved from the authenticated corpus                │
│    - Discards invalid citations                             │
│    - If none valid: returns Out-of-Scope notice             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
[ Grounded Answer with Clickable Statutory Citation Chips ]
```

---

## 3. Key Modules & Implementation Details

- **Deterministic Classification:** Implemented in `server/classifier.ts`. Follows statutory rules matching Drugs and Cosmetics Act 1940 (First Schedule), Patents Act 1970 (Section 3(p), 3(e)), Biological Diversity Act 2002, and FSSAI Ayurveda Aahar Regulations 2022.
- **Reference Corpus:** Contains statutory provisions stored in `server/knowledge/referenceCorpus.ts`.
- **Knowledge Base Manager:** Allows users to inspect sections, view Gazette source links, and toggle document states in `server/knowledge/index.ts`.
- **ABS Compliance Helper:** Guides researchers on botanical binomial identification, sourcing invoices, and NBA Section 6 Form III filing.
- **TKDL Prior-Art Risk Alert:** Warns applicants when formulation origins match classical texts, linking to `https://tkdl.res.in`.
- **Facilitator Escalation Dossier:** Exports a structured text/JSON audit dossier of the user, classification matrix, ABS checklist, and chat transcript.
- **Multilingual Support (i18n):** Complete localized UI strings in English, Hindi (हिंदी), and Marathi (मराठी) stored in `/src/i18n/*.json`.

---

## 4. Security & Privacy Disclosures
- **Zero API Key Leakage:** `GEMINI_API_KEY` is accessed exclusively in server-side Node.js code (`server/gemini.ts`). It is never injected into Vite or frontend bundles.
- **Password Security:** All passwords are salted and hashed using `bcrypt` (10 rounds).
- **Authentication & Sessions:** JSON Web Tokens (JWT) signed with `JWT_SECRET` and stored in `httpOnly`, `sameSite=lax` cookies.
- **Brute-Force Rate Limiting:** 5 failed login attempts per email per 15 minutes triggers a temporary lock.
- **DPDP Act, 2023 Compliance:** Explicit consent agreement collected during user registration.

---

## 5. SIH PS 26045 Compliance & Staged Architecture

1. **Version-Aware Legal Corpus & Traceability:**
   - Every statutory chunk maintains authentic provenance metadata: Act/Treaty title, administering statutory authority, jurisdiction, initial effective date, last amended date, official gazette edition, and canonical government portal link (e.g. `ipindia.gov.in`, `nbaindia.org`, `ayush.gov.in`, `fssai.gov.in`, `fda.gov`, `ema.europa.eu`, `absch.cbd.int`).
   - Zero hallucinated URLs: only verifiable official links are cited.

2. **Safe Legal Abstention & Human Review:**
   - If user inquiries fall outside the Ayush/IP domain, contain insufficient technical detail, or lack statutory grounding (< 0.5 retrieval confidence), the system safely abstains with `abstained: true` and activates the **"Human Review Recommended"** status.
   - Refusal notices are delivered in the user's selected language (English, Hindi, or Marathi) with actionable escalation routes to patent attorneys and state licensing authorities.

3. **Separate International & Provenance Regimes:**
   - Indian Biological Diversity Act (BDA 2002/2023) Section 3 Form I and Section 6 Form III are strictly applied when Indian biological resources are accessed or exported.
   - Foreign biological resources utilize Nagoya Protocol IRCC and domestic access regulations of the provider nation.
   - Target markets (US FDA DSHEA structure/function vs EU THMPD 15-year rule) are disaggregated from resource provenance.

4. **Privacy, Security & Minimal Audit Trail (DPDP Act 2023):**
   - User analysis records are isolated per user account.
   - Each analysis event records minimal audit metadata (`analyzedAt`, `jurisdictionApplied`, `language`, `corpusVersion`, `securityClassification: RESTRICTED_CONFIDENTIAL`) without storing unnecessary sensitive formulation trade secrets.
   - Zero credentials, secrets, or JWT keys in source code.

5. **Staged External Connectors (Planned Extensions):**
   - **Digital India Bhashini Voice/Speech Pipeline:** Staged architecture for ULCA ASR/TTS voice query intake for non-literate and regional Ayush practitioners across 22 scheduled Indian languages.
   - **Official Paid Legal Registry Connectors:** Architectural hooks for integration with paid or authenticated institutional APIs (e.g., InPASS patent office database, Manupatra, SCC Online, and WIPO PATENTSCOPE API) once institutional API credentials and government MOUs are provisioned.

---

## 6. Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env)
# Set your GEMINI_API_KEY and JWT_SECRET
cp .env.example .env

# 3. Start development server (Port 3000)
npm run dev

# 4. Production build
npm run build
npm start
```
