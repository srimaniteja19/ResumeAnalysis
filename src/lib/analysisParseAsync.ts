import AnalysisParseWorker from './analysisParse.worker?worker'
import type { AnalysisResult } from '@/types'
import { parseAnalysisFromRaw } from './analysisParse'

type WorkerResult =
  | { id: number; ok: true; result: AnalysisResult }
  | { id: number; ok: false; message: string }

let worker: InstanceType<typeof AnalysisParseWorker> | null = null
let seq = 0
const pending = new Map<
  number,
  { resolve: (v: AnalysisResult) => void; reject: (e: Error) => void }
>()

function ensureWorker(): InstanceType<typeof AnalysisParseWorker> {
  if (!worker) {
    const W = AnalysisParseWorker
    worker = new W()
    worker.onmessage = (e: MessageEvent<WorkerResult>) => {
      const data = e.data
      const p = pending.get(data.id)
      if (!p) return
      pending.delete(data.id)
      if (data.ok) p.resolve(data.result)
      else p.reject(new Error(data.message))
    }
  }
  return worker
}

/**
 * Offloads JSON extraction + repair + normalization so the UI thread stays responsive
 * while the model response is turned into structured data.
 */
export function parseAnalysisFromRawAsync(raw: string): Promise<AnalysisResult> {
  if (typeof Worker === 'undefined') {
    return new Promise((resolve, reject) => {
      try {
        resolve(parseAnalysisFromRaw(raw))
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)))
      }
    })
  }

  return new Promise((resolve, reject) => {
    const id = ++seq
    pending.set(id, { resolve, reject })
    try {
      ensureWorker().postMessage({ id, raw })
    } catch (e) {
      pending.delete(id)
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}
