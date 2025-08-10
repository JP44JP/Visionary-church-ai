/**
 * VisionaryChurch.ai Design Tokens
 * 
 * Programmatic access to brand design tokens for use in JavaScript/TypeScript.
 * These tokens should match the CSS custom properties in brand-tokens.css.
 * 
 * Usage:
 * import { brandTokens } from '@/lib/design-tokens'
 * const primaryColor = brandTokens.colors.primary[500]
 */

export const brandTokens = {
  // ==========================================
  // BRAND COLORS
  // ==========================================
  colors: {
    // Primary Brand - Celestial Blue
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',  // Main brand color
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554'
    },
    
    // Secondary Brand - Sacred Purple
    secondary: {
      50: '#FAF5FF',
      100: '#F3E8FF',
      200: '#E9D5FF',
      300: '#D8B4FE',
      400: '#C084FC',
      500: '#A855F7',
      600: '#9333EA',  // Main secondary color
      700: '#7C3AED',
      800: '#6B21A8',
      900: '#581C87',
      950: '#3B0764'
    },
    
    // Accent - Divine Gold
    accent: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',  // Main accent color
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03'
    },
    
    // Supporting - Peaceful Teal
    supporting: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',  // Main supporting color
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
      950: '#042F2E'
    },
    
    // Semantic Colors
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    },
    
    // Church Context Colors
    church: {
      worship: '#9333EA',    // Sacred Purple
      community: '#0D9488',  // Peaceful Teal
      growth: '#D97706',     // Divine Gold
      welcome: '#2563EB'     // Celestial Blue
    },
    
    // Grayscale
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#030712'
    }
  },

  // ==========================================
  // TYPOGRAPHY
  // ==========================================
  typography: {
    fontFamily: {
      brand: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      serif: ['Crimson Text', 'Georgia', 'Times New Roman', 'serif']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }]
    },
    
    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },
    
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  // ==========================================
  // SPACING & LAYOUT
  // ==========================================
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
    32: '128px',
    40: '160px',
    48: '192px',
    56: '224px',
    64: '256px'
  },
  
  containers: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    brand: '1200px'
  },

  // ==========================================
  // BORDERS & RADIUS
  // ==========================================
  borderRadius: {
    none: '0px',
    sm: '2px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
    // Brand specific
    button: '6px',
    card: '12px',
    modal: '16px'
  },
  
  borderWidth: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  },

  // ==========================================
  // SHADOWS & ELEVATION
  // ==========================================
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Brand shadows
    brand: '0 4px 14px 0 rgba(59, 130, 246, 0.15)',
    brandLg: '0 10px 25px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
    church: '0 4px 14px 0 rgba(147, 51, 234, 0.15)',
    // Glow effects
    glowSm: '0 0 10px rgba(59, 130, 246, 0.3)',
    glow: '0 0 20px rgba(59, 130, 246, 0.4)',
    glowLg: '0 0 30px rgba(59, 130, 246, 0.5)',
    glowPurple: '0 0 20px rgba(147, 51, 234, 0.4)',
    glowGold: '0 0 20px rgba(245, 158, 11, 0.4)',
    glowTeal: '0 0 20px rgba(20, 184, 166, 0.4)'
  },

  // ==========================================
  // ANIMATIONS & TRANSITIONS
  // ==========================================
  transitionDuration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms'
  },
  
  transitionTimingFunction: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    brand: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // ==========================================
  // Z-INDEX SCALE
  // ==========================================
  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080
  },

  // ==========================================
  // BREAKPOINTS
  // ==========================================
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
} as const

// ==========================================
// BRAND GRADIENTS
// ==========================================
export const brandGradients = {
  brand: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  brandReverse: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
  church: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 50%, #14B8A6 100%)',
  worship: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
  community: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  growth: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  textBrand: 'linear-gradient(135deg, #3B82F6 0%, #A855F7 100%)'
} as const

// ==========================================
// COMPONENT TOKENS
// ==========================================
export const componentTokens = {
  button: {
    padding: {
      sm: { x: brandTokens.spacing[3], y: brandTokens.spacing[1] },
      md: { x: brandTokens.spacing[4], y: brandTokens.spacing[2] },
      lg: { x: brandTokens.spacing[6], y: brandTokens.spacing[3] }
    },
    fontSize: {
      sm: brandTokens.typography.fontSize.sm,
      md: brandTokens.typography.fontSize.sm,
      lg: brandTokens.typography.fontSize.base
    },
    borderRadius: brandTokens.borderRadius.button
  },
  
  card: {
    padding: brandTokens.spacing[6],
    borderRadius: brandTokens.borderRadius.card,
    shadow: brandTokens.boxShadow.md,
    border: `${brandTokens.borderWidth[1]} solid #E5E7EB`
  },
  
  input: {
    padding: { x: brandTokens.spacing[3], y: brandTokens.spacing[2] },
    borderRadius: brandTokens.borderRadius.lg,
    border: `${brandTokens.borderWidth[1]} solid #D1D5DB`,
    focusBorder: `${brandTokens.borderWidth[1]} solid ${brandTokens.colors.primary[500]}`,
    focusRing: `0 0 0 1px ${brandTokens.colors.primary[500]}`
  }
} as const

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get a color value from the token system
 * @param color - Color category (e.g., 'primary', 'secondary')
 * @param shade - Color shade (e.g., 500, 600)
 * @returns Hex color value
 */
export function getColor(color: keyof typeof brandTokens.colors, shade: string | number): string {
  const colorPalette = brandTokens.colors[color]
  if (typeof colorPalette === 'object' && 'primary' in colorPalette) {
    return colorPalette[shade as keyof typeof colorPalette] || colorPalette[500]
  }
  return colorPalette as string
}

/**
 * Get a spacing value from the token system
 * @param size - Spacing size (e.g., 1, 2, 4)
 * @returns Spacing value in pixels
 */
export function getSpacing(size: keyof typeof brandTokens.spacing): string {
  return brandTokens.spacing[size]
}

/**
 * Get a font size with line height
 * @param size - Font size key (e.g., 'sm', 'md', 'lg')
 * @returns Font size and line height
 */
export function getFontSize(size: keyof typeof brandTokens.typography.fontSize) {
  return brandTokens.typography.fontSize[size]
}

/**
 * Create a CSS custom property name
 * @param category - Token category (e.g., 'color', 'spacing')
 * @param name - Token name
 * @returns CSS custom property name
 */
export function cssVar(category: string, name: string): string {
  return `var(--${category}-${name})`
}

/**
 * Get brand context color
 * @param context - Church context (e.g., 'worship', 'community')
 * @returns Hex color value
 */
export function getChurchColor(context: keyof typeof brandTokens.colors.church): string {
  return brandTokens.colors.church[context]
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type BrandColor = keyof typeof brandTokens.colors
export type ColorShade = keyof typeof brandTokens.colors.primary
export type FontSize = keyof typeof brandTokens.typography.fontSize
export type FontWeight = keyof typeof brandTokens.typography.fontWeight
export type Spacing = keyof typeof brandTokens.spacing
export type BorderRadius = keyof typeof brandTokens.borderRadius
export type BoxShadow = keyof typeof brandTokens.boxShadow
export type ChurchContext = keyof typeof brandTokens.colors.church

// Export everything as default
export default {
  tokens: brandTokens,
  gradients: brandGradients,
  components: componentTokens,
  utils: {
    getColor,
    getSpacing,
    getFontSize,
    cssVar,
    getChurchColor
  }
}