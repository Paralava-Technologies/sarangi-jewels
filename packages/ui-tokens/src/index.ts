/** Sarangi Jewels brand design tokens — reference design theme */
export const colors = {
  brand: {
    primary: '#6B2230',       // oxblood
    primaryDark: '#211D19',   // ink
    accent: '#B89B6E',        // champagne
    accentLight: '#F6F1E8',   // cream
    accentGold: '#B89B6E',
  },
  neutral: {
    bone: '#E9E3D8',
    stone: '#DCD3C2',
    ink: '#211D19',
    oxblood: '#6B2230',
    champagne: '#B89B6E',
    cream: '#F6F1E8',
    50: '#F6F1E8',
    100: '#DCD3C2',
    200: '#E9E3D8',
    300: '#D1C8B7',
    400: '#A39988',
    500: '#7A7263',
    600: '#5C5446',
    700: '#3D3528',
    800: '#211D19',
    900: '#000000',
  },
  semantic: {
    success: '#16a34a',
    error: '#6B2230',
    warning: '#B89B6E',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  fontFamily: {
    sans: 'Public Sans, system-ui, sans-serif',
    serif: 'Libre Caslon Text, Georgia, serif',
    display: 'Libre Caslon Display, serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
} as const;
