/**
 * Travel-Lingua v2 Design System
 * Boarding-pass aesthetic with 5 named core colors + purposeful typographic hierarchy.
 */

export const TravelTheme = {
  colors: {
    // 5 Core Named Tokens
    ink: '#1B2A2F',            // Ink Teal: Primary text, high-contrast surfaces, dark cards
    paper: '#F6F1E4',          // Paper: Background (aged paper warmth)
    postmark: '#C4442E',       // Postmark Red: THE single accent (CTAs, active states)
    sage: '#8A9A8E',           // Sage Stamp: Secondary accent for success/ready states
    sandLine: '#D8CFB8',       // Sand Line: Hairline borders, dividers, disabled states

    // Derived structural tokens mapped for backward compatibility & component clarity
    primary: '#C4442E',        // Alias to Postmark Red
    primaryDark: '#A03320',    // Darker postmark red
    primaryLight: '#F9EDEB',   // Soft Postmark tint for active pills
    secondary: '#1B2A2F',      // Alias to Ink Teal
    secondaryLight: '#E8ECEB', // Soft ink tint
    accent: '#C4442E',         // Single hero accent

    background: '#F6F1E4',     // Aged paper canvas
    surface: '#FEFCF6',        // Solid warm off-white card surface
    surfaceDark: '#1B2A2F',    // Dark card surface (Ink Teal)
    surfaceBorder: '#D8CFB8',  // Sand Line 1px hairline border

    textPrimary: '#1B2A2F',    // Ink Teal
    textSecondary: '#5A676B',  // Muted ink
    textMuted: '#7A8078',      // Muted sage/sand tone
    textLight: '#F6F1E4',      // Paper white on dark surfaces

    success: '#8A9A8E',        // Sage Stamp
    successLight: '#EEF2EF',   // Soft sage background
    warning: '#B8860B',        // Dark Goldenrod for network notices only
    warningLight: '#FDF7EC',
    danger: '#C4442E',         // Postmark Red
    divider: '#D8CFB8',        // Sand Line

    offlineBadge: '#4C6B52',   // Deep sage green for offline badges
    offlineBadgeBg: '#EAF0EB',
  },
  typography: {
    displayFont: 'Spectral_700Bold',
    displayFontSemiBold: 'Spectral_600SemiBold',
    displayFontRegular: 'Spectral_400Regular',
    displayFontExtraBold: 'Spectral_800ExtraBold',
    bodyFont: 'Inter_400Regular',
    bodyFontMedium: 'Inter_500Medium',
    bodyFontSemiBold: 'Inter_600SemiBold',
    bodyFontBold: 'Inter_700Bold',
    bodyFontExtraBold: 'Inter_800ExtraBold',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  shadows: {
    resting: {
      shadowColor: '#1B2A2F',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    raised: {
      shadowColor: '#1B2A2F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },
    card: {
      shadowColor: '#1B2A2F',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    button: {
      shadowColor: '#C4442E',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 3,
    }
  }
};
