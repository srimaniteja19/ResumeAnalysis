import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  clearAllHistory,
  getHistoryRecord,
  listHistorySummaries,
  type HistorySummary,
} from '@/lib/sessionHistoryDb'
import { Button } from '@/components/ui/button'

export function SessionHistoryPanel() {
  const restoreSessionSnapshot = useAppStore((s) => s.restoreSessionSnapshot)
  const [rows, setRows] = useState<HistorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await listHistorySummaries())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const onUpd = () => void refresh()
    window.addEventListener('roleweaver-history-updated', onUpd)
    return () => window.removeEventListener('roleweaver-history-updated', onUpd)
  }, [refresh])

  const restore = async (id: string) => {
    setBusy(id)
    try {
      const rec = await getHistoryRecord(id)
      if (!rec) return
      restoreSessionSnapshot({
        jobDescription: rec.jobDescription,
        resumeFileName: rec.resumeFileName,
        resumePageCount: rec.resumePageCount,
        resumeText: rec.resumeText,
        resumePageTexts: rec.resumePageTexts ?? [],
        analysisResult: rec.analysisResult,
        appliedSuggestionIndexes: rec.appliedSuggestionIndexes ?? [],
        analysisTone: rec.analysisTone ?? 'strict',
        resumePageFocus: {
          emphasizeFirstPage: rec.resumePageFocus?.emphasizeFirstPage ?? false,
          ignoredPages: [...(rec.resumePageFocus?.ignoredPages ?? [])],
        },
        provider: rec.provider,
        model: rec.model,
      })
    } finally {
      setBusy(null)
    }
    void refresh()
  }

  const wipe = async () => {
    if (!confirm('Delete all saved sessions on this device?')) return
    await clearAllHistory()
    void refresh()
  }

  if (loading && rows.length === 0) {
    return (
      <p className="font-mono text-xs text-dim">Loading local history…</p>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 bg-bg2/40 p-4">
        <p className="font-mono text-xs text-dim">
          No saved runs yet. After you analyze, the latest sessions appear here
          (stored in this browser only).
        </p>
      </div>
    )
  }

  return (
    <section className="rounded-xl border-2 border-border bg-card/90 p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-sm uppercase tracking-wide">
          Session history
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-danger/50 font-mono text-[10px] text-danger hover:bg-danger/10"
          onClick={() => void wipe()}
        >
          Clear all
        </Button>
      </div>
      <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 bg-bg2/50 px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[10px] text-dim">
                {new Date(r.createdAt).toLocaleString()} · match{' '}
                {r.overallMatch}%
              </p>
              <p className="truncate font-sans text-sm font-bold text-foreground">
                {r.roleTitle}
              </p>
              <p className="truncate font-mono text-[9px] text-muted">
                {r.jobPreview}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={busy === r.id}
              className="shrink-0 font-mono text-[10px]"
              onClick={() => void restore(r.id)}
            >
              {busy === r.id ? '…' : 'Restore'}
            </Button>
          </li>
        ))}
      </ul>
      <p className="mt-2 font-mono text-[9px] leading-relaxed text-dim">
        Up to 25 runs · IndexedDB on this device · restores JD, résumé text, report, and applied toggles.
      </p>
    </section>
  )
}
