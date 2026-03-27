import type { AnalysisTone } from '@/types'

const STRICT_APPEND = `
ANALYSIS MODE — STRICT (faithful facts):
- Keep suggested rewrites minimal and conservative; do not stretch claims beyond the résumé.
- When two phrasings are plausible, prefer the one that is easier to defend in an interview.
`.trim()

const CREATIVE_APPEND = `
ANALYSIS MODE — CREATIVE POLISH:
- You may use bolder, more confident framing and tighter impact wording when it does NOT introduce new employers, titles, tools, certifications, or numeric outcomes.
- Never invent specific metrics; use [X%] / [N] placeholders only for clearly implied metric slots.
- Prefer vivid, JD-aligned verbs and natural keyword integration.
`.trim()

/** Appends tone instructions to any system prompt used for analysis. */
export function withAnalysisTone(systemPrompt: string, tone: AnalysisTone): string {
  const block = tone === 'creative' ? CREATIVE_APPEND : STRICT_APPEND
  return `${systemPrompt.trimEnd()}\n\n${block}`
}
