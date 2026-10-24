# CareBridge AI — From Emergency Scene to Continued Care

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Clinical Prototype](https://img.shields.io/badge/Status-Demonstration%20Prototype-amber?style=flat)]()

**CareBridge AI** is an AI-powered emergency coordination and healthcare continuity platform designed to bridge the vulnerable gap between the accident scene, hospital emergency triage, and long-term patient recovery.

> **CRITICAL MEDICAL & LEGAL NOTICE:**
> CareBridge AI is an engineering demonstration prototype. It is **NOT** a certified emergency dispatch system, **NOT** a substitute for national emergency telephone services (**112 / 108** in India, 911 in the US), and **NOT** a clinically validated medical device. All clinician profiles, patient records, and hospital facilities included in the default demonstration environment are synthetic entities.

---

## 1. The Three Connected Problem Statements

CareBridge AI unites three critical healthcare coordination challenges into a single, cohesive workflow:

```
[ Accident Scene ]  ──►  [ Hospital ER ]  ──►  [ Clinician Assessment ]  ──►  [ Continued Recovery ]
       │                        │                            │                           │
  PS-40 QR Bridge         Hospital Queue               PS-39 Plain Lang.           PS-35 Follow-up
(Time-Limited Token)   (Nearby Facility Dispatch)   (Gemini AI + Hindi + TTS)    (Reminders & Missed)
```

1. **PS-40: Consent-Based Emergency Patient Record Bridge**
   - Bystanders submit minimal incident observations and generate a cryptographically unpredictable, time-limited QR access token.
   - Emergency responders scan the QR to inspect vital triage parameters (location, observations, category) without exposing full medical histories.
   - Server-enforced 24-hour expiration and instant 1-click patient/reporter revocation.

2. **PS-39: Accessible Care Instructions Assistant**
   - Clinician-approved discharge notes are simplified using server-side **Google Gemini AI** into plain English and Hindi.
   - Structured, interactive daily checklists with priority badges (Critical vs Standard).
   - Audio text-to-speech (TTS) accessibility in English and Hindi.
   - **Clinical Safety Rules:** AI never invents dosages, alters medication names, or softens red-flag emergency symptoms. Mandatory clinician sign-off workflow.

3. **PS-35: Patient Follow-up Reminder System**
   - Post-discharge continuity tracking through scheduled, reminder-sent, confirmed, and missed states.
   - Operational escalation tasks for missed appointments (never silently altering treatment plans).
   - In-app reminder status lifecycle and 1-click rescheduling.

---

## 2. Key Architecture & File Structure

```
medical/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Global layout, AuthProvider, EmergencyBanner, Navbar, Footer
│   │   ├── page.tsx                       # Landing page with Scene-to-Care workflow & role switcher
│   │   ├── globals.css                    # Healthcare color tokens, emergency animations, accessibility
│   │   ├── report-emergency/page.tsx      # Mobile-first incident reporting with GPS, triage & photo upload
│   │   ├── incident/[incidentId]/page.tsx # Restricted incident tracking, QR controls, hospital radar
│   │   ├── emergency-access/[token]/page.tsx # PS-40 QR validation (Active, Expired, Revoked screens)
│   │   ├── hospital/dashboard/page.tsx    # Hospital ER incoming queue, acknowledge & handover
│   │   ├── clinician/
│   │   │   ├── dashboard/page.tsx         # Clinician trauma queue & care plan summary
│   │   │   └── cases/[incidentId]/page.tsx # AI Instructions Simplifier, Prescriptions, Follow-up
│   │   ├── patient/dashboard/page.tsx     # Patient recovery portal, QR revocation, checklist, reminders
│   │   ├── care-team/dashboard/page.tsx   # PS-35 appointment manager, missed visit escalation
│   │   ├── admin/dashboard/page.tsx       # Facility directory, immutable audit trail, mode switcher
│   │   ├── login/page.tsx                 # 1-click persona quick logins for evaluators
│   │   ├── privacy/page.tsx               # Minimum data collection & encryption disclosure
│   │   ├── about/page.tsx                 # Product scope, problem statements & clinical boundaries
│   │   └── api/
│   │       ├── care-instructions/simplify/route.ts # Server-side Gemini AI endpoint with safety checks
│   │       └── qr/verify/route.ts         # Server-side cryptographic token validation endpoint
│   ├── components/
│   │   ├── EmergencyBanner.tsx            # Persistent red alert: "Dial 112 / 108 — Do not delay care"
│   │   ├── Navbar.tsx                     # Brand logo, role switcher, prototype modal
│   │   ├── QRDisplay.tsx                  # QR generator, live countdown, copy link, revoke action
│   │   └── HospitalMap.tsx                # Geodesic distance radar & facility status inspector
│   └── lib/
│       ├── types.ts                       # Complete TypeScript interfaces for all 14 entities
│       ├── demo-db.ts                     # In-memory demo database with rich synthetic seed data
│       ├── supabase.ts                    # Supabase Auth client & demo auth store
│       ├── hospital-adapter.ts            # Hospital Integration Adapter (Demo / REST / Unavailable)
│       ├── gemini.ts                      # Server-side Gemini AI client with clinical safeguards
│       ├── security.ts                    # Rate limiting, SHA-256 token hashing, signed URLs
│       └── auth-context.tsx               # Role management & 1-click evaluator role switcher
├── supabase/
│   └── migrations/
│       └── 20261024000000_carebridge_schema.sql # 14 tables, indexes, and Row Level Security policies
├── .env.example                           # Documented environment variable template
├── .env.local                             # Local development configuration (Demo Mode enabled)
└── package.json
```

---

## 3. Hospital Integration Adapter (Section 3 Compliance)

To prevent false representations of external hospital delivery, CareBridge AI includes a 3-mode integration adapter:

* **Mode A: DEMO MODE (Active by default)**
  Minimal packets are dispatched to seeded in-memory demonstration hospital dashboards (e.g. AIIMS Delhi Demo, Safdarjung Demo). Packets appear directly in the Hospital Responder queue.
* **Mode B: INTEGRATION-READY MODE**
  Configured for verified hospital endpoints with HTTPS POST, authentication headers, automatic retries, and delivery confirmation webhooks.
* **Mode C: UNAVAILABLE MODE**
  If a destination facility is unconfigured or unreachable, the system explicitly reports delivery failure and instructs the user to dial **108 / 112** immediately.

---

## 4. Quick Start & Local Execution

### Prerequisites
- Node.js 18+ (tested on Node v24.14.1)
- npm or pnpm

### Setup
```bash
# Clone or navigate to the directory
cd medical

# Dependencies are already installed, but if setting up fresh:
npm install

# Copy environment variables (already seeded in .env.local)
cp .env.example .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. End-to-End Evaluation Walkthrough Guide

Follow this 5-minute journey to experience all three problem statements in action:

1. **Step 1: Bystander Emergency Report (The Scene)**
   - Navigate to `/report-emergency` or click **"Report Emergency"**.
   - Notice the prominent safety alert urging users to call **112 / 108** for life-threatening emergencies.
   - Click **"📍 Auto-Detect GPS Location"** or type an address.
   - Enter injury details (e.g. *"Forearm abrasion, suspected knee fracture"*).
   - Check the **Emergency Data-Sharing Authorization** checkbox and submit.

2. **Step 2: Restricted Incident Tracking & QR Bridge (PS-40)**
   - You are redirected to `/incident/[incidentId]`.
   - Inspect the **Secure Emergency QR Code** with its active 24-hour countdown timer and permitted scopes.
   - Observe the **Participating Government Hospitals Radar**, which calculates geodesic distances (Haversine) to nearby facilities.

3. **Step 3: First Responder QR Validation (PS-40)**
   - Navigate to `/emergency-access/demo`.
   - Use the **Evaluator Quick Switcher** at the top to test all three token states:
     - **Active Token:** Displays permitted emergency triage details (location, observations, category).
     - **Expired Token:** Displays clear expired-token denial screen with timestamp.
     - **Revoked Token:** Demonstrates server-enforced denial after patient revocation.

4. **Step 4: Hospital Emergency Queue & Handover**
   - Click the role switcher in the navbar and select **"Hospital Emergency Responder"** (or visit `/hospital/dashboard`).
   - Observe the incoming emergency incident queue.
   - Click **"Acknowledge"** or **"Accept Case"** to log the hospital triage handover.
   - Click **"Open Clinician Assessment Suite"**.

5. **Step 5: Clinician Review & AI Care Instructions (PS-39)**
   - On the Clinician Case Review page (`/clinician/cases/[incidentId]`), inspect the **PS-39 AI Care Instructions** tab.
   - Click **"Simplify with Gemini AI"**.
   - Review the side-by-side comparison: complex medical jargon is simplified into plain English and Hindi with an extracted action checklist.
   - Toggle to **हिंदी (Hindi)** and click **"Listen Aloud"** to test Text-to-Speech audio.
   - Click **"Approve Clinical Care Instructions"** to complete the mandatory physician sign-off.
   - Switch to the **Clinical Prescription** tab and click **"Issue Electronic Prescription"**.
   - Switch to the **Schedule Follow-up** tab and schedule an orthopedic review.

6. **Step 6: Patient Continuity Portal (PS-35)**
   - Switch role to **"Patient"** (or visit `/patient/dashboard`).
   - Review your active QR bridge and test the **"Revoke Access"** button.
   - View your approved care instructions in English or Hindi and check off items in the **Recovery Action Checklist**.
   - Inspect your scheduled follow-up appointment.

7. **Step 7: Care Team & Missed Visit Escalation (PS-35)**
   - Switch role to **"Care Team Member"** (or visit `/care-team/dashboard`).
   - Inspect the appointment manager and observe the **Missed Visit Operational Escalation** for missed appointments.

8. **Step 8: Platform Governance & Audit Logs**
   - Switch role to **"Platform Administrator"** (or visit `/admin/dashboard`).
   - Inspect the immutable audit log recording every incident submission, QR scan, hospital acknowledgement, and clinical sign-off.
   - Review the hospital directory and integration adapter modes.

---

## 6. Non-Negotiable Clinical Safety Guardrails

| Safety Rule | Implementation |
|---|---|
| **No Photo Diagnosis** | Uploaded photos are stored in private storage for authorized surgical review. Automated computer vision diagnosis is strictly prohibited. |
| **No AI Prescriptions** | AI models are blocked from prescribing medicines or inventing dosages. Prescriptions require authenticated human clinician sign-off. |
| **Preservation of Medical Meaning** | During Gemini simplification, exact drug names, dosages (e.g. 500mg), frequencies, and red-flag return precautions are preserved verbatim. |
| **Mandatory Clinician Sign-Off** | All AI care instructions remain in "Draft" state until an authorized physician formally reviews and signs off. |
| **No False Delivery Promises** | If an external hospital endpoint cannot be confirmed, the system enters "Unavailable Mode" and directs users to dial 108/112. |

---

## 7. Database Migration (PostgreSQL / Supabase)

The complete SQL migration script defining all 14 entities and Row Level Security (RLS) policies is located at:
`supabase/migrations/20261024000000_carebridge_schema.sql`

To apply to a live Supabase project:
```bash
npx supabase db push
```

---

## 8. License & Prototype Limitations

CareBridge AI is released as an open healthcare coordination prototype under the MIT License. Developed for responsible healthcare innovation and demonstration purposes.
