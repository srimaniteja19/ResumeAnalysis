import type { AnalysisResult } from '@/types'

export function buildKeywordsListText(r: AnalysisResult): string {
  const lines: string[] = []
  if (r.keywordsPresent?.length) {
    lines.push('Present (strong match):')
    lines.push(...r.keywordsPresent.map((k) => `• ${k}`))
  }
  if (r.keywordsPartial?.length) {
    lines.push('')
    lines.push('Partial / adjacent:')
    lines.push(...r.keywordsPartial.map((k) => `• ${k}`))
  }
  if (r.keywordsMissing?.length) {
    lines.push('')
    lines.push('Missing / add if truthful:')
    lines.push(...r.keywordsMissing.map((k) => `• ${k}`))
  }
  return lines.join('\n').trim()
}

export function buildAtsSummaryText(r: AnalysisResult): string {
  const lines: string[] = [
    `Role: ${r.roleTitle} · ${r.seniorityLevel} · ${r.domain}`,
    '',
    `Scores — JD match ${Math.round(r.overallMatch)}% · ATS ${Math.round(r.atsScore)}% · Impact ${Math.round(r.impactScore)}% · Complete ${Math.round(r.completenessScore)}%`,
    '',
    'Summary:',
    r.matchSummary,
    '',
    'Must-haves:',
  ]
  for (const m of r.mustHavesAssessment ?? []) {
    lines.push(`• [${m.status}] ${m.requirement}`)
    if (m.evidence) lines.push(`  Evidence: ${m.evidence}`)
  }
  lines.push('')
  lines.push('Impact language:')
  lines.push(r.impactLanguageSummary)
  return lines.join('\n').trim()
}

export function buildAppliedRewritesText(
  r: AnalysisResult,
  appliedIndexes: number[]
): string {
  const items = r.suggestedReplacements ?? []
  if (!items.length || !appliedIndexes.length) return ''
  const lines: string[] = ['Chosen rewrites (review before sending):', '']
  for (const i of appliedIndexes) {
    const item = items[i]
    if (!item) continue
    lines.push(`## ${item.section}`)
    lines.push(`Before: ${item.original}`)
    lines.push(`After: ${item.rewritten}`)
    lines.push(`Why: ${item.reason}`)
    lines.push('')
  }
  return lines.join('\n').trim()
}

export function buildMarkdownReport(args: {
  result: AnalysisResult
  appliedIndexes: number[]
  resumeFileName: string
  analysisTone: string
  jobDescriptionPreview: string
}): string {
  const { result, appliedIndexes, resumeFileName, analysisTone, jobDescriptionPreview } =
    args
  const parts: string[] = [
    '# RoleWeaver — analysis report',
    '',
    `Generated locally · Tone: **${analysisTone}** · Source file: ${resumeFileName || 'n/a'}`,
    '',
    '## Job description (preview)',
    jobDescriptionPreview.slice(0, 2000),
    '',
    '## Scores',
    '',
    '| Metric | Score |',
    '|--------|-------|',
    `| JD match | ${Math.round(result.overallMatch)} |`,
    `| ATS | ${Math.round(result.atsScore)} |`,
    `| Impact | ${Math.round(result.impactScore)} |`,
    `| Completeness | ${Math.round(result.completenessScore)} |`,
    '',
    '## Summary',
    result.matchSummary,
    '',
    '## Must-haves',
  ]
  for (const m of result.mustHavesAssessment ?? []) {
    parts.push(`- **${m.status}** — ${m.requirement}`)
    if (m.evidence) parts.push(`  - Evidence: ${m.evidence}`)
  }
  parts.push('', '## Keywords', '', buildKeywordsListText(result))

  const rew = buildAppliedRewritesText(result, appliedIndexes)
  if (rew) parts.push('', '## Applied line rewrites', '', rew)

  parts.push(
    '',
    '## Sections (snapshot)',
    ...result.sections.flatMap((s) => [
      '',
      `### ${s.name} (${s.score})`,
      s.strengths,
      ...(Array.isArray(s.suggestions) ? s.suggestions : []).map(
        (x) => `- ${x}`
      ),
    ])
  )

  return parts.join('\n')
}

export function downloadMarkdownFile(filename: string, markdown: string): void {
  const blob = new Blob([markdown], {
    type: 'text/markdown;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (!text) throw new Error('Nothing to copy.')
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}
