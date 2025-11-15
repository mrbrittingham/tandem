export { default as ChatWidget } from './ChatWidget.jsx';
import React from 'react';

export function ChatWidgetPlaceholder() {
  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, maxWidth: 320 }}>
      <strong>Tandem Chat Widget (placeholder)</strong>
      <p style={{ marginTop: 8 }}>This is a starter component from `packages/ui`.</p>
    </div>
  );
}

export default ChatWidgetPlaceholder;
