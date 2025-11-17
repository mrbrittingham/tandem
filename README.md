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

## Run locally (devcontainer)

If you're inside the provided devcontainer, the easiest way to start all services at once is:

```bash
cd /workspace
npm install
npm run dev
```

This runs the Admin, Client, and API together (via the root `dev` script). After it starts:

- Admin: http://localhost:3000
- Client: http://localhost:3001
- API: http://localhost:4000

Stop all services with `Ctrl+C` in the same terminal.

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

---

**Development Workflow (detailed)**

1. Open the project in the devcontainer

- In VS Code, choose `Remote - Containers: Reopen in Container` (or `Dev Containers: Reopen in Container`). The container image defined in `.devcontainer/devcontainer.json` is used.
- The devcontainer will run `npm install` automatically (postCreateCommand). If you change dependencies, re-run `npm install` inside the container.

2. Install dependencies (one-time per machine)

```bash
cd /workspace
npm install
```

3. Running services

- Recommended single-terminal start (dev):

```bash
cd /workspace
npm run dev
```

This runs the Admin, Client, and API concurrently (root `dev` script uses `concurrently`).

- If you prefer separate terminals (one per service):

Admin:

```bash
cd /workspace/apps/admin
npm install
npm run dev
```

Client:

```bash
cd /workspace/apps/client
npm install
npm run dev
```

API:

```bash
cd /workspace/packages/api
npm install
npm run dev
```

4. Environment variables (.env)

- Template files are provided at `apps/admin/.env.example`, `apps/client/.env.example`, and `packages/api/.env.example`.
- To create local secrets, copy the example files to the actual env files:

```bash
cp packages/api/.env.example packages/api/.env
cp apps/admin/.env.example apps/admin/.env.local
cp apps/client/.env.example apps/client/.env.local
```

- Edit the created `.env` / `.env.local` files and paste real keys (Supabase, OpenAI). Do not commit these files — they are ignored by `.gitignore`.

5. Adding or editing restaurant data (local demo)

- The project includes demo JSON at `packages/api/demo/windmill.json`. Use the API demo endpoints to load this data:

```
GET /api/demo/restaurant
GET /api/demo/menus
GET /api/demo/faqs
```

- For working with Supabase, create a local Supabase project or use a hosted instance and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `packages/api/.env`.

6. Git and sync workflow (work across multiple machines)

- Commit frequently and push to a remote (GitHub) as the canonical backup.

Simple sequence:

```bash
git add -A
git commit -m "Your message"
git push origin main
```

- On the other machine:

```bash
git pull origin main
# Reopen in devcontainer and run npm install if needed
```

- Use branches for features and pull requests to avoid conflicts.

7. Backups and snapshots

- After a stable state, create a tag to mark the snapshot:

```bash
git tag -a v0.1 -m "devcontainer snapshot"
git push origin v0.1
```

8. Troubleshooting

- If ports are in use, list listeners:

```bash
ss -ltnp | grep -E ':3000|:3001|:4000' || true
```

- Kill a process by PID if needed:

```bash
kill <PID>
```

9. Working on both machines (summary)

- Keep `.env` secrets local per machine. Do not commit.
- Use `git push` / `git pull` to move code changes between machines.
- Reopen the repository in the devcontainer after pulling new code to ensure the environment is current.

**AI Agent Workflow Rules — Server Restart Handling**

- **Policy:** The AI agent must not restart, stop, or otherwise control any local development servers (Next.js, API server, or other) without explicit user permission.
- **When a change requires a restart:** the agent will (a) add and commit the code changes, (b) provide the exact command(s) the user should run to restart the affected service(s), and (c) provide a short re-entry prompt describing what logs or outputs to collect and where to paste them back into the conversation.
- **When runtime logs are needed:** the agent will add targeted debug logging and clearly indicate the exact restart and log-capture commands for the user to run. The agent will not execute the restart itself.
- **Exceptions:** None. Always ask before performing any action that restarts or stops user services.

The following rules are the authoritative, permanent workflow the AI agent will follow in this repository. Do not change these without explicit consent from the repository maintainer.

1. Never restart any server, process, or service on your own.
   - If a restart is required, the agent must pause immediately and notify the user.

2. Before the user performs a restart, the agent must:
   - State the exact task it was working on.
   - Explain exactly why a restart is necessary.
   - Confirm whether `README.md` already contains the restart workflow rules; if not, update it immediately.

3. When a restart is required, the agent must provide BOTH restart choices and let the user decide:
   - (A) Reopen the Dev Container (preferred clean method).
   - (B) Run manual restart commands in the terminal without reopening the container.
   - The agent must not assume which method the user will use — always ask.

4. After offering the restart options, the agent must generate a “POST-RESTART RE-SYNC PROMPT” for the user to paste back into the chat once the restart is complete.

5. The POST-RESTART RE-SYNC PROMPT must ALWAYS follow this exact template (do not alter):

   ---------------------------------------------------------
   POST-RESTART RE-SYNC PROMPT (TEMPLATE — DO NOT ALTER)

   “I restarted the server/container. Resume with the following context:

   • Last task you were working on:
     <summarize the task>

   • Steps you already completed:
     <list each completed step>

   • The next step you need to continue with:
     <state the exact next action>

   • Files, paths, or variables you should keep in mind:
     <list any required context such as file names, endpoint URLs, env vars>

   Resume exactly from here without repeating steps or executing ahead.”
   ---------------------------------------------------------

6. After giving the Re-Sync Prompt, the agent must stop all actions and wait. The agent must not run commands, write files, or continue until the user pastes the Re-Sync Prompt back after the restart.

7. After the user restarts and pastes the Re-Sync Prompt back, the agent must:
   - Resume exactly where it left off.
   - Not redo any finished steps.
   - Not skip ahead.
   - Continue working normally from that point.

8. These rules apply permanently to every future action in this workspace.

When these rules are saved to `README.md`, the agent will pause and report it is ready for the next step.

---
