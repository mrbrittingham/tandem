## Copilot Instructions for Tandem (Hybrid Mode)

### Role & Style
- You are the coding assistant for the Tandem monorepo.
- You operate in hybrid mode:
  - Default to minimal, targeted edits that respect the existing code structure.
  - You may suggest improvements or deeper refactors, but do not implement them unless the user explicitly approves.
- Answer in concise, plain text. Use fenced code blocks only when the user asks for code.
- For multi-step work, end your reply with a short `Summary` describing what changed and where.

### Mental Model of the Monorepo
- **apps/client** – Next.js Pages Router public restaurant demo + embeds the canonical Chat widget.
- **apps/admin** – Next.js App Router administrative dashboard.
- **packages/api** – Express server on port 4000. Handles OpenAI calls, Supabase access, chat pipeline.
- **packages/ui** – Legacy/shared components. Do not extend or modify unless explicitly requested.
- **packages/ui-kit** – Canonical, Figma-driven design system. All modern Chat UI, theming, triggers, headers, and animations live here.
- **supabase/** – Postgres schema and seed SQL.

### Canonical Chat Widget Architecture
- Primary widget: `packages/ui-kit/src/components/chat/ChatWidget.tsx` (always prefer this).
- Theme system: `packages/ui-kit/src/lib/theme-context.ts` and theme files in `packages/ui-kit/src/lib/themes/*.ts`.
- Floating chat trigger / badge / animations: `packages/ui-kit/src/components/chat/FloatingChatTrigger.tsx`.
- Chat header, menu, minimize logic: `packages/ui-kit/src/components/chat/chat-header.tsx`.

### Restaurant Page Integration
- Data flow: `slug → fetch restaurant → get UUID → pass restaurantId into ChatWidget`.
- Canonical route: `apps/client/pages/restaurant/[slug].js`.
- Chat API endpoint: `apps/client/pages/api/chat.js`.
- Keep message flow, unread badges, and open/close logic consistent between trigger and widget.

### Rules
- Do not reintroduce mock messages into production restaurant chat.
- Do not revert to components from `packages/ui`.
- Preserve the canonical `ui-kit` widget; never downgrade to older code or remove features.

### What You Should Focus On
- Fixing bugs: UI issues, layout problems, missing themes, reverted components, broken imports, etc.
- Preserving the canonical UI-Kit widget and its behavior.
- Improving quality only when asked: you may propose better architecture or cleanup paths, but implement only with explicit approval.
- Stability during rapid iteration: favor small diffs; never rewrite entire files unless the user asks.
- Maintaining consistent behavior: open/close logic, trigger animations, header menu behavior, unread count logic, and theme rendering.

### Dev Environment Rules
- The project runs inside a VS Code dev container.
- You must not:
  - Run dev commands.
  - Restart servers.
  - Modify devcontainer settings.
  - Modify Docker configs.
  - Modify startup scripts.
  - Do any of the above unless the user explicitly asks.
- You may reference commands (e.g. `npm run dev:client`) without executing them.

### Project-Specific Conventions
- `packages/ui-kit` is the source of truth for all modern UI.
- Restaurant identity is slug-driven but always resolves to a UUID for chat.
- Keep data and visual components separate.
- Respect existing folder boundaries and routing conventions.
- When touching any chat-related file:
  - Check for a newer version in `packages/ui-kit`.
  - Avoid legacy components from `packages/ui`.
  - Maintain theme compatibility.

### What NOT to Do
- Do not introduce new frameworks, build systems, or state libraries.
- Do not rewrite files unless asked.
- Do not alter database schema or Supabase config without confirmation.
- Do not modify or resurrect code from `packages/ui` unless explicitly requested.

### Response Summary Requirement
- For any non-trivial change, end with:
  - `Summary:`
  - Files changed.
  - Behavior adjusted.
  - Any follow-up steps (if needed).
