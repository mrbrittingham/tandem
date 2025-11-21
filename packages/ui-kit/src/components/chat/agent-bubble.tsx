import React from "react";
import { CtaPillButton } from "../CtaPillButton";
import { useTheme } from "../../lib/theme-context";

interface AgentBubbleProps {
  children: React.ReactNode;
  timestamp?: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export function AgentBubble({ children, timestamp, ctaText, onCtaClick }: AgentBubbleProps) {
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          maxWidth: "75%",
          padding: "12px 16px",
          borderRadius: theme.radii.bubble,
          backgroundColor: theme.colors.agentBubble,
          boxShadow: theme.shadows.soft,
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
        {ctaText && (
          <div
            style={{
              marginTop: 12,
            }}
          >
            <CtaPillButton onClick={onCtaClick}>{ctaText}</CtaPillButton>
          </div>
        )}
      </div>
      {timestamp && (
        <span
          style={{
            paddingLeft: 4,
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
