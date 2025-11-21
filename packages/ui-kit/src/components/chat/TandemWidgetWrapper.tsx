import React, { useEffect, useRef, useState } from "react";
import { ChatWidget } from "./ChatWidget";
import { ChatTrigger } from "./ChatTrigger";

let globalMounted = false;

export interface TandemWidgetWrapperProps {
  restaurantSlug?: string;
  themeName?: string;
}

export const TandemWidgetWrapper: React.FC<TandemWidgetWrapperProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    if (globalMounted) return;
    globalMounted = true;
    mountedRef.current = true;
    return () => {
      globalMounted = false;
    };
  }, []);

  if (!mountedRef.current && globalMounted) {
    return null;
  }

  return (
    <>
      <ChatTrigger
        onClick={() => {
          setIsOpen((prev) => !prev);
          // Opening the widget clears the initial unread notification.
          setHasUnread(false);
        }}
        showNotification={hasUnread}
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
          <ChatWidget />
        </div>
      )}
    </>
  );
};
