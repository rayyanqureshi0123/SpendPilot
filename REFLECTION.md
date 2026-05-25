# Reflection

## 1. The hardest bug I hit this week, and how I debugged it

The hardest bug was the shadcn/ui initialization failing silently in the Vite + TypeScript setup. When I ran `npx shadcn@latest init`, it wrote a `components.json` file but couldn't resolve the `@/` path alias because Vite splits its TypeScript config into `tsconfig.app.json` and `tsconfig.node.json` — neither of which the shadcn CLI reads correctly.

My first hypothesis was that the CLI was looking at the root `tsconfig.json`, which only has `"references"` and no `compilerOptions`. I tested this by adding `"baseUrl"` and `"paths"` directly to `tsconfig.json` — the CLI succeeded, but the Vite dev server still couldn't resolve `@/components/ui/button`. 

Second hypothesis: Vite's own resolver doesn't read `tsconfig.json` paths. I confirmed this by checking `vite.config.ts` — there was no `resolve.alias` configured. I added `resolve: { alias: { "@": path.resolve(__dirname, "./src") } }` to `vite.config.ts`, and then also added the `baseUrl` and `paths` to `tsconfig.app.json` so TypeScript's type checker agreed with Vite's resolver.

Then TypeScript 6.0 threw a new error: `baseUrl` is deprecated and will stop working in TypeScript 7.0. I added `"ignoreDeprecations": "6.0"` to silence it. Three different config files had to agree on the same path resolution — that was the actual bug.

## 2. A decision I reversed mid-week

I initially planned to use Next.js for the frontend because it supports server-side rendering, which would make Open Graph tags work natively for shareable audit URLs. Mid-build, I reversed this decision and went with a Vite React SPA.

The reason: Next.js adds enormous complexity (API routes, file-based routing, server components vs. client components) for a tool that is fundamentally a single-page form. The OG tags problem can be solved by having the Express backend serve a simple HTML template with dynamic meta tags for `/audit/:shareId` routes — you don't need an entire SSR framework for that.

The reversal saved me roughly a full day of fighting Next.js configuration and let me focus on the audit engine quality and business strategy documents, which are weighted higher in the rubric.

## 3. What I would build in week 2

1. **PDF export** — using `html2pdf.js` or Puppeteer to generate a branded, downloadable report. This is the #1 thing a CTO would want to forward to their CFO.
2. **Benchmark mode** — "Your AI spend per developer is $45/mo. Companies your size average $32/mo." This requires collecting anonymized aggregate data from audits, which we're already storing in MongoDB.
3. **Embeddable widget** — A `<script>` tag that any blogger or newsletter author could drop into their site to let readers audit their own spend. This turns every AI tools blog post into a distribution channel for Credex.
4. **A/B testing** on the results page — test whether showing savings as "per year" or "per month" drives higher email capture rates.

## 4. How I used AI tools

I used **Gemini** (via Antigravity/Cursor-like IDE integration) as my primary coding assistant throughout the project. Here's what I used it for and what I didn't:

**Trusted it with:** Boilerplate generation (Express routes, React component scaffolding), CSS styling, writing the shadcn component integration code, generating the GitHub Actions CI workflow, and drafting initial versions of the markdown strategy documents.

**Did NOT trust it with:** The audit engine math. I manually verified every pricing number against official vendor pages. I also didn't trust the AI to write the `USER_INTERVIEWS.md` — fabricated interviews are an instant reject per the assignment, so those conversations need to be real.

**One specific time the AI was wrong:** When generating the `Select` component in the React form, the AI used `onValueChange={setUseCase}` directly. But the shadcn/ui `Select` component's `onValueChange` callback passes `string | null`, while `setUseCase` expects `string`. TypeScript caught the type mismatch at build time. I had to manually wrap it as `onValueChange={(val) => setUseCase(val || '')}` to handle the null case. The AI generated code that looked correct but had a subtle type incompatibility.

## 5. Self-ratings

| Dimension | Score | Reason |
|-----------|-------|--------|
| Discipline | 7/10 | Shipped all 6 MVP features and 12 documents in 2 concentrated days. Would be higher if I'd spread commits across 5+ calendar days. |
| Code quality | 8/10 | TypeScript throughout, clear separation of concerns (engine/services/models), graceful error handling, no secrets in repo. |
| Design sense | 7/10 | Dark mode with teal accents, glassmorphism, micro-animations. Could improve mobile responsiveness and add more visual polish to the results page. |
| Problem-solving | 8/10 | The triple-tsconfig debugging was non-trivial. The AI fallback architecture was a deliberate design choice that proved its value when my Anthropic credits ran out. |
| Entrepreneurial thinking | 8/10 | GTM strategy includes specific channels with projected numbers. Economics has a complete funnel model with CAC breakdown. Understood the assignment is about building a lead-gen tool, not a coding exercise. |
