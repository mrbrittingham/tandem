In this repo, AI assistants (GitHub Copilot / ChatGPT) must follow these rules:

1. Always answer concisely and in plain text. Avoid fenced code blocks unless explicitly requested.
2. For any detailed or multi-step task (refactors, new components, integrations, bugfixes), always end the response with a short, copy-pastable natural-language summary that:
   - Clearly states what was changed, where (file paths / modules), and why.
   - Mentions any follow-up steps, dependencies, or commands the developer should run.
   - Stays plain text (no code fences), so it can be pasted directly into another ChatGPT session.
3. Prefer minimal, targeted changes that preserve existing behavior unless the user explicitly asks for broader refactors.
4. Never silently ignore errors: if something can’t be done or is uncertain (for example, missing context, failing build, or a missing dependency), say so clearly and suggest the most likely fix.
5. When adding or modifying files, respect the existing project structure, naming, and style; do not introduce new architectural patterns without being asked.
6. Assume another ChatGPT instance may be monitoring this project; structure explanations so they are easy for another assistant to pick up and continue from.
