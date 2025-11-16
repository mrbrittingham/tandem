# Tandem — Setup & Runbook

This document is the canonical runbook for working on the Tandem monorepo across machines. It covers how to open the project in the devcontainer, run each app, env placeholders, common troubleshooting, and deployment notes.

Keep this file in the repo so everyone has the same reference.

> NOTE: This repository currently uses Option A: the client (`apps/client`) exposes internal Next.js API routes under `apps/client/pages/api/*` for chat/demo endpoints. The standalone `packages/api` server exists for compatibility but is optional and not required for the default deployment. Do NOT rely on `restaurant-chatbot-server` or external proxies.

---

## Quick repo layout

- `apps/`
  - `admin/` — Next.js app for admin UI. (`apps/admin/package.json`)
  - `client/` — Next.js public-facing site. (`apps/client/package.json`)
- `packages/`
  - `api/` — Minimal Node/Express API server (`packages/api/index.js`).
  - `ui/` — Shared UI components used by apps.
- Root files:
  - `package.json` — monorepo-level convenience scripts (root `dev` uses `concurrently`).
  - `.devcontainer/` — devcontainer configuration.
  - `tandem-dev-start.sh` — startup script used by the devcontainer to clean ports then run `npm run dev`.
  - `.eslintrc.json`, `.prettierrc` — lint/format configuration.

---

## Prerequisites (host machine)

- Docker Desktop (or Docker Engine) and VS Code with the "Dev Containers" extension (Remote - Containers).
- Git (configured with credentials for GitHub push/pull).
- Optional: Node.js locally if you want to run apps outside the container.

---

## Open in devcontainer (recommended)

1. Install and start Docker on your machine.
2. In VS Code, open this repository folder.
3. Open the Command Palette (Ctrl/Cmd+Shift+P) and choose: `Dev Containers: Rebuild and Reopen in Container`.
   - The devcontainer image in `.devcontainer/devcontainer.json` is `mcr.microsoft.com/devcontainers/javascript-node:20`.
   - The devcontainer runs `postCreateCommand` (`npm install`) and uses `postAttachCommand` to run `./tandem-dev-start.sh` which cleans ports and starts services.

Notes:
- If `postAttachCommand` does not run, rebuild the container and check the Dev Containers output log (View → Output → Dev Containers).
- To rebuild without cache: `Dev Containers: Rebuild Container` from the Command Palette.

---

## Run services (inside the devcontainer)

- Start all services (convenience):
  - From the repo root: `npm run dev`
    - This runs three processes concurrently: admin, client, and api.

- Start a single app (recommended while developing one app):
  - Admin:
    - `cd apps/admin`
    - `npm install` (first time)
    - `npm run dev` (binds to port 3002 in this repo)
  - Client:
    - `cd apps/client`
    - `npm install` (first time)
    - `npm run dev` (default port 3000)
  - API:
    - `cd packages/api`
    - `npm install` (first time)
    - `npm run dev` (binds to port 4000)

Ports used by default in the devcontainer:
- Client: 3000
- Admin: 3002 (explicitly configured to avoid collisions)
- API: 4000

If a Next app falls back to another port, check its console output to find the assigned port.

---

## Environment variables (placeholders)

Create per-app `.env` or use `.env.local` files. Do NOT commit secrets. Example placeholders:

packages/api/.env.example
```
SUPABASE_URL=https://your-supabase-url
SUPABASE_ANON_KEY=pk.your_anon_key
SUPABASE_SERVICE_ROLE_KEY=sk.your_service_role
OPENAI_API_KEY=sk.your_openai_key
PORT=4000
```

apps/client/.env.example
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=pk.your_anon_key
```

apps/admin/.env.example
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Tips:
- Use `.env` files locally and add them to `.gitignore`.
- The devcontainer runs `npm install` automatically during `postCreateCommand`.

---

## Linting & formatting

- Root scripts in `package.json`:
  - `npm run lint` — run ESLint across the repo
  - `npm run lint:fix` — run ESLint autofix
  - `npm run format` — run Prettier

- Install dev dependencies (if not present) in root to run lint/format: `npm install` from repo root (devcontainer runs this automatically).

---

## Git workflow (sync between machines)

1. Create a feature branch locally: `git checkout -b feat/your-change`
2. Make small commits with clear messages: `git add -A && git commit -m "Short descriptive message"`
3. Push branch: `git push -u origin feat/your-change`
4. Open a Pull Request on GitHub, request review, merge when approved.
5. On other machines: `git fetch && git pull` or `git checkout main && git pull` then `git checkout feat/your-change`.

Tips:
- Keep `main` stable. Use feature branches and PRs for review.
- The repo already commits some tooling changes (devcontainer, lint config) — pull before starting work.

---

## Troubleshooting the devcontainer & runtime issues

- If the devcontainer isn't starting or `postAttachCommand` doesn't run:
  - View the Dev Containers output: View → Output → select `Dev Containers` in the dropdown.
  - Rebuild container: Command Palette → `Dev Containers: Rebuild and Reopen in Container`.

- If ports are in use or Turbopack/Next fails to bind:
  - The devcontainer uses `tandem-dev-start.sh` to clean ports (it uses `fuser` + `lsof` + `pkill`). Ensure `tandem-dev-start.sh` is executable.
  - If Next cannot write to `.next`, remove the folder and restart: `rm -rf .next && npm run dev` inside the app.

- ESLint errors in editor but not in CLI:
  - Reload VS Code window (Developer: Reload Window) and restart the TypeScript/JS server (Command Palette → `TypeScript: Restart TS Server`).

- If one app takes port 3000 unexpectedly:
  - We intentionally bind `admin` to `3002` to avoid a race. To change ports, update `apps/*/package.json` or use `-p` / PORT env.

---

## Deployment notes (Vercel / Render)

- Frontends (`apps/client`, `apps/admin`):
  - These are Next.js apps and can be deployed to Vercel directly by connecting the GitHub repo and pointing the project root to the appropriate folder for each site.
  - On Vercel, ensure environment variables are set in the project settings (use the same keys as local `.env` placeholders).

- API (`packages/api`):
  - Option A: Deploy to Render or a small Node host as a service (set `PORT` and env vars). Point the frontend `NEXT_PUBLIC_API_URL` to that service URL.
  - Option B: Deploy as a serverless function if you adapt the server to the platform (may need small refactor).

General steps for Vercel (frontends):
1. Create a new Vercel project, link to the repo and select the appropriate subdirectory (e.g., `apps/client`).
2. Add needed environment variables in the Vercel dashboard.
3. Deploy; check build logs for `next build` and runtime.

General steps for Render (API):
1. Create a new Web Service, point to `packages/api` as the root for the service.
2. Set the build command (if needed) and the start command (`node index.js`) or use `npm run dev` for staging.
3. Add env vars in the Render dashboard and deploy.

---

## Common fixes & notes

- If ESLint or Prettier shows different results between CLI and VS Code, reload the window and ensure the ESLint/Prettier extensions are installed in the container.
- When Next falls back to another port, check console output to learn which port it chose.
- Keep `.env` secrets out of Git.

---

## TODO

- [ ] Add short developer onboarding checklist for new contributors.
- [ ] Add CI checks that run `npm run lint` and `npm run format` on PRs.
- [ ] Add a note about where to find the logs for the devcontainer runtime (Dev Containers output channel).

---

If anything in this runbook becomes outdated, update `SETUP.md` in the repo so others benefit from the correction.
