import { useAppStore } from '@/store/useAppStore'
import { MatchTransformationCallout } from '@/components/results/MatchTransformationCallout'

export function RoleBanner() {
  const analysisResult = useAppStore((s) => s.analysisResult)
  if (!analysisResult) return null

  const { roleTitle, seniorityLevel, domain, matchSummary } = analysisResult

  return (
    <section className="space-y-4">
      <MatchTransformationCallout />
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border-2 border-border bg-pastel-lavender px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-foreground shadow-comic-sm">
          Role · {roleTitle || '—'}
        </span>
        <span className="rounded-full border-2 border-border bg-pastel-peach px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-amber shadow-comic-sm">
          Level · {seniorityLevel || '—'}
        </span>
        <span className="rounded-full border-2 border-border bg-pastel-rose px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-pink-600 shadow-comic-sm">
          Domain · {domain || '—'}
        </span>
      </div>
      <div className="relative overflow-hidden rounded-lg border-2 border-border bg-card pl-4 shadow-card">
        <div
          className="absolute bottom-0 left-0 top-0 w-1.5 rounded-l bg-cyan shadow-glow"
          aria-hidden
        />
        <p className="p-4 pl-5 font-sans text-sm leading-relaxed text-foreground/95">
          {matchSummary}
        </p>
      </div>
    </section>
  )
}
