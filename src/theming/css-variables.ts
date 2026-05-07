/**
 * CSS Custom Properties (Variables) for Swfte Chat Widget
 * Enables runtime theming without rebuilding
 */

import type { ChatTheme } from '../types';

/**
 * CSS variable names
 */
export const CSS_VARS = {
  // Colors
  colorPrimary: '--swfte-color-primary',
  colorSecondary: '--swfte-color-secondary',
  colorBackground: '--swfte-color-background',
  colorText: '--swfte-color-text',
  colorTextMuted: '--swfte-color-text-muted',
  colorUserBubble: '--swfte-color-user-bubble',
  colorUserBubbleText: '--swfte-color-user-bubble-text',
  colorAgentBubble: '--swfte-color-agent-bubble',
  colorAgentBubbleText: '--swfte-color-agent-bubble-text',
  colorLauncherBg: '--swfte-color-launcher-bg',
  colorHeaderBg: '--swfte-color-header-bg',
  colorHeaderText: '--swfte-color-header-text',
  colorBorder: '--swfte-color-border',
  colorError: '--swfte-color-error',
  colorSuccess: '--swfte-color-success',

  // Typography
  fontFamily: '--swfte-font-family',
  fontSize: '--swfte-font-size',
  fontSizeSmall: '--swfte-font-size-small',
  fontSizeLarge: '--swfte-font-size-large',
  lineHeight: '--swfte-line-height',

  // Radius
  radiusBubble: '--swfte-radius-bubble',
  radiusSm: '--swfte-radius-sm',
  radiusMd: '--swfte-radius-md',
  radiusLg: '--swfte-radius-lg',

  // Shadows
  shadowWidget: '--swfte-shadow-widget',
  shadowSm: '--swfte-shadow-sm',
  shadowMd: '--swfte-shadow-md',
  shadowLg: '--swfte-shadow-lg',

  // Dimensions
  widgetWidth: '--swfte-widget-width',
  widgetHeight: '--swfte-widget-height',
  launcherSize: '--swfte-launcher-size',
  headerHeight: '--swfte-header-height',
  inputHeight: '--swfte-input-height',
} as const;

/**
 * Generate CSS custom properties from theme
 */
export function generateCSSVariables(theme: ChatTheme): string {
  return `
    ${CSS_VARS.colorPrimary}: ${theme.colors.primary};
    ${CSS_VARS.colorSecondary}: ${theme.colors.secondary};
    ${CSS_VARS.colorBackground}: ${theme.colors.background};
    ${CSS_VARS.colorText}: ${theme.colors.text};
    ${CSS_VARS.colorTextMuted}: ${theme.colors.textMuted};
    ${CSS_VARS.colorUserBubble}: ${theme.colors.userBubble};
    ${CSS_VARS.colorUserBubbleText}: ${theme.colors.userBubbleText};
    ${CSS_VARS.colorAgentBubble}: ${theme.colors.agentBubble};
    ${CSS_VARS.colorAgentBubbleText}: ${theme.colors.agentBubbleText};
    ${CSS_VARS.colorLauncherBg}: ${theme.colors.launcherBackground};
    ${CSS_VARS.colorHeaderBg}: ${theme.colors.headerBackground};
    ${CSS_VARS.colorHeaderText}: ${theme.colors.headerText};
    ${CSS_VARS.colorBorder}: ${theme.colors.border};
    ${CSS_VARS.colorError}: ${theme.colors.error};
    ${CSS_VARS.colorSuccess}: ${theme.colors.success};

    ${CSS_VARS.fontFamily}: ${theme.typography.fontFamily};
    ${CSS_VARS.fontSize}: ${theme.typography.fontSize};
    ${CSS_VARS.fontSizeSmall}: ${theme.typography.fontSizeSmall};
    ${CSS_VARS.fontSizeLarge}: ${theme.typography.fontSizeLarge};
    ${CSS_VARS.lineHeight}: ${theme.typography.lineHeight};

    ${CSS_VARS.radiusBubble}: ${theme.radius.bubble};
    ${CSS_VARS.radiusSm}: ${theme.radius.sm};
    ${CSS_VARS.radiusMd}: ${theme.radius.md};
    ${CSS_VARS.radiusLg}: ${theme.radius.lg};

    ${CSS_VARS.shadowWidget}: ${theme.shadows.widget};
    ${CSS_VARS.shadowSm}: ${theme.shadows.sm};
    ${CSS_VARS.shadowMd}: ${theme.shadows.md};
    ${CSS_VARS.shadowLg}: ${theme.shadows.lg};

    ${CSS_VARS.widgetWidth}: ${theme.dimensions.widgetWidth};
    ${CSS_VARS.widgetHeight}: ${theme.dimensions.widgetHeight};
    ${CSS_VARS.launcherSize}: ${theme.dimensions.launcherSize};
    ${CSS_VARS.headerHeight}: ${theme.dimensions.headerHeight};
    ${CSS_VARS.inputHeight}: ${theme.dimensions.inputHeight};
  `.trim();
}

/**
 * Apply theme to an element
 */
export function applyThemeToElement(element: HTMLElement, theme: ChatTheme): void {
  const cssVars = generateCSSVariables(theme);
  element.style.cssText += cssVars;
}

/**
 * Base CSS styles for the widget
 */
export const BASE_STYLES = `
  /* Reset & Base */
  .swfte-widget * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .swfte-widget {
    font-family: var(${CSS_VARS.fontFamily});
    font-size: var(${CSS_VARS.fontSize});
    line-height: var(${CSS_VARS.lineHeight});
    color: var(${CSS_VARS.colorText});
  }

  /* Container */
  .swfte-widget-container {
    position: fixed;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .swfte-widget-container.bottom-right {
    bottom: 20px;
    right: 20px;
  }

  .swfte-widget-container.bottom-left {
    bottom: 20px;
    left: 20px;
    align-items: flex-start;
  }

  /* Launcher */
  .swfte-launcher {
    width: var(${CSS_VARS.launcherSize});
    height: var(${CSS_VARS.launcherSize});
    border-radius: 50%;
    background: var(${CSS_VARS.colorLauncherBg});
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(${CSS_VARS.shadowMd});
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .swfte-launcher:hover {
    transform: scale(1.05);
    box-shadow: var(${CSS_VARS.shadowLg});
  }

  .swfte-launcher svg {
    width: 28px;
    height: 28px;
    fill: white;
  }

  .swfte-launcher-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    background: var(${CSS_VARS.colorError});
    color: white;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
  }

  /* Chat Window */
  .swfte-chat-window {
    width: var(${CSS_VARS.widgetWidth});
    height: var(${CSS_VARS.widgetHeight});
    max-height: calc(100vh - 100px);
    background: var(${CSS_VARS.colorBackground});
    border-radius: var(${CSS_VARS.radiusLg});
    box-shadow: var(${CSS_VARS.shadowWidget});
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 16px;
    animation: swfte-slide-up 0.3s ease;
  }

  @keyframes swfte-slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Header */
  .swfte-header {
    height: var(${CSS_VARS.headerHeight});
    background: var(${CSS_VARS.colorHeaderBg});
    color: var(${CSS_VARS.colorHeaderText});
    display: flex;
    align-items: center;
    padding: 0 16px;
    flex-shrink: 0;
  }

  .swfte-header-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .swfte-header-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .swfte-header-info {
    flex: 1;
  }

  .swfte-header-name {
    font-weight: 600;
    font-size: var(${CSS_VARS.fontSizeLarge});
  }

  .swfte-header-status {
    font-size: var(${CSS_VARS.fontSizeSmall});
    opacity: 0.8;
  }

  .swfte-header-close {
    background: none;
    border: none;
    color: var(${CSS_VARS.colorHeaderText});
    cursor: pointer;
    padding: 8px;
    border-radius: var(${CSS_VARS.radiusSm});
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .swfte-header-close:hover {
    opacity: 1;
    background: rgba(255,255,255,0.1);
  }

  /* Messages */
  .swfte-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .swfte-message {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: var(${CSS_VARS.radiusBubble});
    word-wrap: break-word;
  }

  .swfte-message.user {
    align-self: flex-end;
    background: var(${CSS_VARS.colorUserBubble});
    color: var(${CSS_VARS.colorUserBubbleText});
    border-bottom-right-radius: 4px;
  }

  .swfte-message.agent {
    align-self: flex-start;
    background: var(${CSS_VARS.colorAgentBubble});
    color: var(${CSS_VARS.colorAgentBubbleText});
    border-bottom-left-radius: 4px;
  }

  .swfte-message-time {
    font-size: 10px;
    opacity: 0.6;
    margin-top: 4px;
  }

  /* Typing Indicator */
  .swfte-typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    background: var(${CSS_VARS.colorAgentBubble});
    border-radius: var(${CSS_VARS.radiusBubble});
    width: fit-content;
  }

  .swfte-typing-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(${CSS_VARS.colorTextMuted});
    animation: swfte-typing-bounce 1.4s infinite;
  }

  .swfte-typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .swfte-typing-dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes swfte-typing-bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-4px); }
  }

  /* Input */
  .swfte-input-container {
    height: var(${CSS_VARS.inputHeight});
    border-top: 1px solid var(${CSS_VARS.colorBorder});
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
    flex-shrink: 0;
  }

  .swfte-input {
    flex: 1;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: var(${CSS_VARS.fontSize});
    background: transparent;
    color: var(${CSS_VARS.colorText});
  }

  .swfte-input::placeholder {
    color: var(${CSS_VARS.colorTextMuted});
  }

  .swfte-send-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(${CSS_VARS.colorPrimary});
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
  }

  .swfte-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .swfte-send-btn svg {
    width: 18px;
    height: 18px;
    fill: white;
  }

  /* Powered By */
  .swfte-powered-by {
    text-align: center;
    padding: 8px;
    font-size: 11px;
    color: var(${CSS_VARS.colorTextMuted});
    border-top: 1px solid var(${CSS_VARS.colorBorder});
  }

  .swfte-powered-by a {
    color: var(${CSS_VARS.colorPrimary});
    text-decoration: none;
  }

  /* Scrollbar */
  .swfte-messages::-webkit-scrollbar {
    width: 6px;
  }

  .swfte-messages::-webkit-scrollbar-track {
    background: transparent;
  }

  .swfte-messages::-webkit-scrollbar-thumb {
    background: var(${CSS_VARS.colorBorder});
    border-radius: 3px;
  }
`;

/**
 * Inject base styles into document
 */
export function injectBaseStyles(): void {
  if (typeof document === 'undefined') return;

  const styleId = 'swfte-chat-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = BASE_STYLES;
  document.head.appendChild(style);
}
