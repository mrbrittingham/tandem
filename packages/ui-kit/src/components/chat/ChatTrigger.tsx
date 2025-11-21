import React from "react";
import { useTheme } from "../../lib/theme-context";

type ChatTriggerProps = {
  onClick: () => void;
  showNotification?: boolean;
  iconName?: string;
  renderIcon?: () => React.ReactNode;
};

export const ChatTrigger: React.FC<ChatTriggerProps> = ({
  onClick,
  showNotification = true,
  iconName,
  renderIcon,
}) => {
  console.log("[RUNTIME] ui-kit ChatTrigger RENDERED");
  const { theme } = useTheme();

  const size = 96; // diameter of the circle (larger for Windmill Creek)
  const notificationSize = 16;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat"
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width: size,
        height: size,
        borderRadius: "50%",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.accent,
        color: "#ffffff",
        boxShadow: theme.shadows.deep,
        zIndex: 99999,
        transition: "transform 0.15s ease-out",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.07)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.background,
          }}
        >
          {renderIcon ? (
            renderIcon()
          ) : (
            <span
              style={{
                display: "block",
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: theme.gradients?.cta || theme.colors.primary,
              }}
            />
          )}
        </div>

        {showNotification && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              width: notificationSize,
              height: notificationSize,
              borderRadius: "9999px",
              backgroundColor: theme.colors.secondary,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 600,
              animation: "tandem-notification-pop 180ms ease-out",
            }}
          >
            1
          </div>
        )}
      </div>
    </button>
  );
};
