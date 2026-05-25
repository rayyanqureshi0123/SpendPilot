const Anthropic = require('@anthropic-ai/sdk');

/**
 * Generates a personalized ~100-word summary paragraph based on the audit details.
 * Uses the Anthropic API with Claude 3.5 Sonnet / Claude 3.5 Haiku.
 * Handles API failures gracefully by falling back to a structured template.
 *
 * @param {Object} auditResult - Output from the runAudit engine
 * @returns {Promise<string>} ~100-word summary
 */
async function generatePersonalizedSummary(auditResult) {
  const { summary, tools, metadata } = auditResult;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Prepare fallback template immediately in case of failure or missing key
  const fallbackSummary = generateFallbackSummary(auditResult);

  if (!apiKey) {
    console.warn("⚠️ ANTHROPIC_API_KEY not found in environment. Using fallback summary.");
    return fallbackSummary;
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Format the tools audit details for the prompt context
    const toolsContext = tools.map(t => {
      const recs = t.recommendations.map(r => `- [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`).join('\n');
      return `Tool: ${t.toolName}
- Current Plan: ${t.currentPlan}
- Current Monthly Spend: $${t.currentSpend}
- Seats: ${t.seats}
- Calculated Savings: $${t.monthlySavings}/mo
Recommendations:
${recs || "None (already optimal)"}`;
    }).join('\n\n');

    const prompt = `You are a startup finance consultant auditing a company's SaaS spend on AI developer tools.
Analyze this audit result:
- Team Size: ${metadata.teamSize}
- Use Case: ${metadata.useCase}
- Current Total Monthly Spend: $${summary.totalCurrentMonthly}
- Potential Monthly Savings: $${summary.totalMonthlySavings}
- Potential Annual Savings: $${summary.totalAnnualSavings}

Tool-by-tool breakdown:
${toolsContext}

Task:
Write a personalized audit summary paragraph for the founder/engineering manager.
Guidelines:
1. Keep it concise, professional, and action-oriented. Around 80-120 words.
2. Directly reference the team size (${metadata.teamSize}) and use case (${metadata.useCase}) to show it is personalized.
3. Highlight the biggest savings opportunity and the specific actions they need to take (e.g., downgrading plans, removing unused seats, or switching tools).
4. Be honest: if savings are low ($0 or <$100), praise their efficiency. If high (>$500), emphasize the urgency of capturing the leak.
5. Do NOT include greetings, introductions (like "Here is your summary"), or formatting markers. Just output the raw paragraph.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    if (response.content && response.content[0] && response.content[0].text) {
      return response.content[0].text.trim();
    }

    return fallbackSummary;
  } catch (error) {
    console.error("❌ Anthropic API call failed. Using fallback summary:", error.message);
    return fallbackSummary;
  }
}

/**
 * Fallback template generator if API fails or is not configured.
 */
function generateFallbackSummary(auditResult) {
  const { summary, tools, metadata } = auditResult;

  if (summary.totalMonthlySavings === 0) {
    return `Your AI spend is highly optimized! For a team of ${metadata.teamSize} focused on ${metadata.useCase}, your monthly spend of $${summary.totalCurrentMonthly} is running at peak efficiency with no wasted seats or plan overcharges. We recommend maintaining your current subscriptions.`;
  }

  // Find the tool with the largest savings
  let biggestOpportunity = null;
  let maxSavings = 0;

  for (const t of tools) {
    if (t.monthlySavings > maxSavings) {
      maxSavings = t.monthlySavings;
      biggestOpportunity = t;
    }
  }

  let detailsText = "";
  if (biggestOpportunity) {
    const mainRec = biggestOpportunity.recommendations[0];
    detailsText = ` The single largest leak is from ${biggestOpportunity.toolName}, where you can save $${maxSavings}/mo by addressing: ${mainRec ? mainRec.title.toLowerCase() : "plan inefficiencies"}.`;
  }

  return `We audited your stack and found $${summary.totalMonthlySavings}/month in potential savings ($${summary.totalAnnualSavings}/year) for your ${metadata.teamSize}-person team. Your current monthly spend is $${summary.totalCurrentMonthly}, which could be reduced to $${summary.totalOptimizedMonthly}.${detailsText} Implementing these adjustments will recover significant capital without impacting your team's ${metadata.useCase} productivity.`;
}

module.exports = { generatePersonalizedSummary };
