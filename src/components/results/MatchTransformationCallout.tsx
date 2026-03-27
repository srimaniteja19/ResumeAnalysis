import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'
import {
  getEffectiveOverallMatch,
  getMatchTransformationTier,
} from '@/lib/matchTransformation'

export function MatchTransformationCallout() {
  const { analysisResult, appliedSuggestionIndexes } = useAppStore(
    useShallow((s) => ({
      analysisResult: s.analysisResult,
      appliedSuggestionIndexes: s.appliedSuggestionIndexes,
    }))
  )

  const { score, tier } = useMemo(() => {
    if (!analysisResult) {
      return { score: 0, tier: null as ReturnType<typeof getMatchTransformationTier> | null }
    }
    const score = getEffectiveOverallMatch(
      analysisResult,
      appliedSuggestionIndexes
    )
    return { score, tier: getMatchTransformationTier(score) }
  }, [analysisResult, appliedSuggestionIndexes])

  if (!analysisResult || !tier) return null

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-[3px] border-black p-4 shadow-comic md:p-5 ${tier.cardClass}`}
      aria-live="polite"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tier.stripeClass}`}
        aria-hidden
      />
      <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-dim">
        Omnitrix match reading
      </p>
      <p className="mt-2 font-serif text-2xl tracking-wide md:text-3xl">
        <span className="text-voltage text-foreground">
          Score {score}%? You transform into{' '}
        </span>
        <span className="text-voltage text-cyan">
          {tier.name} {tier.emoji}
        </span>
      </p>
      <p className="mt-2 font-sans text-sm font-bold leading-snug text-foreground/95">
        {tier.tagline}
      </p>
      <p className="mt-3 font-mono text-[8px] uppercase tracking-wider text-dim">
        Fan homage · not affiliated with the show
      </p>
    </div>
  )
}
