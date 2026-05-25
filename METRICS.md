# Metrics

## North Star Metric

**Qualified Leads Generated per Week** — defined as a user who completes an audit showing ≥$100/mo in savings AND submits their email.

### Why this metric?
SpendPilot is a lead-generation tool, not a SaaS product. DAU or "time on site" are vanity metrics here. The only thing that matters is whether the tool generates email-captured leads that Credex sales can close. A "qualified" lead (one with real, calculable savings) converts at 3–5x the rate of a generic signup.

---

## 3 Input Metrics That Drive the North Star

### 1. Audit Completion Rate
**Definition:** % of visitors who land on the page AND click "Generate Instant Audit."
**Why it matters:** If people bounce before completing the form, nothing downstream works. Target: 40%+ completion rate.
**How to improve:** Reduce form friction (fewer required fields), add trust signals, optimize page load speed.

### 2. Savings-Positive Rate
**Definition:** % of completed audits that surface ≥$100/mo in savings.
**Why it matters:** If the engine returns "$0 savings" for everyone, we generate no qualified leads. This metric tells us if our audit logic is calibrated correctly — aggressive enough to find real waste, honest enough not to manufacture it.
**Target:** 60% of audits should find some savings. If it's below 40%, our pricing data or rules are stale.

### 3. Email Capture Rate (Post-Audit)
**Definition:** % of users who see audit results AND enter their email to save the report.
**Why it matters:** This is the conversion gate. The audit is the value; the email is the payment. Target: 25%+ capture rate.
**How to improve:** Better CTA copy, emphasize the shareable URL, add "email me a PDF" as the hook.

---

## What I'd Instrument First

1. **PostHog or Mixpanel event tracking** on: `page_view`, `audit_started`, `audit_completed`, `email_captured`, `share_link_copied`.
2. **Server-side logging** of `savings_amount` per audit to build a histogram of savings distribution.
3. **Funnel visualization:** Landing → Form Started → Audit Completed → Email Captured → Credex CTA Clicked.

## Pivot Trigger

If after 500 completed audits, the **email capture rate is below 10%**, the value proposition isn't strong enough to earn the email. At that point, we either:
- Redesign the results page to make the savings more visceral (comparison charts, "you're in the top 20% of overspenders")
- Or pivot to a different lead magnet entirely (e.g., a benchmark report instead of an individual audit)
