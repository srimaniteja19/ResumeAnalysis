import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

export function ResumePageFocusControls() {
  const {
    resumePageCount,
    resumePageTexts,
    resumePageFocus,
    setEmphasizeFirstResumePage,
    toggleIgnoredResumePage,
  } = useAppStore(
    useShallow((s) => ({
      resumePageCount: s.resumePageCount,
      resumePageTexts: s.resumePageTexts,
      resumePageFocus: s.resumePageFocus,
      setEmphasizeFirstResumePage: s.setEmphasizeFirstResumePage,
      toggleIgnoredResumePage: s.toggleIgnoredResumePage,
    }))
  )

  const pagesShown = Math.min(
    resumePageTexts.length,
    resumePageCount || resumePageTexts.length
  )

  if (pagesShown <= 1) return null

  return (
    <div className="mt-3 rounded-lg border border-dashed border-border/80 bg-bg2/40 p-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
        Multi-page PDF · model scope
      </p>
      <label className="mb-3 flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={resumePageFocus.emphasizeFirstPage}
          onChange={(e) => setEmphasizeFirstResumePage(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-border text-cyan focus:ring-cyan"
        />
        <span className="font-sans text-xs leading-snug text-foreground">
          <span className="font-bold">Emphasize page 1</span> in instructions
          (headline / role signals).
        </span>
      </label>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-dim">
        Omit pages from AI extract (local only — full text still shown below for
        merge/export)
      </p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: pagesShown }, (_, i) => i + 1).map((page) => {
          const off =
            resumePageFocus.ignoredPages.includes(page)
          return (
            <button
              key={page}
              type="button"
              onClick={() => toggleIgnoredResumePage(page)}
              className={cn(
                'rounded-md border-2 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wide transition-colors',
                off
                  ? 'border-danger/60 bg-danger/15 text-danger line-through'
                  : 'border-border bg-card text-foreground hover:border-cyan'
              )}
            >
              Page {page}
            </button>
          )
        })}
      </div>
    </div>
  )
}
