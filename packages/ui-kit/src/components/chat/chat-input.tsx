import React, { useState } from "react";
import { Mic, Send } from "lucide-react";
import { useTheme } from "../../lib/theme-context";

interface ChatInputProps {
  onSend?: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({ onSend, placeholder = "Type a message..." }: ChatInputProps) {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        borderTop: `1px solid rgba(92, 46, 74, 0.06)` ,
        padding: 16,
        backgroundColor: theme.colors.surface,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          backgroundColor: theme.colors.background,
          borderRadius: theme.radii.bubble,
          boxShadow: theme.shadows.soft,
        }}
    >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
      style={{
        flex: 1,
        border: "none",
        outline: "none",
        backgroundColor: "transparent",
        fontSize: 14,
        color: theme.colors.primary,
        fontFamily: theme.typography.body,
      }}
          />
      <button
        style={{
          border: "none",
          background: "transparent",
          color: theme.colors.highlight,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
      <Mic style={{ width: 20, height: 20 }} />
          </button>
        </div>
        <button
          onClick={handleSend}
      style={{
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radii.button,
        boxShadow: theme.shadows.rich,
        border: "none",
        cursor: "pointer",
      }}
        >
          <Send style={{ width: 20, height: 20, color: theme.icons.sendArrow }} />
        </button>
      </div>
    </div>
  );
}
