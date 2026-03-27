import type { AnalysisResult, SuggestedReplacement } from '@/types'

function clampPct(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)))
}

/** Per-card impact (1–15); 0 if missing from older API responses. */
export function normalizedImpactGain(item: SuggestedReplacement): number {
  if (item.impactGain === undefined || item.impactGain === null) return 0
  const n = Number(item.impactGain)
  if (!Number.isFinite(n)) return 0
  return Math.min(15, Math.max(1, Math.round(n)))
}

export interface AppliedScorePreview {
  overallMatch: number
  atsScore: number
  impactScore: number
}

/**
 * Baseline + sum(impactGain) on overall (cap = projected overall or 100).
 * ATS & impact move proportionally toward projectedScores based on fraction
 * of total possible gain captured by applied cards.
 */
export function computeAppliedScores(
  result: AnalysisResult,
  items: SuggestedReplacement[],
  appliedIndexes: readonly number[]
): AppliedScorePreview {
  const baseO = Number(result.overallMatch) || 0
  const baseA = Number(result.atsScore) || 0
  const baseI = Number(result.impactScore) || 0
  const proj = result.projectedScores

  const gains = items.map(normalizedImpactGain)
  const sumAll = gains.reduce((a, b) => a + b, 0)

  const sumApplied = appliedIndexes.reduce((s, idx) => {
    const g = gains[idx]
    return s + (g !== undefined ? g : 0)
  }, 0)

  const capO =
    proj?.overallMatch !== undefined
      ? clampPct(proj.overallMatch)
      : clampPct(baseO + sumAll)

  const overallMatch = clampPct(Math.min(capO, baseO + sumApplied))

  const frac = sumAll > 0 ? Math.min(1, sumApplied / sumAll) : 0

  let atsScore: number
  let impactScore: number

  if (
    proj?.atsScore !== undefined &&
    proj?.impactScore !== undefined &&
    sumAll > 0
  ) {
    atsScore = clampPct(baseA + (proj.atsScore - baseA) * frac)
    impactScore = clampPct(baseI + (proj.impactScore - baseI) * frac)
  } else {
    atsScore = clampPct(baseA + sumApplied * 0.35)
    impactScore = clampPct(baseI + sumApplied * 0.45)
  }

  return { overallMatch, atsScore, impactScore }
}
