"use client";

import { useState } from "react";

export default function EmbedPage() {
  // Load NEXT_PUBLIC_WIDGET_ORIGIN safely
  const origin =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_WIDGET_ORIGIN
      ? process.env.NEXT_PUBLIC_WIDGET_ORIGIN.replace(/\/$/, "")
      : "";

  // Build the actual embed code (as a string)
  const embedCode = `<script
  src="${origin}/tandem-widget.js"
  data-restaurant-id="REPLACE_ME"
  async
></script>`;

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>Widget Embed Code</h1>

      <p style={{ marginBottom: 16 }}>
        Copy the snippet below and paste it into any external website to embed
        the Tandem chatbot widget. Replace{" "}
        <code>REPLACE_ME</code> with your restaurant’s ID.
      </p>

      {/* Display the current resolved origin */}
      <div style={{ marginBottom: 20, fontSize: 14, opacity: 0.7 }}>
        <strong>Widget Origin:</strong> {origin || "(not set)"}
      </div>

      <textarea
        readOnly
        value={embedCode}
        style={{
          width: "100%",
          height: 150,
          fontFamily: "monospace",
          fontSize: 14,
          padding: 12,
          borderRadius: 6,
          border: "1px solid #ccc",
          marginBottom: 16,
        }}
      />

      <button
        onClick={copyToClipboard}
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          background: "#0070f3",
          color: "white",
          fontSize: 14,
          cursor: "pointer",
          border: "none",
        }}
      >
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
    </main>
  );
}
