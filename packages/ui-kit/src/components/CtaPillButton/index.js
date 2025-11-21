import { jsx as _jsx } from "react/jsx-runtime";
import { useTheme } from "../../lib/theme-context";
export function CtaPillButton({ children, ...props }) {
    const { theme } = useTheme();
    return (_jsx("button", { ...props, style: {
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            backgroundColor: theme.colors.primary,
            color: "#ffffff",
        }, children: children }));
}
