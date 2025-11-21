import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Mic, Send } from "lucide-react";
import { useTheme } from "../../lib/theme-context";
export function ChatInput({ onSend, placeholder = "Type a message..." }) {
    const { theme } = useTheme();
    const [message, setMessage] = useState("");
    const handleSend = () => {
        if (message.trim() && onSend) {
            onSend(message);
            setMessage("");
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    return (_jsx("div", { className: "border-t p-4", style: {
            borderColor: theme.colors.surface,
            backgroundColor: theme.colors.surface,
        }, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex-1 flex items-center gap-2 px-4 py-2.5", style: {
                    backgroundColor: theme.colors.background,
                    borderRadius: theme.radii.bubble,
                }, children: [_jsx("input", { type: "text", value: message, onChange: (e) => setMessage(e.target.value), onKeyPress: handleKeyPress, placeholder: placeholder, className: "flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400", style: {
                        color: theme.colors.primary,
                    } }), _jsx("button", { className: "transition-colors", style: {
                        color: theme.colors.highlight,
                    }, children: _jsx(Mic, { className: "w-5 h-5" }) })] }), _jsx("button", { onClick: handleSend, className: "w-10 h-10 flex items-center justify-center hover:shadow-md transition-all", style: {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.button,
                    boxShadow: theme.shadows.rich,
                }, children: _jsx(Send, { className: "w-5 h-5", style: { color: theme.icons.sendArrow } }) })] }) }));
}
