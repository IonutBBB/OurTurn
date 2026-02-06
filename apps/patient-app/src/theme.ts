// MemoGuard Patient App — "Hearthstone" Warm & Organic Theme

export const COLORS = {
  // Brand - Terracotta
  brand50: '#FFF8F3',
  brand100: '#FDEEE1',
  brand200: '#F9D4B4',
  brand300: '#F0B589',
  brand400: '#E0895A',
  brand500: '#C8693A',
  brand600: '#B85A2F',
  brand700: '#964A27',
  brand800: '#7A3D22',
  brand900: '#5C2E1A',

  // Surfaces
  background: '#FAF7F2',
  card: '#FFFDF8',
  border: '#E8E0D4',

  // Text
  textPrimary: '#2D1F14',
  textSecondary: '#5C4A3A',
  textMuted: '#9C8B7A',
  textInverse: '#FFFDF8',

  // Status
  success: '#4A7C59',
  successBg: '#EFF5F0',
  amber: '#C4882C',
  amberBg: '#FDF6EA',
  danger: '#B8463A',
  dangerBg: '#FAF0EE',
  info: '#4A6FA5',
  infoBg: '#EDF2F8',

  // Categories
  medication: '#7B6198',
  medicationBg: '#F3EFF7',
  nutrition: '#4A7C59',
  nutritionBg: '#EFF5F0',
  physical: '#C4882C',
  physicalBg: '#FDF6EA',
  cognitive: '#4A6FA5',
  cognitiveBg: '#EDF2F8',
  social: '#B85A6F',
  socialBg: '#F8EFF2',
  health: '#B8463A',
  healthBg: '#FAF0EE',

  // Overdue (warm amber tint)
  overdueBg: '#FDF6EA',
  overdueBorder: '#C4882C',

  // Completed
  completedBg: '#F5F0E8',
} as const;

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

export const TIME_GRADIENTS = {
  morning: ['#FDECD2', '#FAF7F2'] as const,
  afternoon: ['#E8ECDF', '#FAF7F2'] as const,
  evening: ['#E5D8CE', '#F0E6DC'] as const,
  night: ['#2D1F14', '#3A2920'] as const,
} as const;
