# Tandem Setup Guide (updated: 11/17/2025)

This guide explains how to get the monorepo running in a clean, predictable development environment using the devcontainer system.

---

## 1. Requirements

- VS Code Insiders  
- Docker Desktop with WSL2 enabled  
- Git installed  
- Optional: OpenAI API Key  

No host-level Node.js installation is required — everything runs inside the container.

---

## 2. Clone and Open the Project

```
git clone https://github.com/your-org/tandem.git
cd tandem
code-insiders .
```

VS Code will prompt:  
**“Reopen in Container”** → select it.

---

## 3. Devcontainer Behavior

During the first build:

- Installs all dependencies  
- Runs `npm install`  
- Loads environment variables  
- Runs `/workspace/tandem-dev-start.sh`  
- Launches all dev servers automatically  

If anything breaks → rebuild the container.

---

## 4. Startup Script Behavior

The startup script:

1. Loads `/workspace/.env` if it exists  
2. Waits 2 seconds  
3. Kills processes bound to ports:
   - 3000
   - 3001
   - 4000
4. Starts all services with:
   ```
   npm run dev
   ```

---

## 5. Rebuilding the Container

If servers hang, ports are stuck, or startup script errors:

**Command Palette:**  
```
Dev Containers: Rebuild Container
```

This resets everything cleanly.

---

## 6. AI Agent Rules (Strict)

The AI agent inside VS Code must **never**:

- Restart dev servers  
- Run `npm run dev`  
- Rebuild containers  
- Kill processes  
- Run Docker commands  
- Modify devcontainer files without approval  

### If a restart is required, the agent must say:

> “A restart is required. Please rebuild the container manually and paste the RE-SYNC PROMPT afterward.”

### After rebuild, paste:

```
RE-SYNC PROMPT:
The container has restarted. Re-sync with repository state,
running servers, environment variables, and recent context. 
Do not restart servers. Do not assume any processes are running. 
Continue the previous task in inspection-only mode unless instructed otherwise.
```

---

## 7. Environment Variables

### Next.js apps:
```
NEXT_PUBLIC_API_BASE=<api-base-url>
```

### Standalone API:
```
SUPABASE_URL
SUPABASE_SERVICE_KEY
OPENAI_API_KEY
```

### Root `.env`:
Optional.

---

## 8. Testing API Routes

```
curl http://localhost:3000/api/restaurant?id=test
curl http://localhost:3000/api/chat -X POST -H "Content-Type: application/json" -d '{"message":"hi"}'
```

If using standalone server:
```
curl https://your-api-domain/api/chat
```

---

## 9. Demo Mode

If no Supabase config is present:

- Windmill Creek demo JSON is used  
- All menus/FAQs/restaurant info load from static files  

---

# SETUP COMPLETE
