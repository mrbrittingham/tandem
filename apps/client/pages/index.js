import React from 'react';

export default function Home() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 40 }}>
      <h1>Tandem — Client Dashboard (Starter)</h1>
      <p>This is a placeholder Next.js page for the restaurant client dashboard.</p>
      <h2>Embeddable widget</h2>
      <p>Placeholder for the embeddable chat widget. The widget UI will live in `packages/ui`.</p>
      <p>To run locally:</p>
      <pre>cd apps/client
npm install
npm run dev</pre>
      <p>See `apps/client/README.md` for details.</p>
    </div>
  );
}
