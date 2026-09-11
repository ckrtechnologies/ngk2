/**
 * Global NGK Brand Theme & Design System
 * Official Brand Guidelines: NGK / Niterra EMEA Brand Manual
 *
 * Core Brand Colors:
 * - Official NGK Green: #008752 (RGB: 0, 135, 82)
 * - Official NGK Spark Plug Red: #E10000 (Pantone 032C / RGB: 225, 0, 0)
 * - Official NTK Vehicle Electronics Green: #00A859
 * - NGK Amber / Gold Accent: #EEB500
 * - Deep Charcoal / Onyx: #090D16
 *
 * Typography & Font System:
 * - Brand Manual: Nimbus Sans Novus (Graphic/Brand) / Arial (System Fallback)
 * - App Bundled Typography: Quicksand (Light, Regular, Medium, SemiBold, Bold)
 */
import { Platform } from 'react-native';

// ==============================================================================
// 1. COLOR SYSTEM
// ==============================================================================
export const COLORS = {
  // --- Core Brand Identity ---
  primary: '#008752', // Official NGK Green
  primaryDark: '#006636', // Elevated header bottom border & active states
  primaryLight: '#E8F5E9', // Light badge / chip background
  primaryMuted: '#A7F3D0',
  primaryBorder: 'rgba(0, 135, 82, 0.25)',
  primaryGlow: 'rgba(0, 135, 82, 0.15)',

  // --- Secondary & Brand Accents ---
  secondary: '#E10000', // Official NGK Spark Plug Red (Pantone 032C)
  secondaryDark: '#B80000',
  secondaryLight: '#FFEBEE',
  secondaryBorder: 'rgba(225, 0, 0, 0.25)',

  ntkGreen: '#00A859', // Official NTK Vehicle Electronics Green
  ntkLight: '#E8F8F0',

  accent: '#EEB500', // NGK Gold / Amber
  accentDark: '#C79600',
  accentLight: '#FEF3C7',

  // --- Dark Shades & Surfaces ---
  dark: '#090D16', // Deep Onyx background
  darkCard: '#111624', // Dark card surface
  darkSurface: '#182032', // Elevated dark surface
  darkBorder: '#232D42',

  // --- Neutral Grayscale ---
  white: '#FFFFFF',
  background: '#F8FAFC', // Slate 50 screen background
  surface: '#FFFFFF', // Card / modal surface
  surfaceSecondary: '#F1F5F9', // Subtle filled sections
  border: '#E2E8F0', // Slate 200
  borderLight: '#F1F5F9', // Slate 100
  borderDark: '#CBD5E1', // Slate 300
  divider: '#E2E8F0',

  // --- Slate Neutral Palette (Pantone Aligned) ---
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  slate50: '#F8FAFC',

  // --- Typography Text Colors ---
  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  textTertiary: '#64748B', // Slate 500
  textMuted: '#94A3B8', // Slate 400
  textDisabled: '#CBD5E1', // Slate 300
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnPrimaryMuted: 'rgba(255, 255, 255, 0.88)',

  // --- Semantic & Status Colors ---
  success: '#059669', // Emerald 600
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',

  warning: '#D97706', // Amber 600
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',

  error: '#DC2626', // Red 600
  errorLight: '#FEF2F2',
  errorBorder: '#FECACA',

  info: '#2563EB', // Blue 600
  infoLight: '#EFF6FF',
  infoBorder: '#BFDBFE',

  // --- Glassmorphic & Overlay Tokens ---
  glassBg: 'rgba(255, 255, 255, 0.18)',
  glassBorder: 'rgba(255, 255, 255, 0.28)',
  overlay: 'rgba(9, 13, 22, 0.55)',
  overlayLight: 'rgba(15, 23, 42, 0.25)',
};

// ==============================================================================
// 2. TYPOGRAPHY & FONT SYSTEM
// ==============================================================================
export const FONTS = {
  // --- Font Families ---
  family: {
    // Custom bundled brand typeface (Quicksand):
    light: 'Quicksand-Light',
    regular: 'Quicksand-Regular',
    medium: 'Quicksand-Medium',
    semiBold: 'Quicksand-SemiBold',
    bold: 'Quicksand-Bold',

    // Official Clean Sans-serif Fallback (Nimbus Sans Novus / Arial):
    brand: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      default: 'Arial',
    }),
    brandMedium: Platform.select({
      ios: 'HelveticaNeue-Medium',
      android: 'sans-serif-medium',
      default: 'Arial',
    }),
    brandBold: Platform.select({
      ios: 'HelveticaNeue-Bold',
      android: 'sans-serif-bold',
      default: 'Arial',
    }),

    // Monospace for VINs, Part Numbers, OE Codes:
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'Courier',
    }),
  },

  // --- Font Sizes (dp) ---
  size: {
    micro: 10.5,
    caption: 12.5,
    xs: 13,
    sm: 14.5,
    base: 16,
    md: 17,
    lg: 18.5,
    xl: 20.5,
    xxl: 23,
    h3: 25,
    h2: 28,
    h1: 32,
    display: 38,
  },

  // --- Font Weights ---
  weight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    heavy: '800',
    black: '900',
  },

  // --- Line Heights ---
  lineHeight: {
    micro: 14,
    caption: 17,
    xs: 18,
    sm: 20,
    base: 22,
    md: 23.5,
    lg: 25.5,
    xl: 28,
    xxl: 31,
    h3: 33,
    h2: 36,
    h1: 40,
    display: 46,
  },

  // --- Letter Spacing ---
  letterSpacing: {
    tighter: -0.5,
    tight: -0.2,
    normal: 0,
    wide: 0.2,
    wider: 0.5,
    widest: 1.0,
  },
};

// --- Pre-composed Typography Presets ---
export const TYPOGRAPHY = {
  display: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.display,
    lineHeight: FONTS.lineHeight.display,
    fontWeight: FONTS.weight.bold,
    letterSpacing: FONTS.letterSpacing.tight,
    color: COLORS.textPrimary,
  },
  h1: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.h1,
    lineHeight: FONTS.lineHeight.h1,
    fontWeight: FONTS.weight.bold,
    letterSpacing: FONTS.letterSpacing.tight,
    color: COLORS.textPrimary,
  },
  h2: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.h2,
    lineHeight: FONTS.lineHeight.h2,
    fontWeight: FONTS.weight.bold,
    letterSpacing: FONTS.letterSpacing.tight,
    color: COLORS.textPrimary,
  },
  h3: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.h3,
    lineHeight: FONTS.lineHeight.h3,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textPrimary,
  },
  h4: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.xl,
    lineHeight: FONTS.lineHeight.xl,
    fontWeight: FONTS.weight.semiBold,
    color: COLORS.textPrimary,
  },
  title: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.lg,
    lineHeight: FONTS.lineHeight.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.sm,
    lineHeight: FONTS.lineHeight.sm,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textSecondary,
  },
  bodyLarge: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.md,
    lineHeight: FONTS.lineHeight.md,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textPrimary,
  },
  body: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.base,
    lineHeight: FONTS.lineHeight.base,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textPrimary,
  },
  bodyMedium: {
    fontFamily: FONTS.family.medium,
    fontSize: FONTS.size.base,
    lineHeight: FONTS.lineHeight.base,
    fontWeight: FONTS.weight.medium,
    color: COLORS.textPrimary,
  },
  bodyBold: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.base,
    lineHeight: FONTS.lineHeight.base,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  caption: {
    fontFamily: FONTS.family.regular,
    fontSize: FONTS.size.caption,
    lineHeight: FONTS.lineHeight.caption,
    fontWeight: FONTS.weight.regular,
    color: COLORS.textSecondary,
  },
  captionBold: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.caption,
    lineHeight: FONTS.lineHeight.caption,
    fontWeight: FONTS.weight.bold,
    color: COLORS.textPrimary,
  },
  label: {
    fontFamily: FONTS.family.semiBold,
    fontSize: FONTS.size.xs,
    lineHeight: FONTS.lineHeight.xs,
    fontWeight: FONTS.weight.semiBold,
    letterSpacing: FONTS.letterSpacing.wide,
    color: COLORS.textSecondary,
  },
  button: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.base,
    lineHeight: FONTS.lineHeight.base,
    fontWeight: FONTS.weight.bold,
    letterSpacing: FONTS.letterSpacing.wide,
    color: COLORS.white,
    textAlign: 'center',
  },
  buttonSmall: {
    fontFamily: FONTS.family.bold,
    fontSize: FONTS.size.sm,
    lineHeight: FONTS.lineHeight.sm,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  code: {
    fontFamily: FONTS.family.mono,
    fontSize: FONTS.size.sm,
    lineHeight: FONTS.lineHeight.sm,
    color: COLORS.slate800,
  },
};

// ==============================================================================
// 3. SPACING & LAYOUT TOKENS
// ==============================================================================
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

// ==============================================================================
// 4. BORDER RADIUS TOKENS
// ==============================================================================
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// ==============================================================================
// 5. SHADOWS & ELEVATION
// ==============================================================================
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  brand: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
};

// ==============================================================================
// 6. COMPONENT STYLING PRESETS
// ==============================================================================
export const COMPONENTS = {
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  cardElevated: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONTS.size.base,
    fontFamily: FONTS.family.regular,
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
};

// ==============================================================================
// 7. UNIFIED THEME EXPORT (FULL BACKWARD COMPATIBILITY PRESERVED)
// ==============================================================================
export const THEME = {
  // Direct access for existing codebase:
  primary: COLORS.primary,
  primaryDark: COLORS.primaryDark,
  primaryLight: COLORS.primaryLight,
  primaryBorder: COLORS.primaryBorder,
  dark: COLORS.dark,
  accent: COLORS.accent,
  textOnPrimary: COLORS.textOnPrimary,
  textOnPrimaryMuted: COLORS.textOnPrimaryMuted,
  glassBg: COLORS.glassBg,
  glassBorder: COLORS.glassBorder,

  // Full design token namespaces:
  colors: COLORS,
  fonts: FONTS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  components: COMPONENTS,
};

export const THEME_COLOR = THEME.primary;
export default THEME;
