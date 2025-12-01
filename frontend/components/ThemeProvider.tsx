"use client";
import { createContext, useContext, useEffect, useState } from "react";

// YAARALABS Brand Colors
export const BRAND = {
  black: '#010101',
  magenta: '#B90ABD',
  lightGray: '#D6D9D8',
  purple: '#5332FF',
  white: '#FFFFFF',
  gray: '#939394',
};

// Theme definitions
export const themes = {
  light: {
    name: 'light',
    background: BRAND.white,
    backgroundSecondary: `${BRAND.lightGray}40`,
    foreground: BRAND.black,
    foregroundSecondary: BRAND.gray,
    accent: BRAND.magenta,
    accentSecondary: BRAND.purple,
    border: BRAND.lightGray,
    card: BRAND.white,
    headerBg: BRAND.black,
    headerText: BRAND.white,
    headerTextSecondary: BRAND.gray,
  },
  dark: {
    name: 'dark',
    background: BRAND.black,
    backgroundSecondary: '#1a1a1a',
    foreground: BRAND.white,
    foregroundSecondary: BRAND.gray,
    accent: BRAND.magenta,
    accentSecondary: BRAND.purple,
    border: '#2a2a2a',
    card: '#111111',
    headerBg: BRAND.black,
    headerText: BRAND.white,
    headerTextSecondary: BRAND.gray,
  },
};

type Theme = typeof themes.light;
type ThemeName = keyof typeof themes;

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('yaaralabs-theme') as ThemeName | null;
    if (savedTheme && themes[savedTheme]) {
      setThemeName(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeName('dark');
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('yaaralabs-theme', themeName);
      // Update CSS variables
      const root = document.documentElement;
      const theme = themes[themeName];
      root.style.setProperty('--background', theme.background);
      root.style.setProperty('--background-secondary', theme.backgroundSecondary);
      root.style.setProperty('--foreground', theme.foreground);
      root.style.setProperty('--foreground-secondary', theme.foregroundSecondary);
      root.style.setProperty('--accent', theme.accent);
      root.style.setProperty('--accent-secondary', theme.accentSecondary);
      root.style.setProperty('--border', theme.border);
      root.style.setProperty('--card', theme.card);
      
      // Update body class for Tailwind dark mode
      if (themeName === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
    }
  }, [themeName, mounted]);

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
  };

  const toggleTheme = () => {
    setThemeName(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme: themes[themeName],
    themeName,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {/* Prevent flash of wrong theme by hiding until mounted */}
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// Default theme for SSR and when ThemeProvider is not available
const defaultThemeContext: ThemeContextType = {
  theme: themes.light,
  themeName: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
};

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return default context during SSR or when provider is not available
  if (context === undefined) {
    return defaultThemeContext;
  }
  return context;
}

