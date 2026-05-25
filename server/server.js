const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { runAudit } = require('./engine/auditEngine');
const { generatePersonalizedSummary } = require('./services/aiService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
if (process.env.MONGO_URI && process.env.MONGO_URI !== 'your_mongodb_connection_string_here') {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.log('⚠️ MONGO_URI not found. Starting without database.');
}

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SpendPilot API is running!', version: '1.0.0' });
});

// ── CORE: Run an AI spend audit ─────────────────────────────────────
app.post('/api/audit', async (req, res) => {
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

    // Generate the personalized summary via LLM (or fallback)
    result.summary.aiSummary = await generatePersonalizedSummary(result);

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

// ── POST: Capture lead and save audit ───────────────────────────────
app.post('/api/leads', async (req, res) => {
  try {
    const { email, companyName, role, teamSize, auditResult } = req.body;

    if (!email || !teamSize || !auditResult) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string_here') {
      // Simulate success if DB is not connected
      return res.json({ 
        message: 'DB not connected. Lead simulated.',
        shareableUrl: `http://localhost:5173/audit/simulated-${Math.random().toString(36).substring(7)}`
      });
    }

    const Lead = require('./models/Lead');
    const crypto = require('crypto');
    
    // Generate a unique 8-character ID for public sharing
    const shareId = crypto.randomBytes(4).toString('hex');

    const newLead = new Lead({
      email,
      companyName,
      role,
      teamSize,
      auditResult,
      shareId
    });

    await newLead.save();

    // In production, you would trigger an email to the user here.

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.json({
      message: 'Lead captured successfully',
      shareId,
      shareableUrl: `${clientUrl}/audit/${shareId}`
    });

  } catch (err) {
    console.error('Lead capture error:', err);
    res.status(500).json({ error: 'Failed to capture lead.' });
  }
});

// ── GET: Fetch an anonymized public audit ───────────────────────────
app.get('/api/audit/:shareId', async (req, res) => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string_here') {
      return res.status(503).json({ error: 'Database not connected.' });
    }

    const Lead = require('./models/Lead');
    const lead = await Lead.findOne({ shareId: req.params.shareId });

    if (!lead) {
      return res.status(404).json({ error: 'Audit not found.' });
    }

    // Return ONLY the audit data, NEVER the personal info (email, role, company)
    res.json({
      shareId: lead.shareId,
      createdAt: lead.createdAt,
      auditResult: lead.auditResult
    });

  } catch (err) {
    console.error('Fetch public audit error:', err);
    res.status(500).json({ error: 'Failed to fetch public audit.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SpendPilot API running on port ${PORT}`);
});
