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
    color: '#7B6198', // Dusty Plum
    lightBg: '#F3EFF7',
  },
  {
    id: 'nutrition',
    label: 'categories.nutrition',
    icon: '🥗',
    color: '#4A7C59', // Sage Green
    lightBg: '#EFF5F0',
  },
  {
    id: 'physical',
    label: 'categories.physical',
    icon: '🚶',
    color: '#C4882C', // Warm Honey
    lightBg: '#FDF6EA',
  },
  {
    id: 'cognitive',
    label: 'categories.cognitive',
    icon: '🧩',
    color: '#4A6FA5', // Slate Blue
    lightBg: '#EDF2F8',
  },
  {
    id: 'social',
    label: 'categories.social',
    icon: '💬',
    color: '#B85A6F', // Dusty Rose
    lightBg: '#F8EFF2',
  },
  {
    id: 'health',
    label: 'categories.health',
    icon: '❤️',
    color: '#B8463A', // Brick Red
    lightBg: '#FAF0EE',
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
