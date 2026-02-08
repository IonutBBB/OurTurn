// OurTurn Caregiver App — "Hearthstone" Warm & Organic Theme

// Color palettes (light + dark)
export { lightColors, darkColors } from './theme/colors';
export type { ThemeColors } from './theme/colors';

// Themed styles system
export {
  ThemeContext,
  useColors,
  useResolvedTheme,
  useResolveTheme,
  createThemedStyles,
} from './theme/themed-styles';

// Backward compatibility: COLORS = lightColors
import { lightColors } from './theme/colors';
export const COLORS = lightColors;

export const FONTS = {
  display: 'Fraunces_700Bold',
  displayMedium: 'Fraunces_500Medium',
  body: 'Nunito_400Regular',
  bodyMedium: 'Nunito_500Medium',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
} as const;

export const SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#2D1F14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D1F14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D1F14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
