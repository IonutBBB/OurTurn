// Task Categories
import type { TaskCategory } from '../types/care-plan';

export interface CategoryInfo {
  id: TaskCategory;
  label: string;
  icon: string;
  color: string;
  lightBg: string;
}

export const TASK_CATEGORIES: CategoryInfo[] = [
  {
    id: 'medication',
    label: 'categories.medication',
    icon: '💊',
    color: '#7C3AED', // Purple
    lightBg: '#F5F3FF',
  },
  {
    id: 'nutrition',
    label: 'categories.nutrition',
    icon: '🥗',
    color: '#16A34A', // Green
    lightBg: '#F0FDF4',
  },
  {
    id: 'physical',
    label: 'categories.physical',
    icon: '🚶',
    color: '#EA580C', // Orange
    lightBg: '#FFF7ED',
  },
  {
    id: 'cognitive',
    label: 'categories.cognitive',
    icon: '🧩',
    color: '#2563EB', // Blue
    lightBg: '#EFF6FF',
  },
  {
    id: 'social',
    label: 'categories.social',
    icon: '💬',
    color: '#DB2777', // Pink
    lightBg: '#FDF2F8',
  },
  {
    id: 'health',
    label: 'categories.health',
    icon: '❤️',
    color: '#DC2626', // Red
    lightBg: '#FEF2F2',
  },
];

export function getCategoryInfo(categoryId: TaskCategory): CategoryInfo | undefined {
  return TASK_CATEGORIES.find((cat) => cat.id === categoryId);
}

export function getCategoryIcon(categoryId: TaskCategory): string {
  return getCategoryInfo(categoryId)?.icon ?? '📋';
}

export function getCategoryColor(categoryId: TaskCategory): string {
  return getCategoryInfo(categoryId)?.color ?? '#57534E';
}
