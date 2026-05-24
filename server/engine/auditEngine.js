/**
 * AUDIT ENGINE — The core math that powers SpendPilot.
 * 
 * For each tool the user is paying for, the engine evaluates:
 * 1. Are they on the right plan for their team size?
 * 2. Is there a cheaper plan from the same vendor that fits?
 * 3. Is there a cheaper alternative tool for their use case?
 * 4. Could they save via discounted credits (Credex)?
 * 
 * This logic is intentionally hardcoded (not AI-generated at runtime).
 * A finance person should be able to read every recommendation and agree.
 */

const { pricingData, alternatives } = require('../data/pricingData');

/**
 * Runs a full audit on the user's AI tool stack.
 * 
 * @param {Object} input
 * @param {Array} input.tools - Array of { toolId, planId, monthlySpend, seats }
 * @param {number} input.teamSize - Total team size
 * @param {string} input.useCase - "coding" | "writing" | "data" | "research" | "mixed"
 * @returns {Object} Full audit result with per-tool breakdown and totals
 */
function runAudit({ tools, teamSize, useCase }) {
  const results = [];
  let totalCurrentMonthly = 0;
  let totalOptimizedMonthly = 0;

  for (const userTool of tools) {
    const { toolId, planId, monthlySpend, seats } = userTool;
    const toolData = pricingData[toolId];

    if (!toolData) {
      results.push({
        toolId,
        toolName: toolId,
        error: "Unknown tool — skipped",
      });
      continue;
    }

    const planData = toolData.plans[planId];
    if (!planData) {
      results.push({
        toolId,
        toolName: toolData.name,
        error: `Unknown plan "${planId}" — skipped`,
      });
      continue;
    }

    const expectedSpend = planData.pricePerSeat * seats;
    const currentSpend = monthlySpend || expectedSpend;
    totalCurrentMonthly += currentSpend;

    const recommendations = [];
    let optimizedSpend = currentSpend;

    // ── CHECK 1: Are they overpaying vs list price? ──────────────────
    if (monthlySpend > expectedSpend && expectedSpend > 0) {
      recommendations.push({
        type: "overpaying",
        severity: "high",
        title: "Paying above list price",
        description: `You're paying $${monthlySpend}/mo but the list price for ${planData.name} × ${seats} seats is $${expectedSpend}/mo. Check for duplicate charges or unused seats.`,
        savingsPerMonth: monthlySpend - expectedSpend,
      });
      optimizedSpend = Math.min(optimizedSpend, expectedSpend);
    }

    // ── CHECK 2: Are they on a plan that's too big for their team? ──
    const downgradeSuggestion = findCheaperSameVendorPlan(toolData, planId, seats, teamSize, useCase);
    if (downgradeSuggestion) {
      recommendations.push(downgradeSuggestion);
      optimizedSpend = Math.min(optimizedSpend, downgradeSuggestion.newSpend);
    }

    // ── CHECK 3: Too many seats relative to team size? ──────────────
    if (seats > teamSize && teamSize > 0) {
      const wastedSeats = seats - teamSize;
      const wastedCost = wastedSeats * planData.pricePerSeat;
      if (wastedCost > 0) {
        recommendations.push({
          type: "unused_seats",
          severity: "high",
          title: "Unused seats detected",
          description: `You have ${seats} seats but only ${teamSize} team members. Remove ${wastedSeats} unused seat${wastedSeats > 1 ? "s" : ""} to save $${wastedCost}/mo.`,
          savingsPerMonth: wastedCost,
        });
        optimizedSpend = Math.min(optimizedSpend, (teamSize * planData.pricePerSeat));
      }
    }

    // ── CHECK 4: Team plan for solo user? ───────────────────────────
    if (seats <= 1 && planData.bestFor && planData.bestFor.minSeats > 1) {
      const soloPlan = findSoloPlan(toolData, useCase);
      if (soloPlan && soloPlan.pricePerSeat < planData.pricePerSeat) {
        recommendations.push({
          type: "plan_downgrade",
          severity: "medium",
          title: "Team plan not needed for solo use",
          description: `You're on ${planData.name} ($${planData.pricePerSeat}/mo) as a solo user. Switch to ${soloPlan.name} at $${soloPlan.pricePerSeat}/mo.`,
          savingsPerMonth: planData.pricePerSeat - soloPlan.pricePerSeat,
          newSpend: soloPlan.pricePerSeat,
        });
        optimizedSpend = Math.min(optimizedSpend, soloPlan.pricePerSeat);
      }
    }

    // ── CHECK 5: Cheaper alternative tool? ──────────────────────────
    const altSuggestion = findCheaperAlternative(toolId, planId, currentSpend, seats, useCase);
    if (altSuggestion) {
      recommendations.push(altSuggestion);
      // Don't auto-apply alternative savings — it's a suggestion, not a downgrade
    }

    // ── CHECK 6: Credex discounted credits opportunity ──────────────
    const credexSavings = estimateCredexSavings(currentSpend, toolId);
    if (credexSavings > 0) {
      recommendations.push({
        type: "credex",
        severity: "info",
        title: "Save more with Credex discounted credits",
        description: `Credex sources discounted ${toolData.name} credits from companies that overforecast. Estimated savings: $${credexSavings.toFixed(0)}/mo (${Math.round((credexSavings / currentSpend) * 100)}% off retail).`,
        savingsPerMonth: credexSavings,
      });
    }

    // Calculate the final optimized spend (best non-alternative recommendation)
    const totalRecommendationSavings = currentSpend - optimizedSpend;
    totalOptimizedMonthly += optimizedSpend;

    // Sort recommendations: high severity first
    const severityOrder = { high: 0, medium: 1, low: 2, info: 3 };
    recommendations.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

    // Determine the overall verdict
    let verdict;
    if (totalRecommendationSavings === 0 && recommendations.length === 0) {
      verdict = "optimal";
    } else if (totalRecommendationSavings === 0 && recommendations.length > 0) {
      verdict = "minor_optimizations";
    } else if (totalRecommendationSavings > currentSpend * 0.3) {
      verdict = "significant_savings";
    } else {
      verdict = "some_savings";
    }

    results.push({
      toolId,
      toolName: toolData.name,
      currentPlan: planData.name,
      currentSpend,
      optimizedSpend,
      monthlySavings: totalRecommendationSavings,
      annualSavings: totalRecommendationSavings * 12,
      verdict,
      recommendations,
      seats,
    });
  }

  // ── Overall audit summary ─────────────────────────────────────────
  const totalMonthlySavings = totalCurrentMonthly - totalOptimizedMonthly;
  const totalAnnualSavings = totalMonthlySavings * 12;

  let overallVerdict;
  if (totalMonthlySavings === 0) {
    overallVerdict = "optimal";
  } else if (totalMonthlySavings < 100) {
    overallVerdict = "well_optimized";
  } else if (totalMonthlySavings < 500) {
    overallVerdict = "some_savings";
  } else {
    overallVerdict = "significant_savings";
  }

  return {
    summary: {
      totalCurrentMonthly,
      totalOptimizedMonthly,
      totalMonthlySavings,
      totalAnnualSavings,
      overallVerdict,
      toolsAudited: results.length,
      showCredexCTA: totalMonthlySavings >= 500,
    },
    tools: results,
    metadata: {
      teamSize,
      useCase,
      auditedAt: new Date().toISOString(),
    },
  };
}

// ── HELPER: Find a cheaper plan from the same vendor ──────────────────
function findCheaperSameVendorPlan(toolData, currentPlanId, seats, teamSize, useCase) {
  const currentPlan = toolData.plans[currentPlanId];
  if (!currentPlan || currentPlan.isFreeTier || currentPlan.isUsageBased) return null;

  const currentCost = currentPlan.pricePerSeat * seats;
  let bestAlternative = null;
  let bestCost = currentCost;

  for (const [planId, plan] of Object.entries(toolData.plans)) {
    if (planId === currentPlanId) continue;
    if (plan.isFreeTier) continue; // Don't recommend free tiers as downgrades
    if (plan.isUsageBased) continue;

    // Check if this plan supports the use case
    if (plan.bestFor && plan.bestFor.useCases && !plan.bestFor.useCases.includes(useCase) && useCase !== "mixed") {
      continue;
    }

    // Check if this plan supports the team size
    if (plan.bestFor) {
      const effectiveSeats = Math.max(seats, plan.minSeats || 0);
      if (plan.bestFor.maxSeats && effectiveSeats > plan.bestFor.maxSeats) continue;
    }

    // Check minimum seat requirements
    if (plan.minSeats && seats < plan.minSeats) continue;

    const planCost = plan.pricePerSeat * Math.max(seats, plan.minSeats || 0);

    if (planCost < bestCost) {
      bestCost = planCost;
      bestAlternative = {
        type: "plan_downgrade",
        severity: "medium",
        title: `Downgrade to ${plan.name}`,
        description: `Switch from ${currentPlan.name} ($${currentPlan.pricePerSeat}/seat) to ${plan.name} ($${plan.pricePerSeat}/seat). For ${seats} seat${seats > 1 ? "s" : ""}, this saves $${(currentCost - planCost).toFixed(0)}/mo.`,
        savingsPerMonth: currentCost - planCost,
        newSpend: planCost,
      };
    }
  }

  return bestAlternative;
}

// ── HELPER: Find the best solo plan ──────────────────────────────────
function findSoloPlan(toolData, useCase) {
  let bestPlan = null;
  let bestPrice = Infinity;

  for (const [, plan] of Object.entries(toolData.plans)) {
    if (plan.isFreeTier || plan.isUsageBased) continue;
    if (plan.minSeats && plan.minSeats > 1) continue;
    if (plan.bestFor && plan.bestFor.maxSeats === 1 || !plan.bestFor) {
      if (plan.pricePerSeat < bestPrice) {
        bestPrice = plan.pricePerSeat;
        bestPlan = plan;
      }
    }
  }

  return bestPlan;
}

// ── HELPER: Find a cheaper alternative tool ──────────────────────────
function findCheaperAlternative(toolId, planId, currentSpend, seats, useCase) {
  const toolData = pricingData[toolId];
  if (!toolData) return null;

  const category = toolData.category;

  // Find relevant alternatives
  const relevantAlts = alternatives[category]?.filter(
    (alt) => alt.from === toolId && (!alt.fromPlan || alt.fromPlan === planId)
  );

  if (!relevantAlts || relevantAlts.length === 0) return null;

  for (const alt of relevantAlts) {
    const altToolData = pricingData[alt.to];
    if (!altToolData) continue;

    const altPlanId = alt.toPlan || findBestPlanForTeamSize(altToolData, seats, useCase);
    if (!altPlanId) continue;

    const altPlan = altToolData.plans[altPlanId];
    if (!altPlan || altPlan.isUsageBased) continue;

    const altCost = altPlan.pricePerSeat * seats;

    if (altCost < currentSpend) {
      return {
        type: "alternative",
        severity: "low",
        title: `Consider switching to ${altToolData.name} ${altPlan.name}`,
        description: `${alt.savingsReason}. Potential savings: $${(currentSpend - altCost).toFixed(0)}/mo.`,
        savingsPerMonth: currentSpend - altCost,
        alternativeTool: altToolData.name,
        alternativePlan: altPlan.name,
        alternativeCost: altCost,
      };
    }
  }

  return null;
}

// ── HELPER: Find the best plan for a team size ───────────────────────
function findBestPlanForTeamSize(toolData, seats, useCase) {
  let bestPlan = null;
  let bestCost = Infinity;

  for (const [planId, plan] of Object.entries(toolData.plans)) {
    if (plan.isFreeTier || plan.isUsageBased || plan.isCustomPricing) continue;

    if (plan.bestFor) {
      if (plan.bestFor.minSeats && seats < plan.bestFor.minSeats) continue;
      if (plan.bestFor.maxSeats && seats > plan.bestFor.maxSeats) continue;
    }
    if (plan.minSeats && seats < plan.minSeats) continue;

    const cost = plan.pricePerSeat * Math.max(seats, plan.minSeats || 0);
    if (cost < bestCost) {
      bestCost = cost;
      bestPlan = planId;
    }
  }

  return bestPlan;
}

// ── HELPER: Estimate Credex discounted credit savings ────────────────
// Credex typically offers 15-30% off retail on AI infrastructure credits
function estimateCredexSavings(monthlySpend, toolId) {
  if (monthlySpend < 50) return 0; // Not worth it for very small spend

  // Credex discount rate varies by tool and volume
  let discountRate;
  if (monthlySpend >= 5000) {
    discountRate = 0.25; // 25% for high-volume
  } else if (monthlySpend >= 1000) {
    discountRate = 0.20; // 20% for medium-volume
  } else if (monthlySpend >= 200) {
    discountRate = 0.15; // 15% for lower-volume
  } else {
    discountRate = 0.10; // 10% base
  }

  return monthlySpend * discountRate;
}

module.exports = { runAudit };
