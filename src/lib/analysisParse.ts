import { jsonrepair } from 'jsonrepair'
import type {
  AnalysisResult,
  MustHaveItem,
  ResumeSection,
  SuggestedReplacement,
} from '../types'

/** Grab the outermost `{ ... }` without being fooled by `}` inside strings. */
function extractBalancedObject(text: string): string | null {
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (escape) {
      escape = false
      continue
    }
    if (inString) {
      if (c === '\\') escape = true
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') {
      inString = true
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

/** LLMs often emit illegal trailing commas before ] or }. */
function stripTrailingCommas(json: string): string {
  let prev = ''
  let out = json
  while (out !== prev) {
    prev = out
    out = out.replace(/,(\s*[}\]])/g, '$1')
  }
  return out
}

function normalizeQuotes(s: string): string {
  return s
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
}

function extractRawJsonText(raw: string): string {
  let cleaned = raw
    .replace(/^\s*```json\s*/i, '')
    .replace(/^\s*```\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()

  const balanced = extractBalancedObject(cleaned)
  if (balanced) cleaned = balanced
  else {
    const s = cleaned.indexOf('{')
    const e = cleaned.lastIndexOf('}')
    if (s !== -1 && e !== -1 && e > s) cleaned = cleaned.slice(s, e + 1)
  }

  return normalizeQuotes(stripTrailingCommas(cleaned))
}

function parseJsonToUnknown(json: string, rawForLog: string): unknown {
  try {
    return JSON.parse(json)
  } catch (first) {
    try {
      return JSON.parse(jsonrepair(json))
    } catch {
      console.error('Raw AI response:', rawForLog)
      throw new Error(
        `Failed to parse AI response: ${(first as Error).message}`
      )
    }
  }
}

function coerceSuggestedReplacementsArray(
  d: Record<string, unknown>
): unknown[] {
  const candidates = [
    d.suggestedReplacements,
    d.suggested_replacements,
    d.lineRewrites,
    d.line_rewrites,
    d.rewrites,
    d.replacementSuggestions,
  ]
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c
  }
  for (const c of candidates) {
    if (Array.isArray(c)) return c
  }
  return []
}

function coerceSectionsRawArray(d: Record<string, unknown>): unknown[] {
  const candidates = [
    d.sections,
    d.resumeSections,
    d.resume_sections,
    d.sectionBreakdown,
    d.section_breakdown,
    d.sectionAnalysis,
    d.section_analysis,
  ]
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c
  }
  for (const c of candidates) {
    if (Array.isArray(c)) return c
  }
  return []
}

function normalizeResumeSectionEntry(item: unknown): ResumeSection | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null
  const o = item as Record<string, unknown>
  const name = String(
    o.name ?? o.section ?? o.title ?? o.heading ?? ''
  ).trim()
  const score = Math.min(
    100,
    Math.max(0, Math.round(Number(o.score ?? o.rating ?? 0) || 0))
  )
  const previewRaw = String(
    o.contentPreview ??
      o.content_preview ??
      o.preview ??
      o.summary ??
      o.excerpt ??
      ''
  )
  const contentPreview = previewRaw.slice(0, 120)
  const strengths = String(o.strengths ?? o.strength ?? '').trim()
  let suggestions: string[] = []
  if (Array.isArray(o.suggestions)) {
    suggestions = o.suggestions
      .filter((x): x is string => typeof x === 'string')
      .map((x) => x.trim())
      .filter(Boolean)
  } else if (typeof o.suggestion === 'string' && o.suggestion.trim()) {
    suggestions = [o.suggestion.trim()]
  }
  if (!name && !contentPreview && !strengths) return null
  return {
    name: name || 'Section',
    score,
    contentPreview: contentPreview || previewRaw.slice(0, 120),
    strengths: strengths || 'See analysis summary.',
    suggestions: suggestions.length ? suggestions : [],
  }
}

function normalizeResumeSections(d: Record<string, unknown>): ResumeSection[] {
  const raw = coerceSectionsRawArray(d)
  const out: ResumeSection[] = []
  for (const item of raw) {
    const s = normalizeResumeSectionEntry(item)
    if (s) out.push(s)
  }
  return out
}

function coerceMustHavesArray(d: Record<string, unknown>): unknown[] {
  const candidates = [
    d.mustHavesAssessment,
    d.must_haves_assessment,
    d.mustHaves,
    d.must_haves,
  ]
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c
  }
  for (const c of candidates) {
    if (Array.isArray(c)) return c
  }
  return []
}

function normalizeMustHaves(d: Record<string, unknown>): MustHaveItem[] {
  const raw = coerceMustHavesArray(d)
  const out: MustHaveItem[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const o = item as Record<string, unknown>
    const requirement = String(
      o.requirement ?? o.req ?? o.name ?? o.mustHave ?? ''
    ).trim()
    const statusRaw = String(o.status ?? 'partial').toLowerCase()
    const status: MustHaveItem['status'] =
      statusRaw === 'met' || statusRaw === 'missing' || statusRaw === 'partial'
        ? statusRaw
        : 'partial'
    const ev = o.evidence ?? o.evidence_quote ?? o.note
    const evidence =
      ev === null || ev === undefined || String(ev).trim() === ''
        ? null
        : String(ev)
    if (requirement) out.push({ requirement, status, evidence })
  }
  return out
}

function normalizeSuggestedReplacements(
  d: Record<string, unknown>
): SuggestedReplacement[] {
  const raw = coerceSuggestedReplacementsArray(d)
  const out: SuggestedReplacement[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const o = item as Record<string, unknown>
    const section = String(o.section ?? o.Section ?? '')
    const original = String(
      o.original ?? o.original_text ?? o.source_text ?? ''
    ).trim()
    const rewritten = String(
      o.rewritten ?? o.rewrite ?? o.replacement ?? o.rewritten_text ?? ''
    ).trim()
    const reason = String(o.reason ?? o.rationale ?? '').trim()
    const impactRaw = o.impactGain ?? o.impact_gain
    let impactGain: number | undefined
    if (impactRaw !== undefined && impactRaw !== null && impactRaw !== '') {
      const n = Number(impactRaw)
      if (Number.isFinite(n)) {
        const c = Math.min(15, Math.max(1, Math.round(n)))
        impactGain = c
      }
    }
    if (original && rewritten) {
      out.push({
        section,
        original,
        rewritten,
        reason,
        ...(impactGain !== undefined ? { impactGain } : {}),
      })
    }
  }
  return out
}

function normalizeAnalysisResult(data: unknown): AnalysisResult {
  const d = data as Record<string, unknown> | null
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    throw new Error('Analysis response was not a JSON object')
  }

  const projRaw =
    (d.projectedScores as Record<string, unknown> | undefined) ??
    (d.projected_scores as Record<string, unknown> | undefined)
  const projectedScores =
    projRaw && typeof projRaw === 'object' && !Array.isArray(projRaw)
      ? {
          overallMatch: Math.min(
            100,
            Math.max(
              0,
              Math.round(
                Number(projRaw.overallMatch ?? projRaw.overall_match) || 0
              )
            )
          ),
          atsScore: Math.min(
            100,
            Math.max(
              0,
              Math.round(Number(projRaw.atsScore ?? projRaw.ats_score) || 0)
            )
          ),
          impactScore: Math.min(
            100,
            Math.max(
              0,
              Math.round(
                Number(projRaw.impactScore ?? projRaw.impact_score) || 0
              )
            )
          ),
        }
      : undefined

  return {
    roleTitle: String(d.roleTitle ?? d.role_title ?? ''),
    seniorityLevel: String(d.seniorityLevel ?? d.seniority_level ?? ''),
    domain: String(d.domain ?? ''),
    overallMatch: Math.min(
      100,
      Math.max(0, Math.round(Number(d.overallMatch ?? d.overall_match) || 0))
    ),
    atsScore: Math.min(
      100,
      Math.max(0, Math.round(Number(d.atsScore ?? d.ats_score) || 0))
    ),
    impactScore: Math.min(
      100,
      Math.max(0, Math.round(Number(d.impactScore ?? d.impact_score) || 0))
    ),
    completenessScore: Math.min(
      100,
      Math.max(
        0,
        Math.round(Number(d.completenessScore ?? d.completeness_score) || 0)
      )
    ),
    matchSummary: String(d.matchSummary ?? d.match_summary ?? ''),
    mustHavesAssessment: normalizeMustHaves(d),
    keywordsPresent: Array.isArray(d.keywordsPresent)
      ? (d.keywordsPresent as string[])
      : [],
    keywordsPartial: Array.isArray(d.keywordsPartial)
      ? (d.keywordsPartial as string[])
      : [],
    keywordsMissing: Array.isArray(d.keywordsMissing)
      ? (d.keywordsMissing as string[])
      : [],
    weakVerbs: Array.isArray(d.weakVerbs)
      ? (d.weakVerbs as AnalysisResult['weakVerbs'])
      : [],
    impactLanguageSummary: String(
      d.impactLanguageSummary ?? d.impact_language_summary ?? ''
    ),
    sections: normalizeResumeSections(d),
    suggestedReplacements: normalizeSuggestedReplacements(d),
    projectedScores,
  }
}

/** Parse model output → structured analysis (CPU-heavy; prefer parseAnalysisFromRawAsync on the UI thread). */
export function parseAnalysisFromRaw(raw: string): AnalysisResult {
  const jsonStr = extractRawJsonText(raw)
  const parsed = parseJsonToUnknown(jsonStr, raw)
  return normalizeAnalysisResult(parsed)
}

/** Raw string → parsed JSON value (for merging dual-pass responses). */
export function parseRawToUnknown(raw: string): unknown {
  const jsonStr = extractRawJsonText(raw)
  return parseJsonToUnknown(jsonStr, raw)
}

/**
 * Merge parallel core + rewrite JSON strings into one normalized JSON string
 * (same shape as single-pass `parseAnalysisFromRaw` input).
 */
export function mergeDualAnalysisRaw(coreRaw: string, rewriteRaw: string): string {
  const c = parseRawToUnknown(coreRaw)
  const r = parseRawToUnknown(rewriteRaw)
  if (!c || typeof c !== 'object' || Array.isArray(c)) {
    throw new Error('Core analysis was not a JSON object')
  }
  if (!r || typeof r !== 'object' || Array.isArray(r)) {
    throw new Error('Rewrite analysis was not a JSON object')
  }
  const merged = {
    ...(c as Record<string, unknown>),
    ...(r as Record<string, unknown>),
  }
  return JSON.stringify(normalizeAnalysisResult(merged))
}
