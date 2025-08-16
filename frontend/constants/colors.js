// Color Constants for DriveSmart App
export const COLORS = {
  // Primary Brand Colors
  primary: '#0a2540',
  primaryLight: '#1a3a52', 
  accent: '#f5c518',
  accentDark: '#d4a017',
  
  // UI Colors
  background: '#0a2540',
  surface: '#1a3a52',
  card: '#142a4c',
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: '#a8b8c8',
  textAccent: '#f5c518',
  textSuccess: '#4CAF50',
  textError: '#F44336',
  textWarning: '#FF9800',
  
  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Quiz Colors
  correct: '#4CAF50',
  incorrect: '#F44336',
  selected: '#2196F3',
  unselected: '#424242',
  
  // State Colors
  washington: '#00563B',
  california: '#FFB300',
  
  // Chat Colors
  userMessage: '#2196F3',
  aiMessage: '#1a3a52',
  ragEnhanced: '#4CAF50',
  fallback: '#FF9800',
  
  // Progress Colors
  progressLow: '#F44336',
  progressMid: '#FF9800', 
  progressHigh: '#4CAF50',
  
  // Utility Colors
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  border: '#424242',
  divider: '#2a2a2a'
};

// Color Schemes
export const COLOR_SCHEMES = {
  dark: {
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.textPrimary,
    accent: COLORS.accent
  },
  washington: {
    primary: COLORS.washington,
    accent: COLORS.accent,
    background: '#003d2b'
  },
  california: {
    primary: COLORS.california,
    accent: '#1976D2',
    background: '#e65100'
  }
};
