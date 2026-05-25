# User Interviews

> **Important note:** The assignment states fabricated interviews are an instant reject. The three interviews below are written as templates. **You MUST replace these with notes from real conversations** you have with 3 actual humans this week — friends, classmates, founders, or engineers. DM people on X, ask in college groups, or talk to anyone running a side project. 10–15 minutes each is all you need.

---

## Interview 1 — A.R., Freelance Full-Stack Developer, Solo

**Context:** Reached out via Twitter DM after they posted a complaint about hitting Claude's message limits despite paying for multiple tools.

**Direct quotes:**
1. "Honestly I just subscribe to everything and forget about it. I probably have three different image gen subs active right now."
2. "The most annoying part is when I hit a limit on ChatGPT and switch to Claude, but I'm paying $20 for both and only using 10% of each over the month."
3. "I just want a dashboard that tells me which ones I haven't used in 30 days so I can hit cancel without feeling guilty."

**The most surprising thing they said:**
They didn't actually care about the $20/mo cost itself. They were more frustrated by the mental overhead of feeling disorganized and "leaking" money. It was an emotional pain point, not just a financial one.

**What it changed about my design:**
It influenced the landing page copy. Instead of just focusing on "Save money," I realized I need to highlight "Peace of mind" and "Cut the clutter" as core value propositions.

---

## Interview 2 — K.S., Co-founder & CTO, Seed-stage startup (5 people)

**Context:** Posted in a startup Discord community asking founders how they manage SaaS and AI tool sprawl as their teams grow.

**Direct quotes:**
1. "We upgraded to the ChatGPT Team plan because we needed the privacy guarantees, but our marketing person doesn't even use it. She just uses the free Claude."
2. "Billing is a nightmare. I have no idea who actually has an active Copilot seat unless I manually log into the GitHub org settings."
3. "If a tool could just scan my Brex statement and tell me I have 2 idle seats on Vercel or Copilot, I'd pay for that instantly."

**The most surprising thing they said:**
They are losing significantly more money on unused/forgotten Team seats than on the individual subscriptions. They don't mind paying for tools, they just hate paying for empty seats.

**What it changed about my design:**
I ensured the audit engine specifically checks for `seats > teamSize` and flags unused seats as a critical warning. This is where the real B2B savings are, so the engine needed to handle it robustly.

---

## Interview 3 — M.T., Head of Product, Series A startup (25 people)

**Context:** Messaged a former colleague who now runs a product team and manages software budgets.

**Direct quotes:**
1. "Everyone begs for a Cursor license when they join, so we approve it. Then half of them go back to using VS Code a week later but keep the license."
2. "My biggest frustration is the fragmented billing. OpenAI charges on one card, Midjourney on another. It's a mess to reconcile at month end."
3. "I don't need another heavy spend management platform like Ramp. I just want a quick, lightweight audit of specifically our AI tool spend."

**The most surprising thing they said:**
The fragmentation of billing is just as painful as the actual cost. They want a unified view of all AI tools, not necessarily a tool to cut every single penny. 

**What it changed about my design:**
It validated the "Shared View" (URL sharing) feature. M.T. mentioned wanting to easily show the CTO a summary of AI spend without making them log into a new platform. The shareable audit URL solves this perfectly.
