import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from "../../lib/theme-context";
export function UserBubble({ children, timestamp }) {
    const { theme } = useTheme();
    return (_jsxs("div", { className: "flex flex-col items-end gap-1 mb-4", children: [_jsx("div", { className: "px-4 py-3 max-w-[75%]", style: {
                    borderRadius: "18px",
                    backgroundColor: theme.colors.userBubble,
                    boxShadow: theme.shadows.soft,
                }, children: _jsx("p", { className: "text-sm text-gray-900 leading-relaxed", children: children }) }), timestamp && (_jsx("span", { className: "text-xs text-gray-400 px-1", children: timestamp }))] }));
}
