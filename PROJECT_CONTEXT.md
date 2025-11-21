## Tandem Project Context

This document gives AI assistants (GitHub Copilot / ChatGPT) a stable, high-level mental model of the Tandem project. Treat it as **current reality + goals**, not as rigid rules. It should be updated whenever the project direction or architecture changes in material ways.

### Product Overview

- **Product name:** Tandem
- **Owner:** Mike
- **Domain:** Multi-tenant SaaS for restaurants (and future verticals).
- **Core idea:** A restaurant-focused AI chatbot platform with a modern, embeddable chat widget that feels like a branded front-of-house assistant.
- **Primary functions:**
  - Answer FAQs
  - Show menus and specials
  - Handle reservation flows (v1 via smart routing, v2 via POS integration)
  - Support niche, restaurant- or industry-specific "modules" (e.g., wine pairing, allergens, events).

### High-Level Interfaces

1. **Public Chat Widget** – Embedded on restaurant sites; branded per restaurant; talks to Tandem's backend message engine.
2. **Client Dashboard** – For restaurant owners/managers to manage content, branding, settings, modules, and (eventually) reservation settings.
3. **Admin Dashboard** – For Mike and team to manage all restaurants, modules, onboarding, system configuration, and deeper analytics/debug tooling.

There is an open design question about #2 vs #3: they can be separate dashboards/apps or a single dashboard with role-based views. Assistants may propose and help implement a clean, maintainable approach, but must outline tradeoffs and a migration path.

### Current Tech Stack & Monorepo Layout

- **Monorepo root:** `/workspace` inside the dev container (host path often `C:\dev\tandem`).
- **Apps:**
  - `apps/client` – Next.js **Pages Router** app for public/demo restaurant experiences and the embedded widget surface.
  - `apps/admin` – Next.js **App Router** app for admin/dashboard experiences.
- **Packages:**
  - `packages/api` – Express/Node backend (port 4000) and shared API logic for menus, FAQs, restaurants, etc.
  - `packages/ui` – Legacy/shared React UI components, including an older ChatWidget implementation.
  - `packages/ui-kit` – Figma-derived design system components, including the **new** ChatWidget, bubbles, typing indicator, chat header, CTA buttons, and theming/branding utilities.
- **Backend/Data:**
  - `supabase/` – SQL schema and seed files. Supabase (Postgres + Auth + Storage) is the current primary database/auth provider.
- **Dev container:**
  - Repo runs inside a VS Code dev container (Debian). Assistants should assume commands run from `/workspace`.

### Canonical Chat Experience (Current Source of Truth)

- **Canonical widget implementation:**
  - `packages/ui-kit/src/components/chat/ChatWidget.tsx`
  - Theming driven by `ThemeProvider` and `windmillCreekTheme` from `packages/ui-kit/src/lib/theme-context.ts` and `packages/ui-kit/src/lib/themes/windmill-creek.ts`.
- **Legacy widget:**
  - `packages/ui/ChatWidget.jsx` – still present and used in some places, but considered **legacy**. New work should prefer the ui-kit variant unless explicitly requested otherwise.
- **Windmill Creek restaurant page:**
  - `apps/client/pages/restaurant/[slug].js`
  - For the Windmill Creek experience, this page should import from `@tandem/ui-kit` and wrap the UI with:
    - `import { ChatWidget, ThemeProvider, windmillCreekTheme } from "@tandem/ui-kit";`
    - `<ThemeProvider defaultTheme={windmillCreekTheme}><ChatWidget headerVariant="with-image" /></ThemeProvider>`

### Reservations: v1 vs v2+

- **v1 (current acceptable behavior):**
  - Reservation flows may simply route users to external portals: Resy, OpenTable, Toast Tables, custom booking pages, or email/phone CTAs.
  - Focus: smart routing, clean UX, and branded messaging rather than deep integration.
- **v2+ (future goal):**
  - Integrate with POS/reservation systems (starting with **Toast**) to create/modify or pre-fill reservations directly from Tandem.
  - Design data models and APIs to make it easy to switch between "external CTA" mode and "direct integration" mode.
  - Back-end only: POS integrations must **not** be called directly from the browser.

### Modules Concept (Important)

Tandem should support optional **modules** that can be enabled/disabled per restaurant. Examples:

- Wine pairing module (current example: Windmill Creek winery).
- Allergen/dietary modules:
  - Gluten allergy
  - Shellfish allergy
  - Peanut allergy
  - Others: vegan, vegetarian, dairy-free, etc.
- Specials/promotions module.
- Events module.
- Future: ordering/delivery integrations (DoorDash, Toast Online Ordering, Uber Eats, etc.), if feasible.

Think in terms of a flexible module system, not hardcoded one-offs. Initial designs do **not** have to be perfect; they should be structured so they can grow without becoming unmaintainable.

### Data & Backend Model (Supabase)

- **Current backend:** Supabase (Postgres + Auth + Storage) is the main backing store.
- **Expected tables (conceptual, not mandatory):**
  - `restaurants`, `menus`, `menu_categories`, `menu_items`
  - `faqs`, `hours`, `reservations`
  - `modules_enabled` or similar join table for modules
  - Module-specific tables (e.g., allergen mappings from menu items → allergens)
- Assistants may refine/normalize schema, propose better structures, or remove dead tables—but should describe changes clearly and keep migrations realistic for a solo dev.
- **API layer:** `packages/api`
  - Should provide coherent, consistent routes for client + admin apps and the widget.
  - Dead/unused routes should be cleaned up over time.
  - A clean service layer that centralizes Supabase/data access is preferred.

### Chat & Message Engine

- The chat widget talks to a backend **message engine**.
- Responsibilities of the message engine:
  - Classify intent: hours, menu, allergens, reservations, specials, general info, etc.
  - Fetch relevant data from Supabase or external APIs.
  - Return structured responses that the UI can render via consistent patterns (bubbles, CTAs, lists, etc.).
- **Implementation guidance:**
  - Start simple and deterministic (no need for heavy infra or over-engineered NLP).
  - Maintain a clear separation between frontend/UI concerns (rendering, state) and backend concerns (data retrieval, intent routing, formatting).

### UI, Widget, and Figma → Code Flow

- **Design source:** Figma UI kit for chat components and dashboards.
- **Implementation target:** React components (often Tailwind-based) under `packages/ui-kit` (and, where appropriate, `packages/ui`).
- Core chat pieces:
  - Chat container, header (branding + optional hero image)
  - Message bubbles (user + agent)
  - Typing indicator
  - Input box
  - CTA blocks (e.g., "View Menu", "Book a Table", "See Today’s Specials")
  - Error/loading states
  - Mobile responsiveness and embeddable behavior
- The widget should eventually be embeddable via a simple script snippet that knows which restaurant config to load.
- Assistants **should** refine component boundaries, props, context usage, and state flows when it clearly improves clarity and maintainability.

### Dashboards

- **Admin Dashboard (apps/admin):**
  - Manage all restaurants, modules, onboarding, system config, logs, and possibly analytics.
- **Client Dashboard:**
  - Let restaurant clients manage menus, FAQs, hours, specials, branding, widget behavior, reservation settings, and basic analytics.
- Design question: separate vs unified dashboards (role-based views). Assistants may recommend a strategy and outline migration steps but should keep it realistic for a solo dev.

### Freedom & Expectations for AI Assistants

- Assistants **may**:
  - Suggest changes to architecture, data models, routing, component structure, and API design.
  - Propose incremental refactors and better patterns inside the existing stack.
  - Challenge earlier assumptions when there is a clearly superior approach (performance, simplicity, maintainability, flexibility).
- Assistants **must**:
  - Keep suggestions realistic given a solo developer.
  - Explain significant departures from the current approach, outline tradeoffs, and provide step-by-step migration plans.
  - Prefer minimal, targeted changes unless broader refactors are explicitly requested.
  - Obey `copilot-instructions.md` for response style (concise, plain text, summary at the end).
  - Read this `PROJECT_CONTEXT.md` and the root `README.md` before performing large structural or architectural changes.

### Operational Notes

- **Dev commands (run from /workspace):**
  - Start all major services: `./tandem-dev-start.sh`
  - Stop all services: `./tandem-stop.sh`
  - Client app only: `npm run dev:client`
  - Admin app only: `npm run dev:admin`
- **External systems (conceptual):**
  - Supabase web dashboards for DB/Auth management.
  - Future: Toast POS and other integrations for reservations and ordering.

### Maintenance of This Document

- Whenever major decisions are made (e.g., new canonical chat implementation, new module system shape, major schema redesign, dashboard consolidation), assistants should:
  - Update this `PROJECT_CONTEXT.md` to reflect **new reality + goals**.
  - Optionally add more detailed notes to `README.md` or other appropriate docs.
- This file is intentionally high-level; implementation minutiae belong in code comments, schemas, or feature-specific docs.
