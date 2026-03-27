import type { AnalysisResult } from '@/types'
import { computeAppliedScores } from '@/lib/scoreProjection'

export type MatchTransformationTier = {
  key: 'xlr8' | 'fourarms' | 'wildmutt'
  name: string
  emoji: string
  tagline: string
  cardClass: string
  stripeClass: string
}

/** Same overall % as ScoreDashboard (base or with applied-suggestion preview). */
export function getEffectiveOverallMatch(
  analysisResult: AnalysisResult,
  appliedSuggestionIndexes: readonly number[]
): number {
  const base = Math.min(
    100,
    Math.max(0, Math.round(Number(analysisResult.overallMatch) || 0))
  )
  const items = analysisResult.suggestedReplacements
  if (!items?.length || appliedSuggestionIndexes.length === 0) return base
  return computeAppliedScores(
    analysisResult,
    items,
    appliedSuggestionIndexes
  ).overallMatch
}

/** Fan-homage alien tier from JD match % (not official IP). */
export function getMatchTransformationTier(
  overallRounded: number
): MatchTransformationTier {
  if (overallRounded >= 70) {
    return {
      key: 'xlr8',
      name: 'XLR8',
      emoji: '⚡',
      tagline: 'Hire-velocity mode — keep that momentum through interviews.',
      cardClass:
        'border-cyan/80 bg-gradient-to-br from-cyan/20 via-omni/15 to-lime-200/50 shadow-[0_0_24px_rgba(57,255,20,0.2)]',
      stripeClass: 'from-cyan via-omni to-lime-400',
    }
  }
  if (overallRounded >= 45) {
    return {
      key: 'fourarms',
      name: 'Four Arms',
      emoji: '💪',
      tagline: 'Heavy-hitter range — pile on proof, metrics, and JD keywords.',
      cardClass:
        'border-amber bg-gradient-to-br from-amber/25 via-pastel-peach/50 to-bg2',
      stripeClass: 'from-amber to-orange-500',
    }
  }
  return {
    key: 'wildmutt',
    name: 'Wildmutt',
    emoji: '🐾',
    tagline: 'Hunt down every gap — rewrite and re-aim at the posting.',
    cardClass:
      'border-border bg-gradient-to-br from-bg3 via-pastel-peach/25 to-muted/15',
    stripeClass: 'from-muted to-amber',
  }
}
