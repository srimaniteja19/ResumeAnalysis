import { describe, expect, it } from 'vitest'
import {
  mergeDualAnalysisRaw,
  parseAnalysisFromRaw,
  parseRawToUnknown,
} from './analysisParse'
import type { AnalysisResult } from '@/types'

const minimalCore = (): Record<string, unknown> => ({
  roleTitle: 'Engineer',
  seniorityLevel: 'mid',
  domain: 'software',
  overall_match: 42,
  ats_score: 50,
  impact_score: 55,
  completeness_score: 60,
  match_summary: 'Solid overlap.',
  must_haves_assessment: [
    {
      requirement: 'TypeScript',
      status: 'met',
      evidence: 'Listed in skills.',
    },
  ],
  keywordsPresent: ['react'],
  keywordsPartial: [],
  keywordsMissing: [],
  weakVerbs: [],
  impact_language_summary: 'ok',
  section_breakdown: [
    {
      name: 'Experience',
      score: 70,
      contentPreview: 'Built things',
      strengths: 'Clear titles',
      suggestions: ['Add metrics'],
    },
  ],
})

describe('parseAnalysisFromRaw', () => {
  it('parses plain JSON and normalizes snake_case fields', () => {
    const raw = JSON.stringify(minimalCore())
    const result = parseAnalysisFromRaw(raw)
    expect(result.roleTitle).toBe('Engineer')
    expect(result.overallMatch).toBe(42)
    expect(result.atsScore).toBe(50)
    expect(result.matchSummary).toBe('Solid overlap.')
    expect(result.mustHavesAssessment).toEqual([
      {
        requirement: 'TypeScript',
        status: 'met',
        evidence: 'Listed in skills.',
      },
    ])
    expect(result.sections[0]?.name).toBe('Experience')
    expect(result.sections[0]?.score).toBe(70)
  })

  it('strips markdown code fence and smart quotes', () => {
    const inner = minimalCore()
    const raw = 'Here you go:\n```json\n' + JSON.stringify(inner) + '\n```'
    const result = parseAnalysisFromRaw(raw)
    expect(result.roleTitle).toBe('Engineer')
  })

  it('repairs trailing commas before parsers run', () => {
    const raw = `{
      "roleTitle": "X",
      "seniorityLevel": "",
      "domain": "",
      "overallMatch": 1,
      "atsScore": 1,
      "impactScore": 1,
      "completenessScore": 1,
      "matchSummary": "",
      "mustHavesAssessment": [],
      "keywordsPresent": [],
      "keywordsPartial": [],
      "keywordsMissing": [],
      "weakVerbs": [],
      "impactLanguageSummary": "",
      "sections": [],
    ,}`
    const result = parseAnalysisFromRaw(raw)
    expect(result.roleTitle).toBe('X')
  })

  it('coerces suggested replacements and clamps impactGain', () => {
    const d = {
      ...minimalCore(),
      line_rewrites: [
        {
          section: 'Summary',
          original: 'foo',
          rewritten: 'bar',
          reason: 'better',
          impact_gain: 99,
        },
      ],
    }
    const result = parseAnalysisFromRaw(JSON.stringify(d))
    expect(result.suggestedReplacements).toHaveLength(1)
    expect(result.suggestedReplacements?.[0]).toMatchObject({
      section: 'Summary',
      original: 'foo',
      rewritten: 'bar',
      reason: 'better',
      impactGain: 15,
    })
  })

  it('clamps main scores to 0–100', () => {
    const d = {
      ...minimalCore(),
      overallMatch: 500,
      atsScore: -10,
    }
    const result = parseAnalysisFromRaw(JSON.stringify(d))
    expect(result.overallMatch).toBe(100)
    expect(result.atsScore).toBe(0)
  })

  it('normalizes projectedScores when present', () => {
    const d = {
      ...minimalCore(),
      projected_scores: {
        overall_match: 88,
        ats_score: 77,
        impact_score: 92,
      },
    }
    const result = parseAnalysisFromRaw(JSON.stringify(d))
    expect(result.projectedScores).toEqual({
      overallMatch: 88,
      atsScore: 77,
      impactScore: 92,
    })
  })
})

describe('mergeDualAnalysisRaw', () => {
  it('merges rewrite JSON over core and re-serializes normalized shape', () => {
    const core = {
      ...minimalCore(),
      overall_match: 40,
      suggestedReplacements: [],
    }
    const rewrite = {
      roleTitle: 'Engineer',
      seniorityLevel: 'mid',
      domain: 'software',
      overallMatch: 40,
      atsScore: 50,
      impactScore: 55,
      completenessScore: 60,
      matchSummary: 'Updated summary from rewrite pass.',
      mustHavesAssessment: [],
      keywordsPresent: [],
      keywordsPartial: [],
      keywordsMissing: [],
      weakVerbs: [],
      impactLanguageSummary: '',
      sections: [],
      suggestedReplacements: [
        {
          section: 'Summary',
          original: 'a',
          rewritten: 'b',
          reason: 'c',
        },
      ],
    }
    const mergedStr = mergeDualAnalysisRaw(
      JSON.stringify(core),
      JSON.stringify(rewrite)
    )
    const roundTrip = JSON.parse(mergedStr) as AnalysisResult
    expect(roundTrip.matchSummary).toBe('Updated summary from rewrite pass.')
    expect(roundTrip.suggestedReplacements).toHaveLength(1)
    expect(roundTrip.suggestedReplacements?.[0]?.original).toBe('a')
  })

  it('throws when core is not an object', () => {
    expect(() =>
      mergeDualAnalysisRaw('[]', JSON.stringify(minimalCore()))
    ).toThrow(/Core analysis was not a JSON object/)
  })

  it('throws when rewrite is not an object', () => {
    expect(() =>
      mergeDualAnalysisRaw(JSON.stringify(minimalCore()), '"nope"')
    ).toThrow(/Rewrite analysis was not a JSON object/)
  })
})

describe('parseRawToUnknown', () => {
  it('returns parsed object for fenced JSON', () => {
    const obj = { hello: 'world' }
    const raw = '```json\n' + JSON.stringify(obj) + '\n```'
    expect(parseRawToUnknown(raw)).toEqual(obj)
  })
})
