# Tandem Client (apps/client)

Quick start:

1. Install dependencies

```bash
cd apps/client
npm install
```

2. Run dev server

```bash
npm run dev
```

Environment:
- Copy `../../.env.example` or create `apps/client/.env.local` and provide values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_OPENAI_API_KEY`.

Notes:
- The embeddable chat widget UI will be developed in `packages/ui` and integrated into this app.
