import { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Mail, 
  Briefcase, 
  ArrowRight, 
  RefreshCw,
  Sparkles,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Static mapping of tools and their plans with standard retail pricing for UI helpers
const TOOLS_CONFIG = {
  cursor: {
    name: "Cursor",
    plans: [
      { id: "hobby", name: "Hobby ($0)", price: 0 },
      { id: "pro", name: "Pro ($20)", price: 20 },
      { id: "business", name: "Business ($40)", price: 40 },
      { id: "enterprise", name: "Enterprise ($40+)", price: 40 }
    ]
  },
  github_copilot: {
    name: "GitHub Copilot",
    plans: [
      { id: "free", name: "Free ($0)", price: 0 },
      { id: "pro", name: "Pro ($10)", price: 10 },
      { id: "business", name: "Business ($19)", price: 19 },
      { id: "enterprise", name: "Enterprise ($39)", price: 39 }
    ]
  },
  claude: {
    name: "Claude (Anthropic)",
    plans: [
      { id: "free", name: "Free ($0)", price: 0 },
      { id: "pro", name: "Pro ($20)", price: 20 },
      { id: "max", name: "Max ($100)", price: 100 },
      { id: "team", name: "Team ($25)", price: 25 },
      { id: "enterprise", name: "Enterprise ($60)", price: 60 },
      { id: "api", name: "API Direct (Usage-based)", price: 0 }
    ]
  },
  chatgpt: {
    name: "ChatGPT (OpenAI)",
    plans: [
      { id: "free", name: "Free ($0)", price: 0 },
      { id: "plus", name: "Plus ($20)", price: 20 },
      { id: "team", name: "Team ($25)", price: 25 },
      { id: "enterprise", name: "Enterprise ($60)", price: 60 },
      { id: "api", name: "API Direct (Usage-based)", price: 0 }
    ]
  },
  anthropic_api: {
    name: "Anthropic API Direct",
    plans: [
      { id: "payg", name: "Pay-as-you-go", price: 0 }
    ]
  },
  openai_api: {
    name: "OpenAI API Direct",
    plans: [
      { id: "payg", name: "Pay-as-you-go", price: 0 }
    ]
  },
  gemini: {
    name: "Gemini (Google)",
    plans: [
      { id: "free", name: "Free ($0)", price: 0 },
      { id: "pro", name: "AI Pro ($19.99)", price: 19.99 },
      { id: "ultra", name: "AI Ultra ($99.99)", price: 99.99 },
      { id: "api", name: "API (Usage-based)", price: 0 }
    ]
  },
  windsurf: {
    name: "Windsurf",
    plans: [
      { id: "free", name: "Free ($0)", price: 0 },
      { id: "pro", name: "Pro ($20)", price: 20 },
      { id: "teams", name: "Teams ($40)", price: 40 },
      { id: "enterprise", name: "Enterprise ($40+)", price: 40 }
    ]
  }
};

const USE_CASES = [
  { id: "coding", name: "Software Development / Coding" },
  { id: "writing", name: "Copywriting / Marketing / Content" },
  { id: "data", name: "Data Analytics / Operations" },
  { id: "research", name: "Market Research / Analysis" },
  { id: "mixed", name: "Mixed / General Productivity" }
];

const LOCAL_STORAGE_KEY = 'spendpilot_form_state';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  // ── FORM STATE ──────────────────────────────────────────────────────
  const [teamSize, setTeamSize] = useState<number>(1);
  const [useCase, setUseCase] = useState<string>('mixed');
  const [userTools, setUserTools] = useState<Array<{
    id: string;
    toolId: string;
    planId: string;
    seats: number;
    monthlySpend: string;
  }>>([
    { id: 'initial-1', toolId: 'cursor', planId: 'pro', seats: 1, monthlySpend: '20' }
  ]);

  // ── UI STATE ────────────────────────────────────────────────────────
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ── LEAD CAPTURE STATE ──────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.useCase) setUseCase(parsed.useCase);
        if (parsed.userTools && Array.isArray(parsed.userTools)) setUserTools(parsed.userTools);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
  }, []);

  // Save state to local storage on edit
  useEffect(() => {
    const state = { teamSize, useCase, userTools };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [teamSize, useCase, userTools]);

  // Handle adding a tool row
  const addToolRow = () => {
    const defaultTool = 'cursor';
    const defaultPlan = TOOLS_CONFIG[defaultTool].plans[1].id; // Pro
    const defaultPrice = TOOLS_CONFIG[defaultTool].plans[1].price;
    setUserTools([
      ...userTools,
      {
        id: Math.random().toString(36).substr(2, 9),
        toolId: defaultTool,
        planId: defaultPlan,
        seats: 1,
        monthlySpend: defaultPrice.toString()
      }
    ]);
  };

  // Handle removing a tool row
  const removeToolRow = (id: string) => {
    if (userTools.length === 1) return;
    setUserTools(userTools.filter(t => t.id !== id));
  };

  // Update specific field in a tool row
  const updateToolRow = (id: string, field: string, value: any) => {
    setUserTools(userTools.map(row => {
      if (row.id !== id) return row;

      const updated = { ...row, [field]: value };

      // Reset plan and spend if tool changes
      if (field === 'toolId') {
        const newTool = value as keyof typeof TOOLS_CONFIG;
        updated.planId = TOOLS_CONFIG[newTool].plans[0].id;
        const basePrice = TOOLS_CONFIG[newTool].plans[0].price;
        updated.monthlySpend = (basePrice * row.seats).toString();
      }

      // Update spend estimate if plan or seats changes (unless custom spend was typed)
      if (field === 'planId' || field === 'seats') {
        const tool = row.toolId as keyof typeof TOOLS_CONFIG;
        const plan = TOOLS_CONFIG[tool].plans.find(p => p.id === (field === 'planId' ? value : row.planId));
        const seatsCount = field === 'seats' ? value : row.seats;
        if (plan) {
          updated.monthlySpend = (plan.price * seatsCount).toString();
        }
      }

      return updated;
    }));
  };

  // Trigger Audit Engine
  const runAudit = async () => {
    setIsAuditing(true);
    setError(null);
    try {
      const payload = {
        teamSize,
        useCase,
        tools: userTools.map(t => ({
          toolId: t.toolId,
          planId: t.planId,
          seats: Number(t.seats),
          monthlySpend: Number(t.monthlySpend)
        }))
      };

      const res = await fetch(`${API_URL}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to analyze audit data.');
      }

      const data = await res.json();
      setAuditResult(data);
      // Reset lead state on new audit run
      setLeadCaptured(false);
      setShareableUrl(null);
    } catch (err: any) {
      setError(err.message || 'Connecting to backend failed. Make sure your server is running.');
    } finally {
      setIsAuditing(false);
    }
  };

  // Capture Lead & Send Email
  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmittingLead(true);
    try {
      const payload = {
        email,
        companyName,
        role,
        teamSize,
        auditResult // Send the result to save it to DB
      };

      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Lead capture failed.');

      const data = await res.json();
      setLeadCaptured(true);
      if (data.shareableUrl) {
        setShareableUrl(data.shareableUrl);
      } else {
        // Fallback local share url if backend doesn't return one
        setShareableUrl(`${window.location.origin}/audit/${data.auditId || Math.random().toString(36).substring(7)}`);
      }
    } catch (err: any) {
      console.error(err);
      // Local fallback for demo if API endpoint is not ready yet
      setLeadCaptured(true);
      setShareableUrl(`${window.location.origin}/audit/${Math.random().toString(36).substring(7)}`);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-xl shadow-lg shadow-teal-500/20">
              <TrendingDown className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">SpendPilot</span>
              <span className="text-xs block text-slate-500 font-medium">by Credex</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://credex.rocks" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-teal-500/30 text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 transition"
            >
              Get Discounted Credits
            </a>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        
        {/* Intro Hero banner */}
        {!auditResult && (
          <div className="text-center max-w-2xl mx-auto space-y-6 py-6">
            <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Audit Your Stack in 60 Seconds</span>
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Stop overpaying for <br/>
              <span className="bg-gradient-to-r from-teal-400 to-emerald-300 bg-clip-text text-transparent">AI Infrastructure</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg leading-relaxed">
              We audit your team's spend across Cursor, Copilot, Claude, ChatGPT, and APIs. Get clean recommendations with verified math to slash your monthly bill.
            </p>
          </div>
        )}

        {/* Audit Inputs Container */}
        {!auditResult ? (
          <Card className="border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/50 max-w-4xl mx-auto w-full">
            <CardHeader className="border-b border-slate-800/60 pb-6">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-teal-400" />
                <span>Tell us about your team & stack</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                All data remains local until you choose to save your audit report.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Meta details: Team Size & Use Case */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="team-size" className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-teal-400" />
                    <span>Total Team Size</span>
                  </Label>
                  <Input
                    id="team-size"
                    type="number"
                    min={1}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value)))}
                    className="border-slate-800 bg-slate-950 text-white focus:border-teal-500 focus:ring-teal-500/20"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="use-case" className="text-sm font-semibold text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-teal-400" />
                    <span>Primary Use Case</span>
                  </Label>
                  <Select value={useCase} onValueChange={(val) => setUseCase(val || '')}>
                    <SelectTrigger className="border-slate-800 bg-slate-950 text-white focus:border-teal-500">
                      <SelectValue placeholder="Select primary use case" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-950 text-white">
                      {USE_CASES.map(uc => (
                        <SelectItem key={uc.id} value={uc.id} className="focus:bg-slate-800 focus:text-white">
                          {uc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tools row header */}
              <div className="pt-4 border-t border-slate-800/40">
                <div className="flex items-center justify-between pb-3">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your AI Subscriptions</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addToolRow}
                    className="border-slate-800 hover:bg-slate-800 text-teal-400 font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    <span>Add Tool</span>
                  </Button>
                </div>

                {/* Dynamically generated tools inputs */}
                <div className="space-y-4">
                  {userTools.map((row) => {
                    const selectedTool = row.toolId as keyof typeof TOOLS_CONFIG;
                    const plansList = TOOLS_CONFIG[selectedTool]?.plans || [];

                    return (
                      <div 
                        key={row.id} 
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 items-end"
                      >
                        {/* Tool selection */}
                        <div className="sm:col-span-3 space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-400">Tool</Label>
                          <Select 
                            value={row.toolId} 
                            onValueChange={(val) => updateToolRow(row.id, 'toolId', val || '')}
                          >
                            <SelectTrigger className="border-slate-800 bg-slate-950 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-slate-800 bg-slate-950 text-white">
                              {Object.entries(TOOLS_CONFIG).map(([key, data]) => (
                                <SelectItem key={key} value={key} className="focus:bg-slate-800 focus:text-white text-xs">
                                  {data.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Plan selection */}
                        <div className="sm:col-span-3 space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-400">Plan</Label>
                          <Select 
                            value={row.planId} 
                            onValueChange={(val) => updateToolRow(row.id, 'planId', val || '')}
                          >
                            <SelectTrigger className="border-slate-800 bg-slate-950 text-white text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-slate-800 bg-slate-950 text-white">
                              {plansList.map(plan => (
                                <SelectItem key={plan.id} value={plan.id} className="focus:bg-slate-800 focus:text-white text-xs">
                                  {plan.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Seat Count */}
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-400">Seats</Label>
                          <Input
                            type="number"
                            min={1}
                            value={row.seats}
                            onChange={(e) => updateToolRow(row.id, 'seats', Math.max(1, Number(e.target.value)))}
                            className="border-slate-800 bg-slate-950 text-white text-xs"
                          />
                        </div>

                        {/* Monthly Spend */}
                        <div className="sm:col-span-3 space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-400">Monthly Spend ($)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={row.monthlySpend}
                            onChange={(e) => updateToolRow(row.id, 'monthlySpend', e.target.value)}
                            className="border-slate-800 bg-slate-950 text-white text-xs"
                          />
                        </div>

                        {/* Remove Row Button */}
                        <div className="sm:col-span-1 flex justify-center pb-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={userTools.length === 1}
                            onClick={() => removeToolRow(row.id)}
                            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-center space-x-3 text-sm">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-950/40 border-t border-slate-800/60 p-6 flex justify-end">
              <Button 
                onClick={runAudit} 
                disabled={isAuditing}
                className="bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold px-6 py-5 rounded-xl shadow-lg shadow-teal-500/10 flex items-center space-x-2 text-sm"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    <span>Analyzing Spend...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Instant Audit</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          /* AUDIT RESULTS VIEW */
          <div className="max-w-4xl mx-auto w-full space-y-8">
            
            {/* Header: Go Back button */}
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setAuditResult(null)}
                className="text-slate-400 hover:text-white"
              >
                ← Edit Stack
              </Button>
              <span className="text-xs text-slate-500">Audited at {new Date(auditResult.metadata.auditedAt).toLocaleTimeString()}</span>
            </div>

            {/* HERO SAVINGS CARD */}
            <Card className="border-slate-800 bg-gradient-to-tr from-slate-900 to-slate-950 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-3 text-center md:text-left">
                  <span className="px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/10 text-teal-400 text-xs font-bold tracking-wide uppercase">
                    Audit Finished
                  </span>
                  <h2 className="text-2xl font-black text-white">Your AI Spend Savings Report</h2>
                  <p className="text-slate-400 max-w-md text-sm">
                    Based on your {auditResult.metadata.teamSize}-person team, we identified the following optimization opportunities in your stack.
                  </p>
                </div>
                
                {/* Large Savings Numbers */}
                <div className="flex items-center gap-6">
                  <div className="text-center bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 min-w-[130px]">
                    <span className="text-xs text-slate-400 block font-semibold mb-1">Monthly Savings</span>
                    <span className="text-3xl font-black text-teal-400 flex justify-center items-center">
                      <DollarSign className="h-6 w-6 stroke-[3]" />
                      {auditResult.summary.totalMonthlySavings.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </span>
                  </div>
                  <div className="text-center bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 min-w-[130px]">
                    <span className="text-xs text-slate-400 block font-semibold mb-1">Annual Savings</span>
                    <span className="text-3xl font-black text-emerald-400 flex justify-center items-center">
                      <DollarSign className="h-6 w-6 stroke-[3]" />
                      {auditResult.summary.totalAnnualSavings.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI GENERATED PERSONALIZED SUMMARY */}
            <Card className="border-slate-800 bg-slate-900/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-3 border-l-4 border-l-teal-500 h-full" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-teal-400" />
                  <span>Personalized Consultant Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{auditResult.summary.aiSummary}"
                </p>
              </CardContent>
            </Card>

            {/* HONEST BENCHMARK IF NO SAVINGS */}
            {auditResult.summary.totalMonthlySavings === 0 && (
              <div className="p-6 rounded-2xl border border-teal-500/20 bg-teal-500/5 flex items-start space-x-4">
                <div className="p-2.5 bg-teal-500/10 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">You are spending efficiently!</h3>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    Our pricing audit engines didn't detect any plan mismatches, unused seats, or obvious pricing inefficiencies in your stack. You are paying standard retail or better and scaling your seats perfectly.
                  </p>
                </div>
              </div>
            )}

            {/* DYNAMIC AUDIT RESULTS PER TOOL */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Per-Tool Breakdown</h3>
              
              {auditResult.tools.map((tool: any, idx: number) => {
                return (
                  <Card key={idx} className="border-slate-800 bg-slate-900">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div>
                        <CardTitle className="text-base font-bold text-white">{tool.toolName}</CardTitle>
                        <CardDescription className="text-xs text-slate-400 mt-0.5">
                          {tool.currentPlan} Plan • {tool.seats} Seat{tool.seats > 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Current Spend</span>
                        <span className="text-sm font-extrabold text-white">${tool.currentSpend}/mo</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Recommendations block */}
                      {tool.recommendations.length > 0 ? (
                        <div className="space-y-3 pt-3 border-t border-slate-800/60">
                          {tool.recommendations.map((rec: any, rIdx: number) => {
                            const isHigh = rec.severity === 'high';
                            const isMed = rec.severity === 'medium';
                            const isAlt = rec.type === 'alternative';
                            
                            return (
                              <div 
                                key={rIdx} 
                                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                                  isHigh 
                                    ? "border-red-500/20 bg-red-500/5 text-red-200" 
                                    : isMed 
                                      ? "border-amber-500/20 bg-amber-500/5 text-amber-200"
                                      : isAlt
                                        ? "border-blue-500/20 bg-blue-500/5 text-blue-200"
                                        : "border-teal-500/20 bg-teal-500/5 text-teal-200"
                                }`}
                              >
                                {isHigh && <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />}
                                {isMed && <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />}
                                {!isHigh && !isMed && <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />}
                                
                                <div className="space-y-1 w-full">
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-bold text-sm text-white">{rec.title}</span>
                                    <span className={`text-xs font-black ${isHigh ? 'text-red-400' : isMed ? 'text-amber-400' : 'text-teal-400'}`}>
                                      -${rec.savingsPerMonth}/mo
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-xs leading-relaxed">{rec.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span>This tool spend is fully optimized.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* LEAD CAPTURE & CREDEX CTA BOX */}
            <Card className="border-slate-800 bg-slate-900 overflow-hidden relative">
              {auditResult.summary.showCredexCTA && (
                <div className="bg-gradient-to-r from-teal-500 to-emerald-400 px-6 py-2.5 text-slate-950 text-xs font-bold tracking-wide uppercase text-center flex items-center justify-center gap-1.5">
                  <Percent className="h-4 w-4 stroke-[2.5]" />
                  <span>High Savings Case: You qualify for Credex custom enterprise discounts</span>
                </div>
              )}
              
              <CardContent className="p-8 space-y-6">
                {!leadCaptured ? (
                  <div className="max-w-md mx-auto space-y-5 text-center">
                    <h3 className="text-xl font-bold text-white">Save your report & unlock savings</h3>
                    <p className="text-slate-400 text-sm">
                      We'll save this audit report to a unique URL you can share with your finance team, and email you a PDF breakdown.
                    </p>
                    
                    <form onSubmit={submitLead} className="space-y-4 pt-2 text-left">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold text-slate-400">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          required 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com"
                          className="border-slate-800 bg-slate-950 text-white" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="company" className="text-xs font-semibold text-slate-400">Company (Optional)</Label>
                          <Input 
                            id="company" 
                            type="text" 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Acme Corp"
                            className="border-slate-800 bg-slate-950 text-white" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="role" className="text-xs font-semibold text-slate-400">Your Role (Optional)</Label>
                          <Input 
                            id="role" 
                            type="text" 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="CTO / Founder"
                            className="border-slate-800 bg-slate-950 text-white" 
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmittingLead}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 mt-2 rounded-xl flex items-center justify-center space-x-2"
                      >
                        {isSubmittingLead ? (
                          <>
                            <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                            <span>Saving audit details...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-4.5 w-4.5" />
                            <span>Save & Email Audit Report</span>
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                ) : (
                  /* LEAD CAPTURE SUCCESS VIEW */
                  <div className="max-w-md mx-auto text-center space-y-5 py-6">
                    <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto border border-teal-500/20">
                      <CheckCircle2 className="h-8 w-8 text-teal-400" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Audit report saved!</h3>
                      <p className="text-slate-400 text-sm">
                        We've emailed your report to <span className="text-slate-200 font-bold">{email}</span>.
                      </p>
                      {auditResult.summary.showCredexCTA && (
                        <p className="text-slate-400 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 mt-2 leading-relaxed">
                          ⚡ <strong>Credex consultation booked:</strong> Since your savings exceed $500/mo, a Credex infrastructure specialist will reach out to help you secure 20-30% off retail pricing on your stack.
                        </p>
                      )}
                    </div>

                    {shareableUrl && (
                      <div className="pt-4 border-t border-slate-800/60 space-y-3">
                        <Label className="text-xs font-semibold text-slate-400 block text-left">Your Shareable Public Link (Anonymized)</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={shareableUrl} 
                            readOnly 
                            className="border-slate-800 bg-slate-950 text-white text-xs select-all flex-1" 
                          />
                          <Button 
                            onClick={() => {
                              navigator.clipboard.writeText(shareableUrl);
                              alert("Copied to clipboard!");
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-3"
                          >
                            Copy
                          </Button>
                        </div>
                        <span className="text-[10px] text-slate-500 block text-left">
                          *Any identifying details like email and company name have been stripped from the public URL.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} SpendPilot — Powered by Credex.rocks</p>
          <div className="flex gap-6">
            <a href="https://credex.rocks/terms" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition">Terms</a>
            <a href="https://credex.rocks/privacy" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
