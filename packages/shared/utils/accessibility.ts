/**
 * Accessibility Utilities
 * Helper functions for implementing WCAG 2.1 AA compliance
 */

import { CONTRAST_RATIOS } from '../constants/accessibility';

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export function getLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA for normal text
 */
export function meetsContrastAA(
  foreground: string,
  background: string
): boolean {
  return getContrastRatio(foreground, background) >= CONTRAST_RATIOS.normalText;
}

/**
 * Check if color combination meets WCAG AA for large text
 */
export function meetsContrastAALarge(
  foreground: string,
  background: string
): boolean {
  return getContrastRatio(foreground, background) >= CONTRAST_RATIOS.largeText;
}

/**
 * Check if color combination meets WCAG AAA (7:1)
 */
export function meetsContrastAAA(
  foreground: string,
  background: string
): boolean {
  return (
    getContrastRatio(foreground, background) >= CONTRAST_RATIOS.recommended
  );
}

/**
 * Generate accessible label for a task card
 */
export function getTaskCardLabel(
  title: string,
  time: string,
  status: string,
  hint?: string
): string {
  const statusText = {
    upcoming: 'upcoming',
    now: 'due now',
    overdue: 'overdue',
    completed: 'completed',
    skipped: 'skipped',
  }[status] || status;

  let label = `${title} at ${time}, ${statusText}`;
  if (hint && status !== 'completed' && status !== 'skipped') {
    label += `. Hint: ${hint}`;
  }
  return label;
}

/**
 * Generate accessible label for mood/sleep selection
 */
export function getMoodSelectionLabel(
  emoji: string,
  label: string,
  isSelected: boolean
): string {
  return `${label}${isSelected ? ', selected' : ''}`;
}

/**
 * Generate accessible label for progress bar
 */
export function getProgressLabel(
  completed: number,
  total: number,
  label?: string
): string {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const base = `${completed} of ${total} ${label || 'items'} completed, ${percent}%`;
  return base;
}

/**
 * Generate accessible label for recording button
 */
export function getRecordingButtonLabel(
  isRecording: boolean,
  hasRecording: boolean,
  isPlaying: boolean,
  duration?: string
): string {
  if (isRecording) {
    return `Recording in progress${duration ? `, ${duration}` : ''}. Tap to stop.`;
  }
  if (hasRecording) {
    if (isPlaying) {
      return `Playing recording${duration ? `, ${duration}` : ''}. Tap to pause.`;
    }
    return `Recording saved${duration ? `, ${duration}` : ''}. Tap to play.`;
  }
  return 'Tap to start voice recording';
}

/**
 * Generate accessible label for location status
 */
export function getLocationStatusLabel(
  patientName: string,
  locationName: string,
  lastUpdate: string
): string {
  return `${patientName} is at ${locationName}. Last updated ${lastUpdate}`;
}

/**
 * Generate accessible hint for touch targets
 */
export function getTouchHint(action: string): string {
  return `Double tap to ${action}`;
}

/**
 * Format time for screen readers (converts 24h to spoken format)
 */
export function formatTimeForScreenReader(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  if (minutes === 0) {
    return `${displayHours} ${ampm}`;
  }
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Generate announcement for task completion
 */
export function getTaskCompletionAnnouncement(taskTitle: string): string {
  return `${taskTitle} marked as done. Great job!`;
}

/**
 * Generate announcement for form errors
 */
export function getFormErrorAnnouncement(
  fieldName: string,
  errorMessage: string
): string {
  return `Error in ${fieldName}: ${errorMessage}`;
}

/**
 * Generate announcement for loading states
 */
export function getLoadingAnnouncement(itemName?: string): string {
  return itemName ? `Loading ${itemName}` : 'Loading';
}

/**
 * Generate announcement for success states
 */
export function getSuccessAnnouncement(action: string): string {
  return `${action} successful`;
}

/**
 * Check if user prefers reduced motion
 * Note: For React Native, use AccessibilityInfo.isReduceMotionEnabled()
 * For web, use window.matchMedia('(prefers-reduced-motion: reduce)')
 */
export function shouldReduceMotion(): boolean {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

/**
 * Get safe animation duration based on reduced motion preference
 */
export function getSafeAnimationDuration(
  normalDuration: number,
  reducedMotion = false
): number {
  return reducedMotion ? 0 : normalDuration;
}
