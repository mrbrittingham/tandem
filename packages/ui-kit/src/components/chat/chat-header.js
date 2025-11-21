import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from "lucide-react";
import { ChatMenu } from "./chat-menu";
import { useTheme } from "../../lib/theme-context";
import { ImageWithFallback } from "../figma/ImageWithFallback";
export function ChatHeader({ variant = "with-image", onClose }) {
    const { theme } = useTheme();
    // Variant: Header with Hero Image + Flower Logo
    if (variant === "with-image") {
        return (_jsxs("div", { className: "relative", children: [theme.branding.heroImage ? (_jsxs("div", { className: "h-32 overflow-hidden", children: [_jsx(ImageWithFallback, { src: `/assets/hero/${theme.branding.heroImage}`, alt: theme.branding.brandName, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0", style: {
                                background: `linear-gradient(to bottom, transparent, ${theme.colors.secondary}40)`,
                            } })] })) : (_jsx("div", { className: "h-32", style: {
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    } })), _jsxs("div", { className: "absolute top-0 left-0 right-0 flex items-start justify-between p-4", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1", children: [theme.branding.flowerLogo && (_jsx(ImageWithFallback, { src: `/assets/logos/${theme.branding.flowerLogo}`, alt: `${theme.branding.brandName} logo`, className: "w-10 h-10 object-contain flex-shrink-0" })), _jsx("h3", { className: "text-white text-xl drop-shadow-lg", style: { fontFamily: "'Lilita One', cursive" }, children: theme.branding.chatTitle })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChatMenu, {}), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-full hover:bg-white/20 transition-colors", children: _jsx(X, { className: "w-5 h-5 text-white" }) })] })] })] }));
    }
    // Variant: Text Logo Only
    if (variant === "text-logo") {
        return (_jsx("div", { className: "relative p-4", style: {
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center gap-3 flex-1", children: theme.branding.textLogo ? (_jsx(ImageWithFallback, { src: `/assets/logos/${theme.branding.textLogo}`, alt: theme.branding.brandName, className: "h-10 object-contain" })) : (_jsx("h3", { className: "text-white text-xl", style: { fontFamily: "'Lilita One', cursive" }, children: theme.branding.chatTitle })) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChatMenu, {}), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-full hover:bg-white/20 transition-colors", children: _jsx(X, { className: "w-5 h-5 text-white" }) })] })] }) }));
    }
    // Variant: Minimal Theme-Only
    return (_jsx("div", { className: "p-4", style: { backgroundColor: theme.colors.primary }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-white text-xl flex-1", style: { fontFamily: "'Lilita One', cursive" }, children: theme.branding.chatTitle }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChatMenu, {}), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-full hover:bg-white/20 transition-colors", children: _jsx(X, { className: "w-5 h-5 text-white" }) })] })] }) }));
}
