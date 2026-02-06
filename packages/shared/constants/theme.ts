// OurTurn "Hearthstone" Design System — Warm & Organic Theme
// All color tokens, spacing, typography, radius, shadows

export const BRAND_COLORS = {
  50: '#FFF8F3',   // Parchment
  100: '#FDEEE1',  // Peach Cream
  200: '#F9D4B4',  // Sandy Blush
  300: '#F0B589',  // Warm Apricot
  400: '#E0895A',  // Amber Clay
  500: '#C8693A',  // Terracotta
  600: '#B85A2F',  // Deep Terracotta (primary)
  700: '#964A27',  // Burnt Sienna
  800: '#7A3D22',  // Russet
  900: '#5C2E1A',  // Cocoa
} as const;

export const SURFACE_COLORS = {
  light: {
    background: '#FAF7F2',  // Warm Linen
    card: '#FFFDF8',
    cardSolid: '#FFFDF8',
    border: '#E8E0D4',
    elevated: '#FFFEFB',
  },
  dark: {
    background: '#1A1612',  // Dark Walnut
    card: '#26201A',
    cardSolid: '#26201A',
    border: '#3A322A',
    elevated: '#302820',
  },
} as const;

export const TEXT_COLORS = {
  light: {
    primary: '#2D1F14',
    secondary: '#5C4A3A',
    muted: '#9C8B7A',
    inverse: '#FFFDF8',
  },
  dark: {
    primary: '#EDE5D8',
    secondary: '#B8A898',
    muted: '#7A6E62',
    inverse: '#1A1612',
  },
} as const;

export const STATUS_COLORS = {
  light: {
    success: '#4A7C59',
    successBg: '#EFF5F0',
    amber: '#C4882C',
    amberBg: '#FDF6EA',
    danger: '#B8463A',
    dangerBg: '#FAF0EE',
    info: '#4A6FA5',
    infoBg: '#EDF2F8',
  },
  dark: {
    success: '#7BC48D',
    successBg: 'rgba(123, 196, 141, 0.15)',
    amber: '#E8B86D',
    amberBg: 'rgba(232, 184, 109, 0.15)',
    danger: '#D97A70',
    dangerBg: 'rgba(217, 122, 112, 0.15)',
    info: '#8EB2DB',
    infoBg: 'rgba(142, 178, 219, 0.15)',
  },
} as const;

export const CATEGORY_COLORS = {
  medication: { color: '#7B6198', bg: '#F3EFF7', name: 'Dusty Plum' },
  nutrition: { color: '#4A7C59', bg: '#EFF5F0', name: 'Sage Green' },
  physical: { color: '#C4882C', bg: '#FDF6EA', name: 'Warm Honey' },
  cognitive: { color: '#4A6FA5', bg: '#EDF2F8', name: 'Slate Blue' },
  social: { color: '#B85A6F', bg: '#F8EFF2', name: 'Dusty Rose' },
  health: { color: '#B8463A', bg: '#FAF0EE', name: 'Brick Red' },
} as const;

export const CATEGORY_COLORS_DARK = {
  medication: { color: '#B8A0D0', bg: 'rgba(123, 97, 152, 0.15)' },
  nutrition: { color: '#7BC48D', bg: 'rgba(74, 124, 89, 0.15)' },
  physical: { color: '#E8B86D', bg: 'rgba(196, 136, 44, 0.15)' },
  cognitive: { color: '#8EB2DB', bg: 'rgba(74, 111, 165, 0.15)' },
  social: { color: '#D98B9E', bg: 'rgba(184, 90, 111, 0.15)' },
  health: { color: '#D97A70', bg: 'rgba(184, 70, 58, 0.15)' },
} as const;

export const TIME_GRADIENTS = {
  morning: { start: '#FDECD2', end: '#FAF7F2', name: 'Golden Sunrise' },
  afternoon: { start: '#E8ECDF', end: '#FAF7F2', name: 'Sage Mist' },
  evening: { start: '#E5D8CE', end: '#F0E6DC', name: 'Dusty Clay' },
  night: { start: '#2D1F14', end: '#3A2920', name: 'Warm Night' },
} as const;

export const FONTS = {
  display: 'Fraunces',   // Headings - wonky old-style soft serif
  body: 'Nunito',        // Body - rounded sans-serif, friendly & legible
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
  md: 14,     // Inputs
  lg: 16,     // Buttons, sidebar items
  xl: 20,     // Cards (caregiver)
  '2xl': 24,  // Cards (patient), large containers
  full: 9999, // Pills, avatars
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
  xl: {
    shadowColor: '#2D1F14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;
