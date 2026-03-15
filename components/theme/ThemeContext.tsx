import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  
  // Secondary colors
  secondary: string;
  secondaryDark: string;
  
  // Status colors
  success: string;
  successDark: string;
  warning: string;
  error: string;
  info: string;
  
  // UI colors
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgOverlay: string;
  
  // Border colors
  borderDefault: string;
  borderHover: string;
  borderActive: string;
  
  // Shadow colors
  shadowPrimary: string;
  shadowSecondary: string;
  shadowSuccess: string;
  shadowWarning: string;
  shadowError: string;
  
  // Game-specific colors
  tileBase: string;
  tileMoveReachable: string;
  tileAttackReachable: string;
  tileSelected: string;
  tileHover: string;
  tileBlocked: string;
  tileBuilding: string;
  
  // Status effect colors
  poison: string;
  armor: string;
  guard: string;
  aim: string;
  dash: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
}

export const themes: { [key: string]: Theme } = {
  default: {
    name: 'Default',
    colors: {
      // Primary colors
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      
      // Secondary colors
      secondary: '#8aa0ff',
      secondaryDark: '#a78bfa',
      
      // Status colors
      success: '#10b981',
      successDark: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // UI colors
      textPrimary: '#e6eef8',
      textSecondary: '#94a3b8',
      textDisabled: '#6b7280',
      
      // Background colors
      bgPrimary: '#0f172a',
      bgSecondary: '#1a1a2e',
      bgTertiary: '#16213e',
      bgOverlay: 'rgba(15, 23, 42, 0.8)',
      
      // Border colors
      borderDefault: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.4)',
      borderActive: 'rgba(255, 255, 255, 0.2)',
      
      // Shadow colors
      shadowPrimary: 'rgba(59, 130, 246, 0.3)',
      shadowSecondary: 'rgba(138, 166, 255, 0.3)',
      shadowSuccess: 'rgba(16, 185, 129, 0.3)',
      shadowWarning: 'rgba(245, 158, 11, 0.3)',
      shadowError: 'rgba(239, 68, 68, 0.3)',
      
      // Game-specific colors
      tileBase: '#3b82f6',
      tileMoveReachable: '#60a5fa',
      tileAttackReachable: '#f87171',
      tileSelected: '#f59e0b',
      tileHover: '#f97316',
      tileBlocked: '#0b2f68',
      tileBuilding: '#0b2f68',
      
      // Status effect colors
      poison: '#22c55e',
      armor: '#94a3b8',
      guard: '#ffffff',
      aim: '#3b82f6',
      dash: '#ffffff',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      // Primary colors
      primary: '#60a5fa',
      primaryHover: '#3b82f6',
      
      // Secondary colors
      secondary: '#a78bfa',
      secondaryDark: '#8aa0ff',
      
      // Status colors
      success: '#22c55e',
      successDark: '#10b981',
      warning: '#fbbf24',
      error: '#ef4444',
      info: '#60a5fa',
      
      // UI colors
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textDisabled: '#94a3b8',
      
      // Background colors
      bgPrimary: '#0b1220',
      bgSecondary: '#0f172a',
      bgTertiary: '#111827',
      bgOverlay: 'rgba(11, 18, 32, 0.8)',
      
      // Border colors
      borderDefault: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.4)',
      borderActive: 'rgba(255, 255, 255, 0.2)',
      
      // Shadow colors
      shadowPrimary: 'rgba(96, 165, 250, 0.3)',
      shadowSecondary: 'rgba(167, 139, 250, 0.3)',
      shadowSuccess: 'rgba(34, 197, 94, 0.3)',
      shadowWarning: 'rgba(251, 191, 36, 0.3)',
      shadowError: 'rgba(239, 68, 68, 0.3)',
      
      // Game-specific colors
      tileBase: '#60a5fa',
      tileMoveReachable: '#93c5fd',
      tileAttackReachable: '#fca5a5',
      tileSelected: '#fbbf24',
      tileHover: '#f59e0b',
      tileBlocked: '#0f172a',
      tileBuilding: '#0f172a',
      
      // Status effect colors
      poison: '#10b981',
      armor: '#cbd5e1',
      guard: '#ffffff',
      aim: '#60a5fa',
      dash: '#ffffff',
    },
  },
  cyberpunk: {
    name: 'Cyberpunk',
    colors: {
      // Primary colors
      primary: '#00ff88',
      primaryHover: '#00cc66',
      
      // Secondary colors
      secondary: '#ff00ff',
      secondaryDark: '#cc00cc',
      
      // Status colors
      success: '#00ff88',
      successDark: '#00cc66',
      warning: '#ffff00',
      error: '#ff0044',
      info: '#00ff88',
      
      // UI colors
      textPrimary: '#ffffff',
      textSecondary: '#c0c0c0',
      textDisabled: '#666666',
      
      // Background colors
      bgPrimary: '#050505',
      bgSecondary: '#0a0a0a',
      bgTertiary: '#101010',
      bgOverlay: 'rgba(5, 5, 5, 0.8)',
      
      // Border colors
      borderDefault: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.4)',
      borderActive: 'rgba(255, 255, 255, 0.2)',
      
      // Shadow colors
      shadowPrimary: 'rgba(0, 255, 136, 0.3)',
      shadowSecondary: 'rgba(255, 0, 255, 0.3)',
      shadowSuccess: 'rgba(0, 255, 136, 0.3)',
      shadowWarning: 'rgba(255, 255, 0, 0.3)',
      shadowError: 'rgba(255, 0, 68, 0.3)',
      
      // Game-specific colors
      tileBase: '#00ff88',
      tileMoveReachable: '#33ffaa',
      tileAttackReachable: '#ff3366',
      tileSelected: '#ffff00',
      tileHover: '#ffcc00',
      tileBlocked: '#1a1a1a',
      tileBuilding: '#1a1a1a',
      
      // Status effect colors
      poison: '#00cc66',
      armor: '#c0c0c0',
      guard: '#ffffff',
      aim: '#00ff88',
      dash: '#ffffff',
    },
  },
  pastel: {
    name: 'Pastel',
    colors: {
      // Primary colors
      primary: '#7aa2ff',
      primaryHover: '#5d8cff',
      
      // Secondary colors
      secondary: '#b394ff',
      secondaryDark: '#9a7cff',
      
      // Status colors
      success: '#77dd77',
      successDark: '#5dbf5d',
      warning: '#ffd166',
      error: '#ff6b6b',
      info: '#7aa2ff',
      
      // UI colors
      textPrimary: '#2c3e50',
      textSecondary: '#7f8c8d',
      textDisabled: '#bdc3c7',
      
      // Background colors
      bgPrimary: '#f8f9fa',
      bgSecondary: '#e9ecef',
      bgTertiary: '#dee2e6',
      bgOverlay: 'rgba(248, 249, 250, 0.8)',
      
      // Border colors
      borderDefault: 'rgba(0, 0, 0, 0.1)',
      borderHover: 'rgba(0, 0, 0, 0.2)',
      borderActive: 'rgba(0, 0, 0, 0.15)',
      
      // Shadow colors
      shadowPrimary: 'rgba(122, 162, 255, 0.3)',
      shadowSecondary: 'rgba(179, 148, 255, 0.3)',
      shadowSuccess: 'rgba(119, 221, 119, 0.3)',
      shadowWarning: 'rgba(255, 209, 102, 0.3)',
      shadowError: 'rgba(255, 107, 107, 0.3)',
      
      // Game-specific colors
      tileBase: '#7aa2ff',
      tileMoveReachable: '#a3b7ff',
      tileAttackReachable: '#ff9999',
      tileSelected: '#ffd166',
      tileHover: '#ffc84d',
      tileBlocked: '#b8c1cc',
      tileBuilding: '#b8c1cc',
      
      // Status effect colors
      poison: '#5dbf5d',
      armor: '#7f8c8d',
      guard: '#2c3e50',
      aim: '#7aa2ff',
      dash: '#2c3e50',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeName: string) => void;
  themeNames: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'default';
    }
    return 'default';
  });

  const theme = themes[themeName] || themes.default;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', themeName);
      applyTheme(theme);
    }
  }, [theme, themeName]);

  const setTheme = (newThemeName: string) => {
    setThemeName(newThemeName);
  };

  const themeNames = Object.keys(themes);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeNames }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  // Apply all theme colors as CSS custom properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}