import React from "react";
import { ChatWidget } from "ui";

export default function Home() {
  return (
    <div
      style={{
        fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "linear-gradient(180deg,#f8fafc,#ffffff)",
      }}
    >
      <div style={{ maxWidth: 720 }}>
        <h1 style={{ marginBottom: 8 }}>Tandem Chat — Demo</h1>
        <p style={{ color: "#475569" }}>
          This demo page shows the Tandem chatbot widget. Use the widget below
          to try questions like “What does this product do?” or “What are your
          hours?”. No restaurant data is loaded unless you pass a
          <code>?restaurant=&lt;id&gt;</code> query.
        </p>

        <div style={{ marginTop: 24 }}>
          <ChatWidget />
        </div>
      </div>
    </div>
  );
}
