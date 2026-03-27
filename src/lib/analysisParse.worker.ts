import { parseAnalysisFromRaw } from './analysisParse'

type InMsg = { id: number; raw: string }

function readParseInMsg(data: unknown): InMsg | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if (typeof o.id !== 'number' || typeof o.raw !== 'string') return null
  return { id: o.id, raw: o.raw }
}

self.onmessage = (e: MessageEvent<unknown>) => {
  const msg = readParseInMsg(e.data)
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
  const { id, raw } = msg
  try {
    const result = parseAnalysisFromRaw(raw)
    postMessage({ id, ok: true as const, result })
  } catch (err) {
    postMessage({
      id,
      ok: false as const,
      message: err instanceof Error ? err.message : String(err),
    })
  }
}
