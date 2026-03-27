/**
 * Offloads PDF parsing + text extraction off the main thread (common pattern with PDF.js).
 */
import * as pdfjsLib from 'pdfjs-dist'
import {
  MAX_PDF_PAGES_EXTRACT,
  extractAllPagesText,
  normalizeResumeTextForAnalysis,
} from './pdfInternals'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

type InMsg = { id: number; buffer: ArrayBuffer }

function readPdfInMsg(data: unknown): InMsg | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if (typeof o.id !== 'number' || !(o.buffer instanceof ArrayBuffer)) return null
  return { id: o.id, buffer: o.buffer }
}

self.onmessage = async (e: MessageEvent<unknown>) => {
  const msg = readPdfInMsg(e.data)
  if (!msg) {
    const id =
      e.data &&
      typeof e.data === 'object' &&
      typeof (e.data as { id?: unknown }).id === 'number'
        ? (e.data as { id: number }).id
        : null
    if (id != null) {
      postMessage({
        id,
        ok: false as const,
        message: 'Invalid worker payload',
      })
    }
    return
  }
  const { id, buffer } = msg
  try {
    const pdf = await pdfjsLib.getDocument({
      data: buffer,
      disableFontFace: true,
      useSystemFonts: true,
      verbosity: 0,
    }).promise
    const totalPages = pdf.numPages
    const toRead = Math.min(totalPages, MAX_PDF_PAGES_EXTRACT)
    const parts = await extractAllPagesText(pdf, toRead)
    const pageTexts = parts.map((p) => normalizeResumeTextForAnalysis(p))
    const text = normalizeResumeTextForAnalysis(pageTexts.join('\n\n'))
    postMessage({
      id,
      ok: true as const,
      text,
      pageCount: totalPages,
      pageTexts,
    })
  } catch (err) {
    postMessage({
      id,
      ok: false as const,
      message: err instanceof Error ? err.message : String(err),
    })
  }
}
