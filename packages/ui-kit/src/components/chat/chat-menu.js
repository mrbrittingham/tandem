import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { MoreVertical, BellOff, MessageSquareX, Minimize2, Volume2, VolumeX, } from "lucide-react";
export function ChatMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const menuItems = [
        {
            icon: BellOff,
            label: "Turn off notifications",
            action: () => console.log("Notifications off"),
        },
        {
            icon: MessageSquareX,
            label: "Clear conversation",
            action: () => console.log("Clear conversation"),
        },
        {
            icon: Minimize2,
            label: "Minimize widget",
            action: () => console.log("Minimize widget"),
        },
        {
            icon: soundEnabled ? VolumeX : Volume2,
            label: soundEnabled ? "Turn off sounds" : "Turn on sounds",
            action: () => setSoundEnabled(!soundEnabled),
        },
    ];
    return (_jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setIsOpen(!isOpen), className: "p-1.5 rounded-full hover:bg-white/20 transition-colors", children: _jsx(MoreVertical, { className: "w-5 h-5 text-white" }) }), isOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setIsOpen(false) }), _jsx("div", { className: "absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg z-20 overflow-hidden", style: { boxShadow: "var(--tandem-shadow-deep)" }, children: menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (_jsxs("button", { onClick: () => {
                                    item.action();
                                    setIsOpen(false);
                                }, className: "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left", children: [_jsx(Icon, { className: "w-4 h-4 text-gray-600" }), _jsx("span", { className: "text-sm text-gray-800", children: item.label })] }, index));
                        }) })] }))] }));
}
