import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  computeAppliedScores,
  normalizedImpactGain,
} from '@/lib/scoreProjection'

export function SuggestedReplacements() {
  const { analysisResult, appliedSuggestionIndexes, toggleAppliedSuggestion } =
    useAppStore(
      useShallow((s) => ({
        analysisResult: s.analysisResult,
        appliedSuggestionIndexes: s.appliedSuggestionIndexes,
        toggleAppliedSuggestion: s.toggleAppliedSuggestion,
      }))
    )

  const items = analysisResult?.suggestedReplacements

  const preview = useMemo(() => {
    if (!analysisResult || !items?.length) {
      return {
        overallMatch: 0,
        atsScore: 0,
        impactScore: 0,
      }
    }
    return computeAppliedScores(
      analysisResult,
      items,
      appliedSuggestionIndexes
    )
  }, [analysisResult, items, appliedSuggestionIndexes])

  if (!analysisResult) return null

  if (!items?.length) {
    return (
      <section className="space-y-2">
        <h2 className="font-serif text-xl font-bold">AI-suggested line rewrites</h2>
        <div className="rounded-lg border border-border bg-bg2/40 p-4 font-sans text-sm text-dim">
          No line-level rewrites were returned. Re-run <span className="text-cyan">Analyze</span>{' '}
          to refresh suggestions.
        </div>
      </section>
    )
  }

  const appliedCount = appliedSuggestionIndexes.length
  const total = items.length

  const baseO = Math.round(Number(analysisResult.overallMatch) || 0)
  const baseA = Math.round(Number(analysisResult.atsScore) || 0)
  const baseI = Math.round(Number(analysisResult.impactScore) || 0)

  const proj = analysisResult.projectedScores

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">
            AI-suggested line rewrites
          </h2>
          <p className="mt-1 font-mono text-xs text-dim">
            From your analysis — apply to preview score lift (simulated; edit your
            resume to realize gains).
          </p>
        </div>
        <p className="font-mono text-sm text-cyan">
          {appliedCount} of {total} applied
        </p>
      </div>

      {appliedCount > 0 && (
        <div className="rounded-lg border border-cyan/35 bg-cyan/5 px-4 py-3 backdrop-blur-sm">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
            Updated score preview
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
            <span className="text-foreground">
              JD match:{' '}
              <span className="text-dim line-through">{baseO}%</span>
              <span className="mx-1.5 text-dim">→</span>
              <span className="font-bold text-success">{preview.overallMatch}%</span>
            </span>
            <span className="text-foreground">
              ATS:{' '}
              <span className="text-dim line-through">{baseA}%</span>
              <span className="mx-1.5 text-dim">→</span>
              <span className="font-bold text-success">{preview.atsScore}%</span>
            </span>
            <span className="text-foreground">
              Impact:{' '}
              <span className="text-dim line-through">{baseI}%</span>
              <span className="mx-1.5 text-dim">→</span>
              <span className="font-bold text-success">{preview.impactScore}%</span>
            </span>
          </div>
        </div>
      )}

      <ul className="space-y-4">
        {items.map((item, i) => {
          const applied = appliedSuggestionIndexes.includes(i)
          const gain = normalizedImpactGain(item)

          return (
            <li
              key={i}
              className={`overflow-hidden rounded-lg border border-border bg-card/70 backdrop-blur-sm transition-opacity ${applied ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 bg-bg2/40 px-4 py-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-cyan">
                  {item.section}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {gain > 0 && (
                    <Badge
                      variant="warning"
                      className="font-mono text-[10px]"
                    >
                      +{gain} pts
                    </Badge>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant={applied ? 'outline' : 'default'}
                    onClick={() => toggleAppliedSuggestion(i)}
                    className={
                      applied
                        ? 'border-border font-mono text-xs text-dim'
                        : 'border border-cyan/50 bg-cyan/15 font-mono text-xs text-cyan hover:bg-cyan/25'
                    }
                  >
                    {applied ? 'Undo' : 'Apply'}
                  </Button>
                </div>
              </div>

              <div
                className={`grid gap-0 border-b border-border/60 md:grid-cols-2 md:divide-x md:divide-border/60 ${applied ? 'max-h-24 overflow-hidden' : ''}`}
              >
                <div className="bg-danger/5 p-4">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-danger/80">
                    Original
                  </p>
                  <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-danger/90 line-through decoration-danger/60">
                    {item.original}
                  </p>
                </div>
                <div className="bg-success/5 p-4">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-success">
                    Rewritten
                  </p>
                  <p
                    className={`whitespace-pre-wrap font-sans text-sm leading-relaxed text-success ${applied ? 'line-clamp-3' : ''}`}
                  >
                    {item.rewritten}
                  </p>
                </div>
              </div>
              <p className="px-4 py-3 font-sans text-xs italic leading-relaxed text-dim">
                {item.reason}
              </p>
              {applied && (
                <p className="border-t border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-success/90">
                  ✓ Applied to preview{gain > 0 ? ` · +${gain} pts` : ''}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {proj &&
        proj.overallMatch !== undefined &&
        proj.atsScore !== undefined &&
        proj.impactScore !== undefined && (
          <div className="rounded-lg border border-border/80 bg-bg2/30 px-4 py-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              If all suggestions applied (model ceiling)
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-dim">
              <span>
                JD match:{' '}
                <span className="text-foreground">
                  {Math.round(proj.overallMatch)}%
                </span>
              </span>
              <span>
                ATS:{' '}
                <span className="text-foreground">
                  {Math.round(proj.atsScore)}%
                </span>
              </span>
              <span>
                Impact:{' '}
                <span className="text-foreground">
                  {Math.round(proj.impactScore)}%
                </span>
              </span>
            </div>
          </div>
        )}
    </section>
  )
}
