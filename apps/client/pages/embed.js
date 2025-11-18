import React from "react";

export default function EmbedGenerator() {
  const origin =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_WIDGET_ORIGIN
      ? process.env.NEXT_PUBLIC_WIDGET_ORIGIN.replace(/\/$/, "")
      : "";

  const embedCode = `<script src="${origin}/tandem-widget.js" data-restaurant-id="REPLACE_ME" async></script>`;

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, -apple-system" }}>
      <h1>Embed Generator</h1>
      <p>
        Copy the snippet below into any external website. Replace <code>REPLACE_ME</code>
        with your restaurant id.
      </p>

      <div style={{ marginTop: 12 }}>
        <textarea
          readOnly
          value={embedCode}
          style={{ width: "100%", height: 120, fontFamily: "monospace", fontSize: 14 }}
        />
      </div>
    </div>
  );
}
