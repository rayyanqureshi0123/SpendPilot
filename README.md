# SpendPilot — AI Infrastructure Spend Auditor

**SpendPilot** is a free audit tool that helps startup founders and engineering managers discover how much they're overspending on AI subscriptions (Cursor, Copilot, Claude, ChatGPT, etc.) — and surfaces Credex as the solution for high-savings cases.

🔗 **Live URL:** [https://spendpilot.vercel.app](https://spendpilot.vercel.app)

---

## Quick Start

```bash
# Clone
git clone https://github.com/rayyanqureshi0123/SpendPilot.git
cd SpendPilot

# Backend
cd server
npm install
cp .env.example .env   # Add your keys
node server.js

# Frontend (new terminal)
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variables (server/.env)
```
PORT=5000
ANTHROPIC_API_KEY=sk-ant-...
MONGO_URI=mongodb+srv://...
RESEND_API_KEY=re_...
CLIENT_URL=http://localhost:5173
```

---

## Decisions

### 1. Hardcoded audit math instead of LLM-generated calculations
LLMs hallucinate numbers. A finance person reading "you can save $400/mo" needs to trust that number. We use deterministic rules with verified pricing data and only use Claude for the personalized summary paragraph.

### 2. React SPA + Express instead of Next.js
Next.js adds SSR complexity we don't need for an interactive form-based tool. A Vite React SPA gives us sub-second HMR, simpler deployment, and the Express backend gives full control over the API, database, and email logic.

### 3. Honeypot over hCaptcha for abuse protection
hCaptcha creates friction that kills conversion in a lead-gen funnel. A hidden honeypot field catches bots without any user-visible UI. We documented the tradeoff: sophisticated bots could bypass it, but at our traffic scale the conversion benefit outweighs the risk.

### 4. Anonymized share URLs with random IDs instead of slugs
We generate 8-character hex IDs (`crypto.randomBytes(4)`) for public audit URLs. This strips PII (email, company) from the shareable link while keeping the savings data visible — enabling the viral loop without privacy risk.

### 5. Graceful AI fallback with template generation
If the Anthropic API fails (rate limit, no credits, network error), we dynamically generate a mathematically accurate summary paragraph using the audit data. The user never sees an error. This resilience pattern is critical for a production lead-gen tool.
