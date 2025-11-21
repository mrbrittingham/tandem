import React from "react";
import { useTheme } from "../../lib/theme-context";

interface CtaPillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function CtaPillButton({ children, ...props }: CtaPillButtonProps) {
  const { theme } = useTheme();

  return (
    <button
      {...props}
      style={{
      borderRadius: theme.radii.button,
      padding: "8px 18px",
      fontSize: 14,
      fontWeight: 500,
      border: "none",
      cursor: "pointer",
      backgroundImage: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
      color: "#ffffff",
      fontFamily: "'Lilita One', cursive",
      boxShadow: theme.shadows.rich,
      }}
    >
      {children}
    </button>
  );
}
