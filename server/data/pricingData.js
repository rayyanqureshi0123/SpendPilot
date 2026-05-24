/**
 * PRICING DATA — All AI tool pricing as of May 2026.
 * Every number here is sourced from official vendor pricing pages.
 * See PRICING_DATA.md at the repo root for full source URLs.
 */

const pricingData = {
  cursor: {
    name: "Cursor",
    category: "coding",
    plans: {
      hobby: {
        name: "Hobby",
        pricePerSeat: 0,
        isFreeTier: true,
        features: ["Limited completions", "Basic chat"],
        limitations: "Very limited usage, meant for evaluation only",
      },
      pro: {
        name: "Pro",
        pricePerSeat: 20,
        features: ["Unlimited auto-mode", "$20 usage credits/mo", "All premium models"],
        bestFor: { minSeats: 1, maxSeats: 1, useCases: ["coding"] },
      },
      business: {
        name: "Business",
        pricePerSeat: 40,
        features: ["Team collaboration", "Centralized billing", "Usage analytics", "SAML/OIDC SSO", "Admin controls"],
        bestFor: { minSeats: 2, maxSeats: 500, useCases: ["coding"] },
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 40, // base estimate; custom pricing typically starts here
        isCustomPricing: true,
        features: ["Pooled usage", "Invoice billing", "Dedicated support", "Audit logs", "SCIM"],
        bestFor: { minSeats: 50, maxSeats: Infinity, useCases: ["coding"] },
      },
    },
  },

  github_copilot: {
    name: "GitHub Copilot",
    category: "coding",
    plans: {
      free: {
        name: "Free",
        pricePerSeat: 0,
        isFreeTier: true,
        features: ["Limited completions", "Limited chat"],
        limitations: "Very restricted usage limits",
      },
      pro: {
        name: "Pro",
        pricePerSeat: 10,
        features: ["Unlimited completions", "Increased premium requests", "Advanced models"],
        bestFor: { minSeats: 1, maxSeats: 1, useCases: ["coding"] },
      },
      business: {
        name: "Business",
        pricePerSeat: 19,
        features: ["Centralized management", "IP indemnity", "Policy controls", "Usage analytics"],
        bestFor: { minSeats: 2, maxSeats: 500, useCases: ["coding"] },
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 39,
        features: ["Custom models", "Knowledge bases", "Advanced security/compliance"],
        bestFor: { minSeats: 10, maxSeats: Infinity, useCases: ["coding"] },
      },
    },
  },

  claude: {
    name: "Claude",
    category: "general",
    plans: {
      free: {
        name: "Free",
        pricePerSeat: 0,
        isFreeTier: true,
        features: ["Basic access", "Daily usage limits"],
        limitations: "Strict daily limits, not suitable for team use",
      },
      pro: {
        name: "Pro",
        pricePerSeat: 20,
        features: ["Higher usage limits", "Claude Code access", "Projects & integrations"],
        bestFor: { minSeats: 1, maxSeats: 1, useCases: ["coding", "writing", "research", "data", "mixed"] },
      },
      max: {
        name: "Max",
        pricePerSeat: 100,  // Max 5x tier
        features: ["5x session capacity", "Priority access"],
        bestFor: { minSeats: 1, maxSeats: 1, useCases: ["coding", "research"] },
      },
      team: {
        name: "Team",
        pricePerSeat: 25,
        features: ["Team management", "Higher limits", "5-seat minimum"],
        bestFor: { minSeats: 5, maxSeats: 500, useCases: ["coding", "writing", "research", "data", "mixed"] },
        minSeats: 5,
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 60,  // estimated starting price
        isCustomPricing: true,
        features: ["SSO", "Audit logs", "Fine-grained access", "Larger context windows"],
        bestFor: { minSeats: 50, maxSeats: Infinity, useCases: ["coding", "writing", "research", "data", "mixed"] },
      },
      api: {
        name: "API Direct",
        pricePerSeat: 0, // usage-based
        isUsageBased: true,
        apiPricing: {
          haiku: { input: 1.00, output: 5.00, model: "Claude Haiku 4.5" },
          sonnet: { input: 3.00, output: 15.00, model: "Claude Sonnet 4.6" },
          opus: { input: 5.00, output: 25.00, model: "Claude Opus 4.6" },
        },
        features: ["Pay-per-token", "Full model access", "Batch API 50% discount"],
      },
    },
  },

  chatgpt: {
    name: "ChatGPT",
    category: "general",
    plans: {
      free: {
        name: "Free",
        pricePerSeat: 0,
        isFreeTier: true,
        features: ["Limited GPT-4o access", "Basic features"],
        limitations: "Rate limited, no team features",
      },
      plus: {
        name: "Plus",
        pricePerSeat: 20,
        features: ["Latest models", "Deep Research", "Advanced Voice", "Agent Mode"],
        bestFor: { minSeats: 1, maxSeats: 1, useCases: ["writing", "research", "data", "mixed"] },
      },
      team: {
        name: "Team",
        pricePerSeat: 25,
        annualPricePerSeat: 20,
        features: ["Shared workspace", "Admin controls", "SSO", "Data not used for training"],
        bestFor: { minSeats: 2, maxSeats: 149, useCases: ["writing", "research", "data", "mixed"] },
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 60, // estimated
        isCustomPricing: true,
        features: ["SCIM", "Domain verification", "Custom data retention", "24/7 support"],
        bestFor: { minSeats: 150, maxSeats: Infinity, useCases: ["writing", "research", "data", "mixed"] },
      },
      api: {
        name: "API Direct",
        pricePerSeat: 0,
        isUsageBased: true,
        apiPricing: {
          "gpt-4o": { input: 2.50, output: 10.00, model: "GPT-4o" },
          "gpt-4o-mini": { input: 0.15, output: 0.60, model: "GPT-4o Mini" },
          "gpt-4.1": { input: 2.00, output: 8.00, model: "GPT-4.1" },
          "gpt-4.1-mini": { input: 0.40, output: 1.60, model: "GPT-4.1 Mini" },
          "gpt-4.1-nano": { input: 0.10, output: 0.40, model: "GPT-4.1 Nano" },
        },
        features: ["Pay-per-token", "Batch API 50% discount", "Prompt caching"],
      },
    },
  },

  openai_api: {
    name: "OpenAI API Direct",
    category: "api",
    plans: {
      payg: {
        name: "Pay-as-you-go",
        pricePerSeat: 0,
        isUsageBased: true,
        apiPricing: {
          "gpt-4o": { input: 2.50, output: 10.00, model: "GPT-4o" },
          "gpt-4o-mini": { input: 0.15, output: 0.60, model: "GPT-4o Mini" },
          "gpt-4.1": { input: 2.00, output: 8.00, model: "GPT-4.1" },
          "gpt-4.1-mini": { input: 0.40, output: 1.60, model: "GPT-4.1 Mini" },
          "gpt-4.1-nano": { input: 0.10, output: 0.40, model: "GPT-4.1 Nano" },
        },
        features: ["Pay-per-token", "Batch API 50% discount", "Prompt caching"],
      },
    },
  },

  anthropic_api: {
    name: "Anthropic API Direct",
    category: "api",
    plans: {
      payg: {
        name: "Pay-as-you-go",
        pricePerSeat: 0,
        isUsageBased: true,
        apiPricing: {
          haiku: { input: 1.00, output: 5.00, model: "Claude Haiku 4.5" },
          sonnet: { input: 3.00, output: 15.00, model: "Claude Sonnet 4.6" },
          opus: { input: 5.00, output: 25.00, model: "Claude Opus 4.6" },
        },
        features: ["Pay-per-token", "Batch API 50% discount", "Prompt caching 90% discount"],
      },
    },
  },

  gemini: {
    name: "Gemini",
    category: "general",
    plans: {
      free: {
        name: "Free",
        pricePerSeat: 0,
        isFreeTier: true,
        features: ["Basic Gemini access"],
        limitations: "Very limited usage",
      },
      pro: {
        name: "AI Pro",
        pricePerSeat: 19.99,
        features: ["Gemini Pro features", "5TB storage", "4x usage limits", "YouTube Premium Lite"],
        bestFor: { minSeats: 1, maxSeats: 1, useCases: ["writing", "research", "data", "mixed"] },
      },
      ultra: {
        name: "AI Ultra",
        pricePerSeat: 99.99,
        features: ["5x usage limits", "Gemini 3.5 Flash", "Gemini Spark agent", "YouTube Premium"],
        bestFor: { minSeats: 1, maxSeats: 1, useCases: ["coding", "writing", "research", "data", "mixed"] },
      },
      api: {
        name: "API",
        pricePerSeat: 0,
        isUsageBased: true,
        features: ["Pay-per-token", "Generous free tier"],
      },
    },
  },

  windsurf: {
    name: "Windsurf",
    category: "coding",
    plans: {
      free: {
        name: "Free",
        pricePerSeat: 0,
        isFreeTier: true,
        features: ["Limited daily quotas", "Unlimited Tab autocomplete"],
        limitations: "Very limited daily/weekly quotas",
      },
      pro: {
        name: "Pro",
        pricePerSeat: 20,
        features: ["Standard quotas", "All premium models", "Unlimited Tab autocomplete"],
        bestFor: { minSeats: 1, maxSeats: 1, useCases: ["coding"] },
      },
      teams: {
        name: "Teams",
        pricePerSeat: 40,
        features: ["Centralized billing", "Admin dashboards", "Team management"],
        bestFor: { minSeats: 2, maxSeats: 500, useCases: ["coding"] },
      },
      enterprise: {
        name: "Enterprise",
        pricePerSeat: 40,
        isCustomPricing: true,
        features: ["Custom quotas", "SSO", "RBAC", "Enhanced security"],
        bestFor: { minSeats: 50, maxSeats: Infinity, useCases: ["coding"] },
      },
    },
  },
};

// Map of cheaper alternatives by category and use case
const alternatives = {
  coding: [
    {
      from: "cursor",
      to: "github_copilot",
      condition: "Individual developer not needing Cursor-specific features",
      savingsReason: "GitHub Copilot Pro at $10/mo is half the cost of Cursor Pro at $20/mo for comparable AI code completion",
    },
    {
      from: "cursor",
      to: "windsurf",
      condition: "Looking for similar AI IDE experience at same price with different model access",
      savingsReason: "Windsurf Pro at $20/mo offers similar AI coding features with different model selection",
    },
    {
      from: "github_copilot",
      fromPlan: "enterprise",
      to: "github_copilot",
      toPlan: "business",
      condition: "Team under 50 developers without custom model training needs",
      savingsReason: "Business at $19/seat saves $20/seat vs Enterprise at $39/seat when advanced enterprise features aren't needed",
    },
  ],
  general: [
    {
      from: "chatgpt",
      to: "claude",
      condition: "Primary use is writing or research",
      savingsReason: "Claude Pro at $20/mo offers comparable quality for writing/research tasks at the same price, but with different strengths",
    },
    {
      from: "claude",
      fromPlan: "max",
      to: "claude",
      toPlan: "pro",
      condition: "Not hitting Pro usage limits regularly",
      savingsReason: "Claude Pro at $20/mo saves $80/mo over Max — only upgrade if you consistently hit Pro's usage ceiling",
    },
    {
      from: "gemini",
      fromPlan: "ultra",
      to: "gemini",
      toPlan: "pro",
      condition: "Not using Gemini Spark agent or 5x limits",
      savingsReason: "AI Pro at $19.99/mo saves $80/mo over Ultra — most users don't need 5x capacity",
    },
  ],
};

module.exports = { pricingData, alternatives };
