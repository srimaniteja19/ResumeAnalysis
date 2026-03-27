import * as pdfjsLib from 'pdfjs-dist'
import {
  type PDFResult,
  MAX_PDF_PAGES_EXTRACT,
  extractAllPagesText,
  normalizeResumeTextForAnalysis,
} from './pdfInternals'
import { extractPdfInWorker } from './pdfWorkerClient'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export type { PDFResult }

async function extractTextFromBufferMain(
  buffer: ArrayBuffer
): Promise<PDFResult> {
  const pdf = await pdfjsLib.getDocument({
    data: buffer,
    /* Text-only: skip font fetching / face resolution (PDF.js perf guidance). */
    disableFontFace: true,
    useSystemFonts: true,
    verbosity: 0,
  }).promise
  const totalPages = pdf.numPages
  const toRead = Math.min(totalPages, MAX_PDF_PAGES_EXTRACT)
  const parts = await extractAllPagesText(pdf, toRead)
  const pageTexts = parts.map((p) => normalizeResumeTextForAnalysis(p))
  const text = normalizeResumeTextForAnalysis(pageTexts.join('\n\n'))
  return { text, pageCount: totalPages, pageTexts }
}

export async function extractTextFromPDF(file: File): Promise<PDFResult> {
  if (file.type !== 'application/pdf')
    throw new Error('Only PDF files are supported.')
  if (file.size > 10 * 1024 * 1024)
    throw new Error('File too large. Max 10MB.')

  const buffer = await file.arrayBuffer()

  if (typeof Worker !== 'undefined') {
    try {
      return await extractPdfInWorker(buffer.slice(0))
    } catch (e) {
      console.warn('PDF extract worker failed; retrying on main thread:', e)
    }
  }

  return extractTextFromBufferMain(buffer)
}
