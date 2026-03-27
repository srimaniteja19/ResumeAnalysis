import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-success'
  if (score >= 50) return 'text-amber'
  return 'text-danger'
}

export function getScoreHex(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#ea580c'
  return '#dc2626'
}

export function getBadgeVariant(
  score: number
): 'success' | 'warning' | 'danger' {
  if (score >= 75) return 'success'
  if (score >= 50) return 'warning'
  return 'danger'
}

export function getStatusColor(status: 'met' | 'partial' | 'missing'): string {
  return status === 'met'
    ? '#22c55e'
    : status === 'partial'
      ? '#ea580c'
      : '#dc2626'
}

export function getStatusIcon(status: 'met' | 'partial' | 'missing'): string {
  return status === 'met' ? '✓' : status === 'partial' ? '~' : '✗'
}

export function getStatusLabel(status: 'met' | 'partial' | 'missing'): string {
  return status === 'met' ? 'MET' : status === 'partial' ? 'PARTIAL' : 'MISSING'
}
