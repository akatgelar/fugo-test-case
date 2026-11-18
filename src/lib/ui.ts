import { aiStatusLabels, categoryLabels, pipelineLabels, priorityLabels } from './validation';

export function formatDateTime(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 3) + '••••••••' + key.slice(-4);
}

export function priorityClass(priority?: string | null): string {
  if (priority === 'high') return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';
  if (priority === 'medium') return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500';
  if (priority === 'low') return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
  return 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400';
}

export function aiStatusClass(status: string): string {
  if (status === 'succeeded') return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
  if (status === 'failed') return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';
  if (status === 'processing') return 'bg-brand-50 text-brand-500 dark:bg-brand-500/15';
  return 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400';
}

export function aiStatusDot(status: string): string {
  if (status === 'succeeded') return 'bg-success-500';
  if (status === 'failed') return 'bg-error-500';
  if (status === 'processing') return 'bg-brand-500 animate-pulse';
  return 'bg-gray-400';
}

export function pipelineClass(status: string): string {
  if (status === 'won') return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
  if (status === 'lost') return 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400';
  if (status === 'proposal') return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500';
  if (status === 'contacted') return 'bg-brand-50 text-brand-500 dark:bg-brand-500/15';
  return 'bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-500';
}

export function initials(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export { aiStatusLabels, categoryLabels, pipelineLabels, priorityLabels };
