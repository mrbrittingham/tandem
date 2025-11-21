import React, { createContext, useContext, useState, ReactNode } from "react";
import { windmillCreekTheme } from "./themes/windmill-creek";

export type Theme = typeof windmillCreekTheme;

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
	theme?: Theme;
	children: ReactNode;
}

export function ThemeProvider({ theme: initialTheme = windmillCreekTheme, children }: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(initialTheme);
	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): { theme: Theme } {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return { theme: ctx.theme };
}

export { windmillCreekTheme };
