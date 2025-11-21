import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { windmillCreekTheme } from "./themes/windmill-creek";
const ThemeContext = createContext(undefined);
export function ThemeProvider({ theme: initialTheme = windmillCreekTheme, children }) {
    const [theme, setTheme] = useState(initialTheme);
    return _jsx(ThemeContext.Provider, { value: { theme, setTheme }, children: children });
}
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return { theme: ctx.theme };
}
export { windmillCreekTheme };
