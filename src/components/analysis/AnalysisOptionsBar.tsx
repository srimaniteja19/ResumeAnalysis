import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import type { AnalysisTone } from '@/types'
import { useShallow } from 'zustand/react/shallow'

export function AnalysisOptionsBar() {
  const { analysisTone, setAnalysisTone } = useAppStore(
    useShallow((s) => ({
      analysisTone: s.analysisTone,
      setAnalysisTone: s.setAnalysisTone,
    }))
  )

  const modes: { id: AnalysisTone; label: string; hint: string }[] = [
    {
      id: 'strict',
      label: 'Strict',
      hint: 'Minimal, conservative rewrites',
    },
    {
      id: 'creative',
      label: 'Creative',
      hint: 'Bolder polish, still no new facts',
    },
  ]

  return (
    <section className="mb-5 rounded-xl border-[3px] border-black bg-card/90 p-4 shadow-comic-sm">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-dim">
        Analysis mode
      </p>
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setAnalysisTone(m.id)}
            className={cn(
              'rounded-lg border-2 px-4 py-2 text-left transition-all',
              analysisTone === m.id
                ? 'border-black bg-pastel-lavender shadow-comic-sm ring-2 ring-omni/70'
                : 'border-border/80 bg-bg2 hover:border-cyan/50'
            )}
          >
            <span className="font-display text-xs uppercase tracking-wide text-foreground">
              {m.label}
            </span>
            <span className="mt-0.5 block font-mono text-[9px] text-dim">
              {m.hint}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
