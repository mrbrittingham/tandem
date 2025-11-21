import React from "react";
import { useTheme } from "../../lib/theme-context";
<<<<<<< HEAD
=======
import { X } from "lucide-react";
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ChatMenu } from "./chat-menu";

export type HeaderVariant = "with-image" | "text-logo" | "minimal";

export interface ChatHeaderProps {
  variant?: HeaderVariant;
  onClose?: () => void;
<<<<<<< HEAD
  onMinimize?: () => void;
  onClearConversation?: () => void;
  onToggleNotifications?: () => void;
  onToggleSounds?: () => void;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
=======
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
}

export function ChatHeader({
  variant = "with-image",
  onClose,
<<<<<<< HEAD
  onMinimize,
  onClearConversation,
  onToggleNotifications,
  onToggleSounds,
  notificationsEnabled = true,
  soundEnabled = true,
=======
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
}: ChatHeaderProps) {
  const { theme } = useTheme();
  const branding = theme.branding || {};

  const hasHero = variant === "with-image" && branding.heroImage;

  //
  // ─────────────────────────────────────────────
  //     WITH-IMAGE (Figma hero header)
  // ─────────────────────────────────────────────
  //
  if (hasHero) {
    const flowerLogo = branding.flowerLogo;

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 140,
          overflow: "hidden",
          backgroundColor: theme.colors.primary,
          color: "#fff",
        }}
      >
        {branding.heroImage && (
				<div
					style={{
						position: "absolute",
						inset: 0,
						backgroundImage: `url(${branding.heroImage})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				/>
			)}

        {/* Content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "16px",
            boxSizing: "border-box",
          }}
        >
          {/* Logo + titles */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {flowerLogo && (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid rgba(255,255,255,0.6)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
                  flexShrink: 0,
                }}
              >
                <img
                  src={flowerLogo}
                  alt={branding.brandName || "Logo"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                  opacity: 0.9,
                }}
              >
                {branding.brandName || "Tasting Room"}
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {branding.chatTitle || "Sommelier Concierge"}
              </span>
            </div>
          </div>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close chat"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
                backdropFilter: "blur(4px)",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }

  // Variant: Text Logo Only (Windmill Creek style)
  if (variant === "text-logo") {
<<<<<<< HEAD
    const textLogoSrc = branding.textLogo
      ? `/assets/logos/${branding.textLogo}`
      : undefined;

=======
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 72,
          backgroundColor: theme.colors.primary,
          borderTopLeftRadius: theme.radii.widget,
          borderTopRightRadius: theme.radii.widget,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
          }}
        >
<<<<<<< HEAD
          {textLogoSrc && (
            <ImageWithFallback
              src={textLogoSrc}
              alt={branding.brandName || "Restaurant logo"}
              style={{
				width: 235,
				height: 75,
				maxWidth: "100%",
				alignSelf: "flex-start",
				objectFit: "contain",
				display: "block",
			}}
=======
          {branding.textLogo && (
            <ImageWithFallback
              src={branding.textLogo}
              alt={branding.brandName}
              style={{
                height: 40,
                objectFit: "contain",
                maxWidth: "80%",
                display: "block",
                margin: "0 auto",
              }}
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
            />
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
<<<<<<< HEAD
          <ChatMenu
            onMinimize={onMinimize}
            onClearConversation={onClearConversation}
            onToggleNotifications={onToggleNotifications}
            onToggleSounds={onToggleSounds}
            notificationsEnabled={notificationsEnabled}
            soundEnabled={soundEnabled}
          />

          <button
            onClick={onMinimize || onClose}
            aria-label="Minimize chat"
=======
          <ChatMenu />

          <button
            onClick={onClose}
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
            style={{
              padding: 8,
              borderRadius: theme.radii.button,
              border: "none",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
<<<<<<< HEAD
            <span
              style={{
                fontSize: 20,
                lineHeight: 1,
                color: theme.icons.headerIcons,
                marginTop: -2,
              }}
            >
              _
            </span>
=======
            <X
              style={{
                width: 24,
                height: 24,
                color: theme.icons.headerIcons,
              }}
            />
>>>>>>> 6242fe6fdcb3c4ea7b51c4db97d13ad68c94574a
          </button>
        </div>
      </div>
    );
  }

  // Minimal variant fallback
  return (
    <div
      style={{
        width: "100%",
        height: 80,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.primary,
        color: "#fff",
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        {branding.chatTitle || branding.brandName || "Chat"}
      </span>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
