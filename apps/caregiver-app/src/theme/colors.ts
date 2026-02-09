// Light and dark color palettes for the caregiver mobile app
// Light = current COLORS, Dark = web app's .dark CSS variables

export const lightColors = {
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

  // Shadow
  shadowColor: '#2D1F14',
} as const;

export const darkColors = {
  // Brand - Terracotta (inverted scale for dark mode)
  brand50: '#3A2920',
  brand100: '#4A3528',
  brand200: '#5C4230',
  brand300: '#7A5840',
  brand400: '#C8693A',
  brand500: '#E0895A',
  brand600: '#F0B589',
  brand700: '#F9D4B4',
  brand800: '#FDEEE1',
  brand900: '#FFF8F3',

  // Surfaces
  background: '#1A1612',
  card: '#26201A',
  border: '#3A322A',

  // Text
  textPrimary: '#EDE5D8',
  textSecondary: '#B8A898',
  textMuted: '#9A8E82',
  textInverse: '#1A1612',

  // Status
  success: '#7BC48D',
  successBg: 'rgba(123, 196, 141, 0.15)',
  amber: '#E8B86D',
  amberBg: 'rgba(232, 184, 109, 0.15)',
  danger: '#D97A70',
  dangerBg: 'rgba(217, 122, 112, 0.15)',
  info: '#8EB2DB',
  infoBg: 'rgba(142, 178, 219, 0.15)',

  // Categories
  medication: '#B8A0D0',
  medicationBg: 'rgba(123, 97, 152, 0.15)',
  nutrition: '#7BC48D',
  nutritionBg: 'rgba(74, 124, 89, 0.15)',
  physical: '#E8B86D',
  physicalBg: 'rgba(196, 136, 44, 0.15)',
  cognitive: '#8EB2DB',
  cognitiveBg: 'rgba(74, 111, 165, 0.15)',
  social: '#D98B9E',
  socialBg: 'rgba(184, 90, 111, 0.15)',
  health: '#D97A70',
  healthBg: 'rgba(184, 70, 58, 0.15)',

  // Shadow
  shadowColor: '#000000',
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };
