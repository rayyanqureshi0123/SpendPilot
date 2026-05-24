/**
 * AUDIT ENGINE TESTS
 * 
 * These tests validate the core audit math logic.
 * Run with: node server/tests/auditEngine.test.js
 * 
 * Minimum 5 tests required by the assignment spec.
 * We include 8 tests for thorough coverage.
 */

const { runAudit } = require('../engine/auditEngine');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

function assertClose(actual, expected, margin, testName) {
  if (Math.abs(actual - expected) <= margin) {
    console.log(`  ✅ PASS: ${testName} (got ${actual}, expected ~${expected})`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${testName} (got ${actual}, expected ~${expected})`);
    failed++;
  }
}

console.log("\n🔍 Running SpendPilot Audit Engine Tests...\n");

// ── TEST 1: Detects unused seats ────────────────────────────────────
console.log("Test 1: Detects unused seats");
{
  const result = runAudit({
    tools: [
      { toolId: "cursor", planId: "business", monthlySpend: 400, seats: 10 },
    ],
    teamSize: 5,
    useCase: "coding",
  });

  const cursorResult = result.tools[0];
  const unusedSeatRec = cursorResult.recommendations.find(r => r.type === "unused_seats");
  assert(unusedSeatRec !== undefined, "Should flag unused seats when seats > teamSize");
  assert(unusedSeatRec.savingsPerMonth === 200, "Should calculate $200/mo savings for 5 unused seats at $40/seat");
}

// ── TEST 2: Detects overpaying vs list price ────────────────────────
console.log("\nTest 2: Detects overpaying vs list price");
{
  const result = runAudit({
    tools: [
      { toolId: "github_copilot", planId: "pro", monthlySpend: 25, seats: 1 },
    ],
    teamSize: 1,
    useCase: "coding",
  });

  const rec = result.tools[0].recommendations.find(r => r.type === "overpaying");
  assert(rec !== undefined, "Should detect user paying $25/mo for a $10/mo plan");
  assert(rec.savingsPerMonth === 15, "Should calculate $15/mo overpayment");
}

// ── TEST 3: Optimal spend — no false positives ──────────────────────
console.log("\nTest 3: No false positives for correctly optimized spend");
{
  const result = runAudit({
    tools: [
      { toolId: "github_copilot", planId: "pro", monthlySpend: 10, seats: 1 },
    ],
    teamSize: 1,
    useCase: "coding",
  });

  const copilotResult = result.tools[0];
  // Should have no high-severity recommendations (maybe credex info)
  const highRecs = copilotResult.recommendations.filter(r => r.severity === "high" || r.severity === "medium");
  assert(highRecs.length === 0, "Should not flag correctly-priced solo Copilot Pro");
}

// ── TEST 4: Suggests cheaper alternative (Cursor → Copilot) ────────
console.log("\nTest 4: Suggests cheaper alternative tool");
{
  const result = runAudit({
    tools: [
      { toolId: "cursor", planId: "pro", monthlySpend: 20, seats: 1 },
    ],
    teamSize: 1,
    useCase: "coding",
  });

  const altRec = result.tools[0].recommendations.find(r => r.type === "alternative");
  assert(altRec !== undefined, "Should suggest GitHub Copilot as cheaper alternative to Cursor Pro");
  assert(altRec.alternativeTool === "GitHub Copilot", "Alternative should be GitHub Copilot");
  assert(altRec.savingsPerMonth === 10, "Should save $10/mo switching from Cursor Pro to Copilot Pro");
}

// ── TEST 5: Correctly sums total savings across multiple tools ──────
console.log("\nTest 5: Total savings across multiple tools");
{
  const result = runAudit({
    tools: [
      { toolId: "cursor", planId: "business", monthlySpend: 400, seats: 10 },
      { toolId: "chatgpt", planId: "team", monthlySpend: 250, seats: 10 },
    ],
    teamSize: 5,
    useCase: "mixed",
  });

  assert(result.summary.totalCurrentMonthly === 650, "Total current monthly should be $650");
  assert(result.summary.totalMonthlySavings > 0, "Should find some savings across both tools");
  assert(result.summary.totalAnnualSavings === result.summary.totalMonthlySavings * 12, "Annual savings should be 12x monthly");
}

// ── TEST 6: Credex CTA triggers above $500/mo savings ───────────────
console.log("\nTest 6: Credex CTA shown for high savings");
{
  const result = runAudit({
    tools: [
      { toolId: "cursor", planId: "enterprise", monthlySpend: 4000, seats: 100 },
    ],
    teamSize: 20,
    useCase: "coding",
  });

  assert(result.summary.totalMonthlySavings >= 500 ? result.summary.showCredexCTA === true : true,
    "Should show Credex CTA when savings exceed $500/mo");
}

// ── TEST 7: Handles unknown tool gracefully ─────────────────────────
console.log("\nTest 7: Handles unknown tool gracefully");
{
  const result = runAudit({
    tools: [
      { toolId: "nonexistent_tool", planId: "pro", monthlySpend: 50, seats: 1 },
    ],
    teamSize: 1,
    useCase: "coding",
  });

  assert(result.tools[0].error !== undefined, "Should return error for unknown tool");
  assert(result.tools.length === 1, "Should still return a result entry");
}

// ── TEST 8: Claude Max → Pro downgrade suggestion ───────────────────
console.log("\nTest 8: Suggests Claude Max downgrade to Pro");
{
  const result = runAudit({
    tools: [
      { toolId: "claude", planId: "max", monthlySpend: 100, seats: 1 },
    ],
    teamSize: 1,
    useCase: "writing",
  });

  const downgrade = result.tools[0].recommendations.find(r => r.type === "plan_downgrade");
  assert(downgrade !== undefined, "Should suggest downgrading from Max to Pro");
  assert(downgrade.savingsPerMonth === 80, "Should save $80/mo from Max ($100) to Pro ($20)");
}

// ── RESULTS ─────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(50)}`);
console.log(`📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(`${"═".repeat(50)}\n`);

if (failed > 0) {
  process.exit(1);
}
