# Tandem (monorepo)

Tandem is a SaaS platform for restaurant chatbots.

Monorepo layout:
- apps/admin: admin dashboard
- apps/client: restaurant dashboard + widget generator
- packages/api: backend logic and API routes
- packages/ui: shared React components
- supabase: database migrations and schema

To get started locally:
1. Create environment files for each app (see docs).
2. Install dependencies per-app (e.g. `cd apps/admin && npm install`).
3. Run the app you want to develop.

I will guide you step-by-step from here.

---

Scaffold added (starter files)
- Basic Next.js pages: `apps/admin/pages/index.js`, `apps/client/pages/index.js`
- Starter API server: `packages/api/index.js` (simple health endpoint)
- Starter UI component: `packages/ui/index.js`
- `.env.example` files at project root and inside each app/package
- Per-app READMEs with exact install/run commands

Next steps (pick one):
- I can show step-by-step commands to create the GitHub repository, Vercel projects, and Supabase project, and the exact env vars to set.
- Or I can continue scaffolding more detailed app boilerplate (routing, TypeScript, CI) — tell me which.

