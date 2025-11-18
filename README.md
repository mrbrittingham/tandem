# Tandem — Developer Guide (updated: 11/17/2025)

Tandem is a multi-app monorepo built to power AI-driven restaurant chatbots, menu browsing, FAQ automation, and an embeddable widget for restaurant websites.

This repository includes:

- **apps/client** — Public-facing restaurant pages + ChatWidget
- **apps/admin** — Admin dashboard
- **packages/api** — Standalone Express API
- **packages/ui** — Shared UI components (including ChatWidget)
- **scripts/** — Seed and data generation scripts
- **supabase/** — SQL schema and seed data
- **Devcontainer** — Automated development environment

---

## 1. Devcontainer Autostart Behavior

When this repo is opened in VS Code:

1. VS Code detects `.devcontainer/devcontainer.json`.
2. It prompts to **Reopen in Container**.
3. After the container starts:
   - `postCreateCommand` runs `npm install`
   - `postAttachCommand` runs `bash /workspace/tandem-dev-start.sh`

The startup script:

- Loads `/workspace/.env` if present
- Waits briefly for initialization
- Force-kills anything bound to **3000**, **3001**, or **4000**
- Starts all dev servers via `npm run dev`

Developers do **not** manually start dev servers — they launch automatically.

---

## 2. AI Agent Workflow Rules (Strict)

These rules apply to the AI assistant used inside VS Code.

### The agent **may NOT**:

- Restart dev servers
- Run `npm run dev`
- Kill processes
- Rebuild containers
- Modify `devcontainer.json` or the startup script without explicit approval
- Run Docker commands

### If a restart is required:

The agent must say:

> “A restart is required. Please rebuild the container manually and then paste the RE-SYNC PROMPT.”

### After the developer rebuilds the container, they must paste:

```
RE-SYNC PROMPT:
The container has restarted. Re-sync with repository state,
running servers, environment variables, and recent context.
Do not restart servers. Do not assume any processes are running.
Continue the previous task in inspection-only mode unless instructed otherwise.
```

---

## 3. Environment File Behavior

### `/workspace/.env`

Optional.  
The startup script handles its absence safely.

### `.env.local`

Used by Next.js apps (`apps/client`, `apps/admin`).

### Supabase configuration

Provided by:

- Devcontainer environment injection
- Render deployment variables
- Vercel environment variables

---

## 4. Restaurant Identity Architecture

**Slug → UUID → Data → Chat System**

1. User visits `/restaurant/<slug>`.
2. The page loads data from `/api/restaurant?id=<slug>`.
3. The server resolves the slug to a database UUID.
4. The page passes the UUID to the ChatWidget:
   ```jsx
   <ChatWidget restaurantId={restaurant.id} />
   ```
5. The widget POSTs to `/api/chat`, sending `restaurant_id`.
6. The server loads restaurant/menus/faqs and generates AI system context.

---

## 5. API Endpoints

### Chat:

```
POST /api/chat
```

### Data:

```
GET /api/restaurant?id=<slug-or-uuid>
GET /api/menus?id=<slug-or-uuid>
GET /api/faqs?id=<slug-or-uuid>
```

### Demo mode:

```
/api/demo/restaurant
/api/demo/menus
/api/demo/faqs
```

---

## 6. ChatWidget Behavior

The widget uses:

```
NEXT_PUBLIC_API_BASE
```

If set → `${NEXT_PUBLIC_API_BASE}/api/chat`  
If missing → defaults to same-origin `/api/chat`

UUID → sends `restaurant_id`  
Non-UUID → sends `restaurant_slug`

---

## 7. Demo Mode

When Supabase configuration is missing or errors occur:

- Static `windmill.json` is used
- Demo restaurant ID is slug-like (`windmill-creek`)
- The system prompt is built entirely from JSON

---

## 8. Multi-Machine Behavior

If this repo is used across machines with different OS usernames, cached file permissions may break script executability.

Fix:  
Use **Dev Containers → Rebuild Container**.

---

## 9. Development Commands

Inside the container:

```
npm install      # auto-run by postCreate
npm run dev      # auto-run by startup script
```

Outside the container:  
Do not run dev commands.

---

# README COMPLETE
