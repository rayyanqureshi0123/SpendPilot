# DevLog

## Day 1 — 2026-05-24
**Hours worked:** 6
**What I did:**
- Created the GitHub repo and initialized the project structure (root, `/client`, `/server`)
- Initialized Vite + React + TypeScript frontend with Tailwind CSS v3 and PostCSS
- Initialized Express backend with cors and dotenv
- Built the core pricing data file (`server/data/pricingData.js`) with verified May 2026 prices for all 8 tools: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf
- Built the hardcoded audit engine (`server/engine/auditEngine.js`) with 6 deterministic checks: overpaying vs list, plan downgrade, unused seats, solo on team plan, cheaper alternatives, and Credex discount eligibility
- Wrote 8 test blocks (16 assertions) for the audit engine
- Created stub files for all 12 required `.md` documents
- Pushed first commit to GitHub

**What I learned:**
The hardest part was researching current pricing for 8 different tools across multiple plan tiers. Pricing pages are inconsistent — some show per-seat pricing, others show flat monthly rates. I had to normalize everything to a per-seat-per-month basis.

**Blockers / what I'm stuck on:**
Vite's default TypeScript config splits into `tsconfig.app.json` and `tsconfig.node.json`, which confuses shadcn CLI. Need to configure path aliases carefully tomorrow.

**Plan for tomorrow:**
Integrate Anthropic AI for personalized summaries. Build the React frontend form and results page.

---

## Day 2 — 2026-05-25
**Hours worked:** 8
**What I did:**
- Installed `@anthropic-ai/sdk` and built `aiService.js` with Claude 3.5 Haiku integration
- Implemented graceful fallback: if the API fails (rate limit, no credits, network error), a template generator produces a mathematically accurate summary using the audit data
- Resolved shadcn/ui initialization issues with Vite's split tsconfig by configuring path aliases in both `tsconfig.json` and `vite.config.ts`
- Installed shadcn components: Card, Input, Select, Label, Button
- Built the complete React frontend: multi-tool spend input form, dynamic results dashboard, hero savings card, per-tool breakdown, lead capture form with honeypot abuse protection
- Set up MongoDB Atlas and Mongoose for lead storage
- Created Lead schema with anonymized `shareId` for public URLs
- Added `/api/leads` (POST) and `/api/audit/:shareId` (GET) endpoints
- Integrated Resend for transactional confirmation emails
- Created GitHub Actions CI workflow (`.github/workflows/ci.yml`)
- Wrote all business strategy documents (GTM, Economics, Metrics, Landing Copy, Architecture)

**What I learned:**
The Anthropic API returned a 400 error because my free credits had run out. The fallback system I built caught it perfectly — the user never saw an error. This validated the architecture decision to never trust external APIs for critical-path functionality.

**Blockers / what I'm stuck on:**
TypeScript 6.0 deprecated the `baseUrl` compiler option. Had to add `"ignoreDeprecations": "6.0"` to silence the build error. Also, `tw-animate-css` (installed by shadcn) uses `@utility` directives that trigger lightningcss warnings during production build — these are harmless but noisy.

**Plan for tomorrow:**
Deploy to Vercel. Polish the UI. Write DEVLOG, REFLECTION, and USER_INTERVIEWS. Push final commits.

---

## Day 3 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:**
- [Fill in what you did on Day 3]

**What I learned:**
- [Fill in what you learned on Day 3]

**Blockers / what I'm stuck on:**
- [Fill in any blockers on Day 3]

**Plan for tomorrow:**
- [Fill in plan for tomorrow on Day 3]

---

## Day 4 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:**
- [Fill in what you did on Day 4]

**What I learned:**
- [Fill in what you learned on Day 4]

**Blockers / what I'm stuck on:**
- [Fill in any blockers on Day 4]

**Plan for tomorrow:**
- [Fill in plan for tomorrow on Day 4]

---

## Day 5 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:**
- [Fill in what you did on Day 5]

**What I learned:**
- [Fill in what you learned on Day 5]

**Blockers / what I'm stuck on:**
- [Fill in any blockers on Day 5]

**Plan for tomorrow:**
- [Fill in plan for tomorrow on Day 5]

---

## Day 6 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:**
- [Fill in what you did on Day 6]

**What I learned:**
- [Fill in what you learned on Day 6]

**Blockers / what I'm stuck on:**
- [Fill in any blockers on Day 6]

**Plan for tomorrow:**
- [Fill in plan for tomorrow on Day 6]

---

## Day 7 — [YYYY-MM-DD]
**Hours worked:** [X]
**What I did:**
- [Fill in what you did on Day 7]

**What I learned:**
- [Fill in what you learned on Day 7]

**Blockers / what I'm stuck on:**
- [Fill in any blockers on Day 7]

**Plan for tomorrow:**
- [Fill in plan for tomorrow on Day 7]

---

> **Note:** I received the assignment late relative to the 7-day window, so the bulk of my work is concentrated in Days 1–2. I chose depth and completeness over spreading thin work across more days. The git history reflects honest timestamps.
