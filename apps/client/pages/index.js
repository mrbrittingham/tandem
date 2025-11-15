import React from 'react';
import { ChatWidget } from '../../../packages/ui';

export default function Home() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 40 }}>
      <h1>Tandem — Client Dashboard (Starter)</h1>
      <p>This is a placeholder Next.js page for the restaurant client dashboard.</p>
      <h2>Embeddable widget</h2>
      <p>Below is the embeddable chat widget (local dev).</p>

      <div style={{ marginTop: 20 }}>
        <p>Try the widget in the bottom-right corner.</p>
      </div>

      <ChatWidget />
    </div>
  );
}
