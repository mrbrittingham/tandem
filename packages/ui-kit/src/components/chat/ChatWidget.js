import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { UserBubble } from "./user-bubble";
import { AgentBubble } from "./agent-bubble";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { ChatHeader } from "./chat-header";
import { useTheme } from "../../lib/theme-context";
export function ChatWidget({ headerVariant = "with-image" }) {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: "1",
            type: "agent",
            content: `Welcome to ${theme.branding.brandName}! How can I help you today?`,
            timestamp: "10:32 AM",
        },
        {
            id: "2",
            type: "user",
            content: "Do you have any reservations available for this Saturday evening?",
            timestamp: "10:33 AM",
        },
        {
            id: "3",
            type: "agent",
            content: "Yes! We have several tables available this Saturday evening. Would you like to book a table for dinner at our Farm Kitchen?",
            timestamp: "10:33 AM",
            ctaText: "Book a Table",
        },
        {
            id: "4",
            type: "user",
            content: "That sounds great! What time slots do you have?",
            timestamp: "10:34 AM",
        },
        {
            id: "5",
            type: "agent",
            content: "We have availability at 5:30 PM, 7:00 PM, and 8:30 PM. Our Farm Kitchen offers a seasonal menu featuring ingredients from our own vineyard and farm. Which time works best for you?",
            timestamp: "10:34 AM",
        },
    ]);
    const [showTyping, setShowTyping] = useState(false);
    const handleSend = (message) => {
        const newMessage = {
            id: Date.now().toString(),
            type: "user",
            content: message,
            timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            }),
        };
        setMessages((prev) => [...prev, newMessage]);
        setShowTyping(true);
        // Simulate agent reply
        setTimeout(() => {
            setShowTyping(false);
            const agentReply = {
                id: (Date.now() + 1).toString(),
                type: "agent",
                content: "Thanks! Let me check availability for you...",
                timestamp: new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                }),
            };
            setMessages((prev) => [...prev, agentReply]);
        }, 2000);
    };
    return (_jsxs(_Fragment, { children: [!isOpen && (_jsx("button", { type: "button", onClick: () => setIsOpen(true), style: {
                    backgroundColor: "#ffffff",
                    borderRadius: "9999px",
                    padding: "8px",
                    boxShadow: "0 0 8px rgba(0,0,0,0.4)",
                    cursor: "pointer",
                }, className: "flex items-center justify-center", children: _jsx("span", { className: "text-gray-800 text-xl leading-none", children: "\uD83D\uDCAC" }) })), isOpen && (_jsxs("div", { className: "w-[400px] bg-white flex flex-col overflow-hidden", style: {
                    borderRadius: "var(--tandem-widget-radius)",
                    height: "650px",
                    boxShadow: theme.shadows.deep,
                }, children: [_jsx(ChatHeader, { variant: headerVariant, onClose: () => setIsOpen(false) }), _jsxs("div", { className: "flex-1 overflow-y-auto p-4", style: { backgroundColor: theme.colors.background }, children: [messages.map((message) => message.type === "user" ? (_jsx(UserBubble, { timestamp: message.timestamp, children: message.content }, message.id)) : (_jsx(AgentBubble, { timestamp: message.timestamp, ctaText: message.ctaText, children: message.content }, message.id))), showTyping && _jsx(TypingIndicator, {})] }), _jsx(ChatInput, { onSend: handleSend }), _jsx("div", { className: "bg-white border-t border-gray-100 py-2 px-4 text-center", children: _jsx("span", { className: "text-xs tracking-wider", style: {
                                fontFamily: "'Lilita One', cursive",
                                color: theme.colors.secondary,
                                opacity: 0.6,
                            }, children: "POWERED BY TANDEM" }) })] }))] }));
}
