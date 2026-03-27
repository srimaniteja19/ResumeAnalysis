import type { PDFResult } from './pdfInternals'
import PdfExtractWorker from './pdfExtract.worker?worker'

let worker: InstanceType<typeof PdfExtractWorker> | null = null
let seq = 0
const pending = new Map<
  number,
  {
    resolve: (v: PDFResult) => void
    reject: (e: Error) => void
  }
>()

function ensureWorker(): InstanceType<typeof PdfExtractWorker> {
  if (!worker) {
    worker = new PdfExtractWorker()
    worker.onmessage = (
      e: MessageEvent<
        | {
            id: number
            ok: true
            text: string
            pageCount: number
            pageTexts: string[]
          }
        | { id: number; ok: false; message: string }
      >
    ) => {
      const data = e.data
      const p = pending.get(data.id)
      if (!p) return
      pending.delete(data.id)
      if (data.ok)
        p.resolve({
          text: data.text,
          pageCount: data.pageCount,
          pageTexts: data.pageTexts,
        })
      else p.reject(new Error(data.message))
    }
  }
  return worker
}

/** Transfer buffer to worker (zero-copy); do not reuse buffer after await. */
export function extractPdfInWorker(buffer: ArrayBuffer): Promise<PDFResult> {
  return new Promise((resolve, reject) => {
    const id = ++seq
    pending.set(id, { resolve, reject })
    try {
      ensureWorker().postMessage({ id, buffer }, [buffer])
    } catch (e) {
      pending.delete(id)
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}
