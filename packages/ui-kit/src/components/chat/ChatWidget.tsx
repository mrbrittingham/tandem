import React, { useEffect, useRef, useState } from "react";
import { UserBubble } from "./user-bubble";
import { AgentBubble } from "./agent-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { ChatHeader, HeaderVariant } from "./chat-header";
import { useTheme } from "../../lib/theme-context";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp?: string;
  ctaText?: string;
}

export interface ChatWidgetProps {
  headerVariant?: HeaderVariant;
  restaurantId?: string;
  onAgentMessage?: () => void;
  onClose?: () => void;
}

export function ChatWidget({ headerVariant = "text-logo", restaurantId, onAgentMessage, onClose }: ChatWidgetProps) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>(() => {
    const initial: Message[] = [];
    const welcomeText = (theme as any)?.branding?.welcomeMessage as string | undefined;
    const fallbackWelcome = theme?.branding?.brandName
      ? `Welcome to ${theme.branding.brandName}! How can I help you today?`
      : "Hi there! How can I help you today?";

    // Avoid generating timestamps during SSR to prevent hydration mismatches.
    initial.push({
      id: "agent-welcome",
      type: "agent",
      content: welcomeText || fallbackWelcome,
    });

    return initial;
  });
  const [showTyping, setShowTyping] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const sendToApi = async (content: string) => {
    try {
      setShowTyping(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const payload: any = { message: content };
      if (restaurantId) {
        payload.restaurant_id = restaurantId;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const json = await res.json();
      const replyText = String(json?.reply ?? "Sorry, I wasn't able to respond.");

      const agentReply: Message = {
        id: `agent-${Date.now()}`,
        type: "agent",
        content: replyText,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, agentReply]);
      if (onAgentMessage) onAgentMessage();
    } catch (err) {
      const agentReply: Message = {
        id: `agent-error-${Date.now()}`,
        type: "agent",
        content: "Sorry, something went wrong while contacting the server.",
      };
      setMessages((prev) => [...prev, agentReply]);
    } finally {
      setShowTyping(false);
    }
  };

  const handleSend = (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    void sendToApi(message);
  };

  const handleClearConversation = () => {
    const welcomeText = (theme as any)?.branding?.welcomeMessage as string | undefined;
    const fallbackWelcome = theme?.branding?.brandName
      ? `Welcome to ${theme.branding.brandName}! How can I help you today?`
      : "Hi there! How can I help you today?";

    const welcomeMessage: Message = {
      id: `agent-welcome-${Date.now()}`,
      type: "agent",
      content: welcomeText || fallbackWelcome,
    };

    setMessages([welcomeMessage]);
  };

  const handleToggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
  };

  const handleToggleSounds = () => {
    setSoundEnabled((prev) => !prev);
  };

  const handleMinimize = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      style={{
        width: "400px",
        height: "650px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii.widget,
        boxShadow: theme.shadows.deep,
        overflow: "hidden",
        fontFamily: theme.typography.body,
      }}
    >
      <ChatHeader
        variant={headerVariant}
        onClose={onClose}
        onMinimize={handleMinimize}
        onClearConversation={handleClearConversation}
        onToggleNotifications={handleToggleNotifications}
        onToggleSounds={handleToggleSounds}
        notificationsEnabled={notificationsEnabled}
        soundEnabled={soundEnabled}
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px 12px",
          backgroundColor: theme.colors.background,
          boxSizing: "border-box",
        }}
      >
        {messages.map((msg) =>
          msg.type === "user" ? (
            <UserBubble key={msg.id} timestamp={msg.timestamp}>
              {msg.content}
            </UserBubble>
          ) : (
            <AgentBubble key={msg.id} timestamp={msg.timestamp} ctaText={msg.ctaText}>
              {msg.content}
            </AgentBubble>
          )
        )}

        {showTyping && <TypingIndicator />}
      </div>

      {/* Quick-access pill buttons above the input */}
      <div
        style={{
          padding: "8px 20px 4px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          backgroundColor: theme.colors.background,
        }}
      >
        {["Menu", "Hours", "Reservations", "Directions"].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              // placeholder handler – can be wired to intents later
            }}
            style={{
              padding: "6px 14px",
              borderRadius: theme.radii.button,
              border: "none",
              background: theme.gradients?.cta || theme.colors.primary,
              color: "#ffffff",
              fontSize: 13,
              fontFamily: theme.typography.body,
              cursor: "pointer",
              boxShadow: theme.shadows.soft,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <ChatInput onSend={handleSend} />

      <div
        style={{
          backgroundColor: theme.colors.surface,
          borderTop: `1px solid rgba(92, 46, 74, 0.1)`,
          padding: "8px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            letterSpacing: "0.05em",
            fontFamily: "'Lilita One', cursive",
            color: theme.colors.primary,
            opacity: 0.6,
          }}
        >
          POWERED BY TANDEM
        </span>
      </div>
    </div>
  );
}
