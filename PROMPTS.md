# PROMPTS.md — AI-Generated Audit Summary Prompts

This document details the LLM prompt design used to generate the personalized audit summary paragraph for the SpendPilot report.

## The Prompt

The prompt is constructed dynamically in `server/services/aiService.js` to feed the audit results as context to the Anthropic Claude API.

### Current Prompt Structure

```text
You are a startup finance consultant auditing a company's SaaS spend on AI developer tools.
Analyze this audit result:
- Team Size: {{teamSize}}
- Use Case: {{useCase}}
- Current Total Monthly Spend: ${{totalCurrentMonthly}}
- Potential Monthly Savings: ${{totalMonthlySavings}}
- Potential Annual Savings: ${{totalAnnualSavings}}

Tool-by-tool breakdown:
{{toolsContext}}

Task:
Write a personalized audit summary paragraph for the founder/engineering manager.
Guidelines:
1. Keep it concise, professional, and action-oriented. Around 80-120 words.
2. Directly reference the team size ({{teamSize}}) and use case ({{useCase}}) to show it is personalized.
3. Highlight the biggest savings opportunity and the specific actions they need to take (e.g., downgrading plans, removing unused seats, or switching tools).
4. Be honest: if savings are low ($0 or <$100), praise their efficiency. If high (>$500), emphasize the urgency of capturing the leak.
5. Do NOT include greetings, introductions (like "Here is your summary"), or formatting markers. Just output the raw paragraph.
```

---

## Why We Wrote the Prompt This Way

1. **Role-playing Persona**: Instructing the model to act as a *"startup finance consultant"* anchors its vocabulary to be professional, objective, and focus on ROI/capital efficiency rather than generic friendly AI talk.
2. **Context Separation**: We feed the data points as a clean, structured key-value list (`teamSize`, `useCase`, etc.) and a clear markdown list of tools and savings. This structured boundary keeps the model from hallucinating or mixing up numbers.
3. **Double Constraint on Output Format**: We specified both a strict word length (80-120 words) and explicitly told the model: *"Do NOT include greetings, introductions... Just output the raw paragraph."* This is crucial to prevent the model from prefixing with conversational fluff like "Sure! Here is the summary of your audit:" which ruins the page layout.
4. **Behavioral Branching**: Instructing the model to *"praise their efficiency"* for low-savings cases and *"emphasize urgency"* for high-savings cases ensures the tone adapts properly without needing custom routing code.

---

## What We Tried That Didn't Work

### 1. The "Too Creative" Approach
*   **What we tried**: Asking the model to write a "witty and interesting commentary" about the developer tools they chose.
*   **Why it failed**: The model spent too much time making generic jokes about ChatGPT or Cursor, and neglected the actual financial details. It felt unprofessional for a finance tool.
*   **The fix**: Replaced the instruction with a strict focus on "action-oriented financial advice."

### 2. Markdown Bold/Italics Overuse
*   **What we tried**: Letting the model format the output with Markdown.
*   **Why it failed**: The model generated different variations of bold headers (`### Summary`), bullet points, and inline bold text (`**$500/month**`), which broke the visual alignment of our frontend card component.
*   **The fix**: Explicitly asked for a single "raw paragraph" with no formatting markers.

### 3. Hallucinating Alternatives
*   **What we tried**: Letting the model suggest alternative tools not present in our pricing database (e.g., suggesting local Ollama setups or proprietary developer tools we don't track).
*   **Why it failed**: The finance recommendation engine must be strictly defensible. If the AI suggests switching to a tool with fake pricing, it discredits the entire app.
*   **The fix**: We only feed it tools and recommendations *already calculated* by our hardcoded engine. The AI is restricted to *summarizing* our engine's output rather than generating new math.
