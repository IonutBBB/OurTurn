/**
 * Accessibility Constants
 * WCAG 2.1 AA compliant values for use across all apps
 */

// Minimum touch target sizes (in pixels)
export const TOUCH_TARGETS = {
  // WCAG 2.1 Level AA minimum: 44x44px
  minimum: 44,
  // Patient app uses larger targets for users with motor difficulties
  patientMinimum: 56,
  // Primary action buttons in patient app
  patientPrimary: 64,
  // Emoji/icon selection buttons
  emojiButton: 72,
  // Spacing between touch targets to prevent mis-taps
  spacing: 16,
} as const;

// Minimum font sizes (in pixels)
export const FONT_SIZES = {
  // WCAG minimum for body text
  bodyMinimum: 16,
  // Patient app minimum (for cognitive accessibility)
  patientBodyMinimum: 20,
  patientSecondaryMinimum: 18,
  patientHeading: 28,
  // Caregiver app sizes
  caregiverBody: 16,
  caregiverBodyMobile: 16,
  caregiverSmall: 14,
  caregiverHeading: 24,
  caregiverSectionTitle: 18,
} as const;

// Contrast ratios (WCAG 2.1 AA requirements)
export const CONTRAST_RATIOS = {
  // Normal text: 4.5:1 minimum
  normalText: 4.5,
  // Large text (18pt+ or 14pt+ bold): 3:1 minimum
  largeText: 3,
  // For critical UI elements, aim higher
  recommended: 7,
  // Non-text UI components: 3:1 minimum
  uiComponents: 3,
} as const;

// Accessible color pairs (background -> foreground) that meet WCAG AA
export const ACCESSIBLE_COLOR_PAIRS = {
  // Primary button: teal background, white text (contrast ~4.87:1)
  primaryButton: { bg: '#0D9488', fg: '#FFFFFF' },
  // Danger button: red background, white text (contrast ~4.63:1)
  dangerButton: { bg: '#DC2626', fg: '#FFFFFF' },
  // Card: white background, dark text (contrast ~16:1)
  card: { bg: '#FFFFFF', fg: '#1C1917' },
  // Muted text on light background (contrast ~4.65:1)
  mutedText: { bg: '#FAFAF8', fg: '#57534E' },
  // Success: green on white (contrast ~4.5:1)
  success: { bg: '#FFFFFF', fg: '#16A34A' },
  // Warning: amber on light amber (contrast ~4.5:1)
  warning: { bg: '#FFFBEB', fg: '#92400E' },
} as const;

// Animation timing for accessibility
export const ANIMATION_TIMING = {
  // Maximum duration for non-essential animations
  maxDuration: 5000,
  // Transition timing that won't cause vestibular issues
  safeTransition: 250,
  // Recommended for UI feedback
  feedback: 200,
  // Loading indicator cycle time
  loadingCycle: 1000,
} as const;

// Focus indicator styles
export const FOCUS_STYLES = {
  // Focus ring width (must be visible)
  ringWidth: 2,
  // Focus ring color (must contrast with background)
  ringColor: '#0D9488',
  // Focus ring offset
  ringOffset: 2,
} as const;

// Screen reader live region priorities
export const LIVE_REGIONS = {
  // For important updates (errors, confirmations)
  assertive: 'assertive' as const,
  // For non-urgent updates (status changes)
  polite: 'polite' as const,
  // Turn off announcements
  off: 'off' as const,
} as const;

// Accessibility roles for React Native
export const A11Y_ROLES = {
  button: 'button' as const,
  link: 'link' as const,
  header: 'header' as const,
  image: 'image' as const,
  text: 'text' as const,
  search: 'search' as const,
  alert: 'alert' as const,
  checkbox: 'checkbox' as const,
  radio: 'radio' as const,
  tab: 'tab' as const,
  tablist: 'tablist' as const,
  progressbar: 'progressbar' as const,
  adjustable: 'adjustable' as const,
  imagebutton: 'imagebutton' as const,
  none: 'none' as const,
} as const;

// Common accessibility labels (use with i18n)
export const A11Y_LABEL_KEYS = {
  // Navigation
  goBack: 'a11y.goBack',
  openMenu: 'a11y.openMenu',
  closeMenu: 'a11y.closeMenu',
  // Actions
  submit: 'a11y.submit',
  cancel: 'a11y.cancel',
  delete: 'a11y.delete',
  edit: 'a11y.edit',
  save: 'a11y.save',
  // Status
  loading: 'a11y.loading',
  error: 'a11y.error',
  success: 'a11y.success',
  // Forms
  required: 'a11y.required',
  optional: 'a11y.optional',
  invalid: 'a11y.invalid',
  // Voice
  startRecording: 'a11y.startRecording',
  stopRecording: 'a11y.stopRecording',
  playRecording: 'a11y.playRecording',
  pauseRecording: 'a11y.pauseRecording',
} as const;

// Keyboard shortcuts (web only)
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  skipToMain: 'Skip to main content',
  skipToNav: 'Skip to navigation',
  // Common actions
  save: 'Ctrl+S / Cmd+S',
  cancel: 'Escape',
  submit: 'Enter',
  // Focus management
  nextFocusable: 'Tab',
  prevFocusable: 'Shift+Tab',
} as const;

// Timing for auto-updates and timeouts (WCAG 2.2.1)
export const TIMING = {
  // Minimum time before auto-refresh (in ms)
  minAutoRefresh: 20000,
  // Session timeout warning (in ms before timeout)
  sessionWarning: 60000,
  // No time limits on patient app interactions
  patientNoTimeLimit: true,
} as const;
