import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MessageCircle } from "lucide-react";
import { useTheme } from "../../lib/theme-context";
export function TypingIndicator() {
    const { theme } = useTheme();
    return (_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", style: { backgroundColor: theme.colors.secondary }, children: _jsx(MessageCircle, { className: "w-4 h-4 text-white" }) }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-gray-400 typing-dot" }), _jsx("div", { className: "w-2 h-2 rounded-full bg-gray-400 typing-dot" }), _jsx("div", { className: "w-2 h-2 rounded-full bg-gray-400 typing-dot" })] }), _jsx("span", { className: "text-xs text-gray-400 opacity-60", children: "Agent is typing\u2026" })] }));
}
