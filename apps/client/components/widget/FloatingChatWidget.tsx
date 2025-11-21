import React, { useState, useCallback, useEffect } from "react";
import { ChatWidget } from "@tandem/ui-kit";
import { FloatingChatTrigger } from "./FloatingChatTrigger";

interface FloatingChatWidgetProps {
  restaurantId?: string;
}

export function FloatingChatWidget({ restaurantId }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1); // intro message
  const [hasPopped, setHasPopped] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((open) => {
      const next = !open;
      if (next) {
        // Opening the widget marks all messages as read.
        setUnreadCount(0);
      }
      return next;
    });
  }, []);

  // Placeholder for wiring to real message events later.
  const handleNewMessage = useCallback(() => {
    setUnreadCount((count) => (isOpen ? count : count + 1));
  }, [isOpen]);

  // Trigger a one-time attention-grab pop animation on initial load
  useEffect(() => {
    if (hasPopped) return;
    const timer = setTimeout(() => {
      setHasPopped(true);
    }, 10);
    return () => clearTimeout(timer);
  }, [hasPopped]);

  return (
    <>
      <FloatingChatTrigger
        onClick={handleToggle}
        showNotification={unreadCount > 0}
        className={!hasPopped ? "tandem-trigger-pop" : undefined}
      />
      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 99999,
            animation: "tandem-widget-pop 200ms ease-out",
          }}
        >
          <ChatWidget
            restaurantId={restaurantId}
            onAgentMessage={handleNewMessage}
          />
        </div>
      )}
    </>
  );
}
