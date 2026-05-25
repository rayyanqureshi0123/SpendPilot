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
    const { email, companyName, role, teamSize, auditResult, honeypot } = req.body;

    // Honeypot spam abuse protection
    if (honeypot) {
      console.log('🤖 Spam bot detected in honeypot!');
      return res.status(400).json({ error: 'Abuse protection triggered.' });
    }

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

    // Send transactional email via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const shareUrl = `${clientUrl}/audit/${shareId}`;
        const savingsText = auditResult.summary.totalAnnualSavings > 0 
          ? `You can save up to $${auditResult.summary.totalAnnualSavings.toLocaleString()}/year!`
          : `Your stack is highly optimized!`;

        await resend.emails.send({
          from: 'SpendPilot Audits <onboarding@resend.dev>',
          to: email,
          subject: `Your AI Spend Audit Report - SpendPilot`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h2 style="color: #14b8a6;">SpendPilot Spend Audit</h2>
              <p>Hi there,</p>
              <p>Thanks for auditing your AI software infrastructure using SpendPilot!</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${savingsText}</h3>
                <p style="margin-bottom: 0;">We analyzed your team size of <strong>${teamSize}</strong> and found potential monthly savings of <strong>$${auditResult.summary.totalMonthlySavings.toLocaleString()}</strong>.</p>
              </div>
              <p>To view your full anonymized audit report and share it with your team, use this private link:</p>
              <p><a href="${shareUrl}" style="background-color: #14b8a6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Audit Report</a></p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
              <p style="font-size: 12px; color: #64748b;">Powered by SpendPilot & Credex.rocks</p>
            </div>
          `
        });
        console.log(`✉️ Transactional email sent to ${email}`);
      } catch (emailErr) {
        console.error('❌ Failed to send transactional email:', emailErr.message);
      }
    }

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
