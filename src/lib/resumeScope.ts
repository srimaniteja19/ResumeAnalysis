import { normalizeResumeTextForAnalysis } from '@/lib/pdfInternals'
import type { ResumePageFocusSettings } from '@/types'

export function buildResumeTextForModel(
  fullResumeText: string,
  pageTexts: string[],
  totalPageCount: number,
  focus: ResumePageFocusSettings
): { modelText: string; resumeExtraNote: string | undefined } {
  const readCount = pageTexts.length

  if (readCount === 0 || totalPageCount === 0) {
    const notes: string[] = []
    if (focus.emphasizeFirstPage) {
      notes.push(
        '[Layout note: per-page PDF structure unavailable. Treat the opening blocks as headline / summary if present.]'
      )
    }
    if (focus.ignoredPages.length > 0) {
      notes.push(
        '[Page omit list ignored — paste or single-block résumé has no per-page map.]'
      )
    }
    return {
      modelText: fullResumeText,
      resumeExtraNote: notes.length ? notes.join('\n') : undefined,
    }
  }

  const maxPage = readCount
  const ignored = new Set(
    focus.ignoredPages.filter((p) => p >= 1 && p <= maxPage)
  )
  const kept = pageTexts
    .map((t, i) => ({ t, page: i + 1 }))
    .filter(({ page }) => !ignored.has(page))

  let modelText: string
  if (kept.length === 0) {
    modelText = fullResumeText
  } else {
    modelText = normalizeResumeTextForAnalysis(
      kept.map(({ t }) => t).join('\n\n')
    )
  }

  const parts: string[] = []
  if (ignored.size > 0) {
    parts.push(
      `[Resume extract: omitted page(s) ${[...ignored].sort((a, b) => a - b).join(', ')} — do not treat missing coverage on those pages as candidate gaps.]`
    )
  }
  if (focus.emphasizeFirstPage && readCount > 1 && !ignored.has(1)) {
    parts.push(
      '[Priority: résumé page 1 carries headline / role signals — weight it heavily in matchSummary and must-have alignment.]'
    )
  }

  return {
    modelText,
    resumeExtraNote: parts.length ? parts.join('\n') : undefined,
  }
}
