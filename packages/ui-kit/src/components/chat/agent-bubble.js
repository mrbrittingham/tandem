import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CtaPillButton } from "../CtaPillButton";
import { useTheme } from "../../lib/theme-context";
export function AgentBubble({ children, timestamp, ctaText, onCtaClick }) {
    const { theme } = useTheme();
    return (_jsxs("div", { className: "flex flex-col items-start gap-1 mb-4", children: [_jsxs("div", { className: "px-4 py-3 max-w-[75%]", style: {
                    borderRadius: "18px",
                    backgroundColor: theme.colors.agentBubble,
                    boxShadow: theme.shadows.soft,
                }, children: [_jsx("p", { className: "text-sm text-gray-800 leading-relaxed", children: children }), ctaText && (_jsx("div", { className: "mt-3", children: _jsx(CtaPillButton, { onClick: onCtaClick, children: ctaText }) }))] }), timestamp && (_jsx("span", { className: "text-xs text-gray-400 px-1", children: timestamp }))] }));
}
