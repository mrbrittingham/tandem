import React from "react";
import { useTheme } from "../../lib/theme-context";

interface UserBubbleProps {
  children: React.ReactNode;
  timestamp?: string;
}

export function UserBubble({ children, timestamp }: UserBubbleProps) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "12px 16px",
          borderRadius: theme.radii.bubble,
          backgroundColor: theme.colors.userBubble,
        }}
      >
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.5,
          color: theme.colors.primary,
          fontFamily: theme.typography.body,
        }}
      >
        {children}
      </p>
      </div>
      {timestamp && (
      <span
        style={{
          paddingRight: 4,
          fontSize: 11,
          color: "rgba(92, 46, 74, 0.55)",
          fontFamily: theme.typography.body,
        }}
      >
        {timestamp}
      </span>
      )}
    </div>
  );
}
