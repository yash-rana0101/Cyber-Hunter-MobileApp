/**
 * Cyber Hunter Color System
 * Dark-themed cyberpunk aesthetic with cyan accents and neon effects
 */

// Primary Brand Colors
const brandPrimary = '#00D8FF'; // Cyan/Electric Blue
const greenBlack = '#000000'; // Pure Black
const whiteText = '#ffffff'; // White
const neutralGrey = '#7E8589'; // Neutral Grey

// Cyan Variations
const cyanLight = '#22d3ee';
const cyanMedium = '#06b6d4';
const cyanDark = '#0891b2';

// Status Colors
const success = '#06db62';
const successDark = '#10b981';
const warning = '#f59e0b';
const warningDark = '#d97706';
const error = '#ef4444';
const errorDark = '#dc2626';
const info = '#3b82f6';
const infoDark = '#2563eb';

// Additional Accent Colors
const purple = '#8b5cf6';
const purpleDark = '#7c3aed';
const orange = '#f97316';
const orangeDark = '#ea580c';

// Glass Morphism and Overlay Colors
const glassBg = 'rgba(0, 216, 255, 0.1)';
const overlayBg = 'rgba(0, 0, 0, 0.8)';
const cardBg = 'rgba(255, 255, 255, 0.05)';

export const Colors = {
  // Main color scheme (dark theme focused)
  primary: brandPrimary,
  background: greenBlack,
  surface: '#111111',
  text: whiteText,
  textSecondary: neutralGrey,
  
  // Brand colors
  brand: {
    primary: brandPrimary,
    secondary: cyanMedium,
    accent: cyanLight,
  },
  
  // Status colors
  status: {
    success,
    successDark,
    warning,
    warningDark,
    error,
    errorDark,
    info,
    infoDark,
  },
  
  // Accent colors
  accent: {
    purple,
    purpleDark,
    orange,
    orangeDark,
    cyan: cyanLight,
    cyanMedium,
    cyanDark,
  },
  
  // Glass morphism and effects
  glass: {
    background: glassBg,
    overlay: overlayBg,
    card: cardBg,
    border: 'rgba(0, 216, 255, 0.2)',
  },
  
  // Tab navigation
  tab: {
    active: brandPrimary,
    inactive: neutralGrey,
    background: greenBlack,
    border: 'rgba(0, 216, 255, 0.3)',
  },
  
  // Legacy support for existing components
  light: {
    text: '#11181C',
    background: '#fff',
    tint: brandPrimary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: brandPrimary,
  },
  dark: {
    text: whiteText,
    background: greenBlack,
    tint: brandPrimary,
    icon: neutralGrey,
    tabIconDefault: neutralGrey,
    tabIconSelected: brandPrimary,
  },
};
