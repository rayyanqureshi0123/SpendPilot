# Tests

All automated tests are located in `server/tests/auditEngine.test.js`.

## How to Run

```bash
cd server
node tests/auditEngine.test.js
```

Expected output: `16 passed, 0 failed out of 16 tests`

## Test Coverage

| # | Test Name | What It Covers | Assertions |
|---|-----------|----------------|------------|
| 1 | Detects unused seats | Flags when `seats > teamSize`. Verifies savings = (unused seats × price per seat). | 2 |
| 2 | Detects overpaying vs list price | Catches when user reports $25/mo but the official list price is $10/mo. | 2 |
| 3 | No false positives for optimized spend | Ensures the engine does NOT manufacture savings for a correctly-priced solo Copilot Pro user. | 1 |
| 4 | Suggests cheaper alternative tool | Recommends GitHub Copilot ($10/mo) as a cheaper alternative to Cursor Pro ($20/mo) for coding use case. | 3 |
| 5 | Total savings across multiple tools | Validates aggregate `totalCurrentMonthly`, confirms savings > 0 across a multi-tool stack, and verifies `annualSavings = monthlySavings × 12`. | 3 |
| 6 | Credex CTA shown for high savings | Confirms `showCredexCTA` is `true` when total savings exceed $500/mo. | 1 |
| 7 | Handles unknown tool gracefully | Passes in a non-existent `toolId` and verifies the engine returns an error flag without crashing. | 2 |
| 8 | Suggests Claude Max downgrade to Pro | Verifies the plan-downgrade logic recommends moving from Max ($100/mo) to Pro ($20/mo), saving $80/mo. | 2 |

**Total: 8 test blocks, 16 assertions, all passing.**

## CI Integration

Tests run automatically on every push to `main` via `.github/workflows/ci.yml`. The workflow also verifies the frontend TypeScript compilation succeeds.
