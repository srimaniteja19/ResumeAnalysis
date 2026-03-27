import type { PDFDocumentProxy } from 'pdfjs-dist'

export interface PDFResult {
  text: string
  pageCount: number
  /** Normalized text per page; `pageTexts[i]` is page `i + 1`. Length ≤ pages read. */
  pageTexts: string[]
}

/** Beyond this, text is rarely useful for a résumé; avoids huge PDF slowdowns. */
export const MAX_PDF_PAGES_EXTRACT = 50

const PAGE_EXTRACT_CONCURRENCY = 6

/**
 * Clean PDF text: fix hyphenation breaks, whitespace. Slightly fewer tokens / clearer for LLMs.
 */
export function normalizeResumeTextForAnalysis(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(\w)\u00ad\n?(\w)/g, '$1$2')
    .replace(/(\w)-\n(\w)/g, '$1$2')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Extract text from multiple pages in parallel (bounded concurrency), matching common PDF.js
 * usage patterns for faster multi-page extraction than strict sequential getPage calls.
 */
export async function extractAllPagesText(
  pdf: PDFDocumentProxy,
  pageCount: number,
  concurrency: number = PAGE_EXTRACT_CONCURRENCY
): Promise<string[]> {
  const results: string[] = new Array(pageCount)
  let nextPage = 1

  const worker = async () => {
    for (;;) {
      const i = nextPage++
      if (i > pageCount) break
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const items = content.items as { str?: string }[]
      results[i - 1] = items.map((item) => item.str ?? '').join(' ')
    }
  }

  const n = Math.min(Math.max(1, concurrency), pageCount)
  await Promise.all(Array.from({ length: n }, () => worker()))
  return results
}
