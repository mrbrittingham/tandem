import React from "react";
import { MessageCircle } from "lucide-react";
import { useTheme } from "../../lib/theme-context";

export function TypingIndicator() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
      }}
    >
      <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: theme.colors.primary,
      }}
      >
        <MessageCircle style={{ width: 16, height: 16, color: "#ffffff" }} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
      <div className="tandem-typing-dot" style={{ backgroundColor: theme.colors.highlight }} />
      <div className="tandem-typing-dot tandem-typing-dot-delay-1" style={{ backgroundColor: theme.colors.highlight }} />
      <div className="tandem-typing-dot tandem-typing-dot-delay-2" style={{ backgroundColor: theme.colors.highlight }} />
      </div>
    <span
      style={{
        fontSize: 11,
        opacity: 0.6,
        color: "rgba(92, 46, 74, 0.6)",
        fontFamily: theme.typography.body,
      }}
    >
      Agent is typing…
    </span>
    </div>
  );
}
