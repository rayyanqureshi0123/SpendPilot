const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { runAudit } = require('./engine/auditEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SpendPilot API is running!', version: '1.0.0' });
});

// ── CORE: Run an AI spend audit ─────────────────────────────────────
app.post('/api/audit', (req, res) => {
  try {
    const { tools, teamSize, useCase } = req.body;

    // Validate input
    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one tool to audit.' });
    }
    if (!teamSize || teamSize < 1) {
      return res.status(400).json({ error: 'Please provide a valid team size.' });
    }
    if (!useCase) {
      return res.status(400).json({ error: 'Please provide a primary use case.' });
    }

    // Validate each tool entry
    for (const tool of tools) {
      if (!tool.toolId || !tool.planId) {
        return res.status(400).json({ error: 'Each tool must have a toolId and planId.' });
      }
      if (!tool.seats || tool.seats < 1) {
        return res.status(400).json({ error: `Invalid seat count for ${tool.toolId}.` });
      }
    }

    // Run the audit engine
    const result = runAudit({ tools, teamSize, useCase });

    res.json(result);
  } catch (err) {
    console.error('Audit error:', err);
    res.status(500).json({ error: 'Failed to run audit. Please try again.' });
  }
});

// ── GET: Pricing data (for the frontend form dropdowns) ─────────────
app.get('/api/pricing', (req, res) => {
  const { pricingData } = require('./data/pricingData');

  // Return a simplified version for the frontend
  const simplified = {};
  for (const [toolId, tool] of Object.entries(pricingData)) {
    simplified[toolId] = {
      name: tool.name,
      category: tool.category,
      plans: {},
    };
    for (const [planId, plan] of Object.entries(tool.plans)) {
      simplified[toolId].plans[planId] = {
        name: plan.name,
        pricePerSeat: plan.pricePerSeat,
        isFreeTier: plan.isFreeTier || false,
        isUsageBased: plan.isUsageBased || false,
        isCustomPricing: plan.isCustomPricing || false,
      };
    }
  }

  res.json(simplified);
});

app.listen(PORT, () => {
  console.log(`🚀 SpendPilot API running on port ${PORT}`);
});
