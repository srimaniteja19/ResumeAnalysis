import type { SuggestedReplacement } from '@/types'

/**
 * Apply selected replacements once each (first occurrence of `original`).
 * Longest `original` first reduces accidental partial overlap issues.
 */
export function applySuggestionsToResume(
  resumeText: string,
  items: SuggestedReplacement[] | undefined,
  appliedIndexes: number[]
): string {
  if (!items?.length || appliedIndexes.length === 0) return resumeText

  const pairs = appliedIndexes
    .filter((i) => i >= 0 && i < items.length)
    .map((i) => items[i])
    .filter((item) => item.original.length > 0)
    .sort((a, b) => b.original.length - a.original.length)

  let out = resumeText
  for (const item of pairs) {
    const idx = out.indexOf(item.original)
    if (idx === -1) continue
    out =
      out.slice(0, idx) + item.rewritten + out.slice(idx + item.original.length)
  }
  return out
}
