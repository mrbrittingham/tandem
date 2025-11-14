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

**Automated bootstrap (one-command local setup)**
- A PowerShell helper script `scripts/bootstrap.ps1` is included to help create local env files and print exact next steps.

How to run the bootstrap script:
1. Open PowerShell and go to the repo root:
	```powershell
	cd C:\Users\mcsf6\tandem
	```
2. Allow the script to run for this session, then execute it:
	```powershell
	Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
	.\scripts\bootstrap.ps1
	```
3. The script will ask for Supabase and OpenAI keys (you can paste real keys or leave blank to use placeholders). It will then write local env files at:
	- `packages/api/.env` (server-only keys)
	- `apps/admin/.env.local` (public frontend keys)
	- `apps/client/.env.local` (public frontend keys)

Notes:
- The script does not upload secrets anywhere. It only writes local files for development.
- To deploy to Vercel or create a Supabase project, follow the step-by-step instructions earlier in this README. If you want more automation to set env vars on Vercel via CLI, I can add that option.


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

