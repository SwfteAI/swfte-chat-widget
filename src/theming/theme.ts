/**
 * Theme System for Swfte Chat Widget
 */

import type { ChatTheme, ThemeColors, ThemeTypography, ThemeRadius, ThemeShadows, ThemeDimensions, WidgetConfig } from '../types';

/**
 * Default theme configuration
 */
export const defaultTheme: ChatTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    userBubble: '#3b82f6',
    userBubbleText: '#ffffff',
    agentBubble: '#f1f5f9',
    agentBubbleText: '#0f172a',
    launcherBackground: '#3b82f6',
    headerBackground: '#3b82f6',
    headerText: '#ffffff',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#22c55e',
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: '14px',
    fontSizeSmall: '12px',
    fontSizeLarge: '16px',
    lineHeight: '1.5',
  },
  radius: {
    bubble: '1.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '1rem',
  },
  shadows: {
    widget: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  dimensions: {
    widgetWidth: '380px',
    widgetHeight: '600px',
    launcherSize: '60px',
    headerHeight: '64px',
    inputHeight: '56px',
  },
};

/**
 * Dark theme preset
 */
export const darkTheme: ChatTheme = {
  ...defaultTheme,
  colors: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    background: '#1e293b',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    userBubble: '#3b82f6',
    userBubbleText: '#ffffff',
    agentBubble: '#334155',
    agentBubbleText: '#f1f5f9',
    launcherBackground: '#3b82f6',
    headerBackground: '#0f172a',
    headerText: '#f1f5f9',
    border: '#334155',
    error: '#f87171',
    success: '#4ade80',
  },
};

/**
 * Minimal theme preset
 */
export const minimalTheme: ChatTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    primary: '#000000',
    userBubble: '#000000',
    launcherBackground: '#000000',
    headerBackground: '#000000',
  },
  radius: {
    bubble: '0.5rem',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
  },
};

/**
 * Theme presets
 */
export const themePresets = {
  default: defaultTheme,
  dark: darkTheme,
  minimal: minimalTheme,
} as const;

export type ThemePreset = keyof typeof themePresets;

/**
 * Create theme from widget config
 */
export function createThemeFromConfig(config: WidgetConfig): ChatTheme {
  return {
    colors: {
      primary: config.primaryColor || defaultTheme.colors.primary,
      secondary: config.secondaryColor || defaultTheme.colors.secondary,
      background: config.backgroundColor || defaultTheme.colors.background,
      text: config.textColor || defaultTheme.colors.text,
      textMuted: defaultTheme.colors.textMuted,
      userBubble: config.userBubbleColor || defaultTheme.colors.userBubble,
      userBubbleText: config.userBubbleTextColor || defaultTheme.colors.userBubbleText,
      agentBubble: config.agentBubbleColor || defaultTheme.colors.agentBubble,
      agentBubbleText: config.agentBubbleTextColor || defaultTheme.colors.agentBubbleText,
      launcherBackground: config.primaryColor || defaultTheme.colors.launcherBackground,
      headerBackground: config.headerBackground || defaultTheme.colors.headerBackground,
      headerText: config.headerTextColor || defaultTheme.colors.headerText,
      border: defaultTheme.colors.border,
      error: defaultTheme.colors.error,
      success: defaultTheme.colors.success,
    },
    typography: {
      fontFamily: config.fontFamily || defaultTheme.typography.fontFamily,
      fontSize: defaultTheme.typography.fontSize,
      fontSizeSmall: defaultTheme.typography.fontSizeSmall,
      fontSizeLarge: defaultTheme.typography.fontSizeLarge,
      lineHeight: defaultTheme.typography.lineHeight,
    },
    radius: {
      bubble: config.borderRadius || defaultTheme.radius.bubble,
      sm: defaultTheme.radius.sm,
      md: defaultTheme.radius.md,
      lg: defaultTheme.radius.lg,
    },
    shadows: defaultTheme.shadows,
    dimensions: {
      widgetWidth: config.widgetWidth || defaultTheme.dimensions.widgetWidth,
      widgetHeight: config.widgetHeight || defaultTheme.dimensions.widgetHeight,
      launcherSize: config.launcherSize || defaultTheme.dimensions.launcherSize,
      headerHeight: defaultTheme.dimensions.headerHeight,
      inputHeight: defaultTheme.dimensions.inputHeight,
    },
  };
}

/**
 * Merge themes (deep merge)
 */
export function mergeThemes(base: ChatTheme, overrides: Partial<ChatTheme>): ChatTheme {
  return {
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    radius: { ...base.radius, ...overrides.radius },
    shadows: { ...base.shadows, ...overrides.shadows },
    dimensions: { ...base.dimensions, ...overrides.dimensions },
  };
}
