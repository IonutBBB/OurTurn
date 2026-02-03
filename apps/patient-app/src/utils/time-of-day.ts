import type { DayOfWeek } from '@memoguard/shared';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// Get time of day based on current hour
export function getTimeOfDay(hour: number = new Date().getHours()): TimeOfDay {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// Get greeting emoji based on time of day
export function getGreetingEmoji(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'morning':
      return '☀️';
    case 'afternoon':
      return '🌤️';
    case 'evening':
      return '🌙';
    case 'night':
      return '🌙';
  }
}

// Get greeting key for i18n based on time of day
export function getGreetingKey(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'morning':
      return 'patientApp.checkin.greeting.morning';
    case 'afternoon':
      return 'patientApp.checkin.greeting.afternoon';
    case 'evening':
    case 'night':
      return 'patientApp.checkin.greeting.evening';
  }
}

// Time-of-day gradient backgrounds
export interface GradientColors {
  start: string;
  end: string;
}

export function getBackgroundGradient(timeOfDay: TimeOfDay): GradientColors {
  switch (timeOfDay) {
    case 'morning':
      return { start: '#FEF3C7', end: '#FAFAF8' }; // Warm peach to cream
    case 'afternoon':
      return { start: '#E0F2FE', end: '#FAFAF8' }; // Soft sky to white
    case 'evening':
      return { start: '#EDE9FE', end: '#FDF2F8' }; // Lavender to dusty rose
    case 'night':
      return { start: '#1E1B4B', end: '#312E81' }; // Deep navy to dark purple
  }
}

// Get background color for the current time (simplified - no gradient for React Native)
export function getBackgroundColor(timeOfDay: TimeOfDay): string {
  const gradient = getBackgroundGradient(timeOfDay);
  // Use the lighter color for the background
  return gradient.end;
}

// Convert JavaScript Date day to DayOfWeek type
export function getDayOfWeek(date: Date = new Date()): DayOfWeek {
  const days: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[date.getDay()];
}

// Format date as YYYY-MM-DD for database queries
export function formatDateForDb(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// Parse a time string (HH:MM) to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Get current time in minutes since midnight
export function getCurrentTimeInMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

// Determine if a task is overdue based on its scheduled time
export function isTaskOverdue(taskTime: string): boolean {
  const taskMinutes = timeToMinutes(taskTime);
  const currentMinutes = getCurrentTimeInMinutes();
  // Allow a 15-minute grace period
  return currentMinutes > taskMinutes + 15;
}

// Format time for display (12-hour format)
export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}
