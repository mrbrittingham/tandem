import React, { useEffect, useState } from "react";

export default function TypingIndicator({ style = {} } = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // fade in
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const containerStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 12px",
    margin: "0 auto",
    borderRadius: 999,
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 8px 30px rgba(10,20,30,0.06)",
    maxWidth: 320,
    width: "auto",
    opacity: visible ? 1 : 0,
    transition: "opacity 220ms ease",
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    fontSize: 13,
    color: "#344A55",
    alignSelf: "center",
    ...style,
  };

  const dotBase = {
    width: 8,
    height: 8,
    borderRadius: 4,
    background: "#344A55",
    opacity: 0,
  };

  // keyframes are added via style tag below because we are not using external CSS
  return (
    <div style={{ display: "flex", justifyContent: "center" }} aria-hidden>
      <style>{`
        @keyframes typingDotAppear {
          0% { opacity: 0; transform: translateY(0); }
          10% { opacity: 1; }
          60% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      <div style={containerStyle}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          {/* Tandem icon (simple badge) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#0E5A81" />
            <path d="M8 12.5c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3-3-1.3-3-3z" fill="#fff" opacity="0.9"/>
          </svg>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ color: "#344A55", fontWeight: 600 }}>Agent is typing</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, width: 36 }}>
              <div style={{ ...dotBase, animation: "typingDotAppear 900ms linear infinite", animationDelay: "0ms" }} />
              <div style={{ ...dotBase, animation: "typingDotAppear 900ms linear infinite", animationDelay: "300ms" }} />
              <div style={{ ...dotBase, animation: "typingDotAppear 900ms linear infinite", animationDelay: "600ms" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
