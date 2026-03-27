import { describe, expect, it } from 'vitest'
import {
  computeAppliedScores,
  normalizedImpactGain,
  type AppliedScorePreview,
} from './scoreProjection'
import type { AnalysisResult, SuggestedReplacement } from '@/types'

const baseResult = (over: Partial<AnalysisResult> = {}): AnalysisResult => ({
  roleTitle: '',
  seniorityLevel: '',
  domain: '',
  overallMatch: 50,
  atsScore: 40,
  impactScore: 45,
  completenessScore: 0,
  matchSummary: '',
  mustHavesAssessment: [],
  keywordsPresent: [],
  keywordsPartial: [],
  keywordsMissing: [],
  weakVerbs: [],
  impactLanguageSummary: '',
  sections: [],
  ...over,
})

const cards = (): SuggestedReplacement[] => [
  { section: 'a', original: 'x', rewritten: 'y', reason: '', impactGain: 10 },
  { section: 'b', original: 'x', rewritten: 'y', reason: '', impactGain: 5 },
  { section: 'c', original: 'x', rewritten: 'y', reason: '', impactGain: 5 },
]

describe('normalizedImpactGain', () => {
  it('returns 0 when impactGain is absent', () => {
    const item: SuggestedReplacement = {
      section: '',
      original: 'a',
      rewritten: 'b',
      reason: '',
    }
    expect(normalizedImpactGain(item)).toBe(0)
  })

  it('clamps to 1–15', () => {
    expect(
      normalizedImpactGain({
        section: '',
        original: 'a',
        rewritten: 'b',
        reason: '',
        impactGain: 0,
      })
    ).toBe(1)
    expect(
      normalizedImpactGain({
        section: '',
        original: 'a',
        rewritten: 'b',
        reason: '',
        impactGain: 200,
      })
    ).toBe(15)
  })
})

describe('computeAppliedScores', () => {
  it('returns baseline when nothing applied', () => {
    const result = baseResult()
    const items = cards()
    const preview = computeAppliedScores(result, items, [])
    expect(preview).toEqual<AppliedScorePreview>({
      overallMatch: 50,
      atsScore: 40,
      impactScore: 45,
    })
  })

  it('adds applied impact gains to overall, capped by projected overall', () => {
    const result = baseResult({
      overallMatch: 50,
      projectedScores: {
        overallMatch: 62,
        atsScore: 55,
        impactScore: 60,
      },
    })
    const items = cards()
    const preview = computeAppliedScores(result, items, [0])
    expect(preview.overallMatch).toBe(60)
    expect(preview.overallMatch).toBeLessThanOrEqual(62)
  })

  it('interpolates ATS and impact toward projectedScores by fraction applied', () => {
    const result = baseResult({
      overallMatch: 40,
      atsScore: 30,
      impactScore: 35,
      projectedScores: {
        overallMatch: 80,
        atsScore:60,
        impactScore: 70,
      },
    })
    const items: SuggestedReplacement[] = [
      {
        section: '',
        original: 'a',
        rewritten: 'b',
        reason: '',
        impactGain: 10,
      },
      {
        section: '',
        original: 'a',
        rewritten: 'b',
        reason: '',
        impactGain: 10,
      },
    ]
    const half = computeAppliedScores(result, items, [0])
    expect(half.atsScore).toBe(45)
    expect(half.impactScore).toBe(53)
    const full = computeAppliedScores(result, items, [0, 1])
    expect(full.atsScore).toBe(60)
    expect(full.impactScore).toBe(70)
  })

  it('uses heuristic ATS/impact bump when projectedScores missing', () => {
    const result = baseResult({ overallMatch: 50, atsScore: 40, impactScore: 45 })
    const items: SuggestedReplacement[] = [
      {
        section: '',
        original: 'a',
        rewritten: 'b',
        reason: '',
        impactGain: 10,
      },
    ]
    const preview = computeAppliedScores(result, items, [0])
    expect(preview.overallMatch).toBe(60)
    expect(preview.atsScore).toBe(44)
    expect(preview.impactScore).toBe(50)
  })

  it('caps overall at 100 without projection when sum would exceed', () => {
    const result = baseResult({ overallMatch: 95 })
    const items: SuggestedReplacement[] = [
      {
        section: '',
        original: 'a',
        rewritten: 'b',
        reason: '',
        impactGain: 20,
      },
    ]
    const preview = computeAppliedScores(result, items, [0])
    expect(preview.overallMatch).toBe(100)
  })
})
