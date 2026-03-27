import { jsPDF } from 'jspdf'
import {
  buildAppliedRewritesText,
  buildAtsSummaryText,
  buildKeywordsListText,
} from '@/lib/analysisReportContent'
import type { AnalysisResult } from '@/types'

const MARGIN = 14
const LINE_H = 6
const MAX_W = 180

function addWrapped(
  doc: jsPDF,
  text: string,
  y: { current: number },
  size = 10
): void {
  const lines = doc.splitTextToSize(text, MAX_W)
  doc.setFontSize(size)
  for (const line of lines) {
    if (y.current > 280) {
      doc.addPage()
      y.current = MARGIN
    }
    doc.text(line, MARGIN, y.current)
    y.current += LINE_H
  }
}

export function downloadAnalysisPdf(args: {
  result: AnalysisResult
  appliedIndexes: number[]
  resumeFileName: string
  analysisTone: string
}): void {
  const { result, appliedIndexes, resumeFileName, analysisTone } = args
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const y = { current: MARGIN }

  doc.setFontSize(16)
  doc.text('RoleWeaver — analysis report', MARGIN, y.current)
  y.current += LINE_H * 2

  doc.setFontSize(9)
  addWrapped(
    doc,
    `Source: ${resumeFileName || 'n/a'} · Tone: ${analysisTone} · Local export (no server).`,
    y,
    9
  )
  y.current += LINE_H

  doc.setFontSize(12)
  doc.text('Scores', MARGIN, y.current)
  y.current += LINE_H * 1.4
  doc.setFontSize(10)
  addWrapped(
    doc,
    `JD match ${Math.round(result.overallMatch)}% · ATS ${Math.round(result.atsScore)}% · Impact ${Math.round(result.impactScore)}% · Completeness ${Math.round(result.completenessScore)}%`,
    y
  )

  doc.setFontSize(12)
  if (y.current > 250) {
    doc.addPage()
    y.current = MARGIN
  }
  doc.text('ATS-oriented summary', MARGIN, y.current)
  y.current += LINE_H * 1.4
  doc.setFontSize(10)
  addWrapped(doc, buildAtsSummaryText(result), y)

  doc.setFontSize(12)
  if (y.current > 240) {
    doc.addPage()
    y.current = MARGIN
  }
  doc.text('Keywords', MARGIN, y.current)
  y.current += LINE_H * 1.4
  doc.setFontSize(10)
  addWrapped(doc, buildKeywordsListText(result) || '(none listed)', y)

  const rew = buildAppliedRewritesText(result, appliedIndexes)
  if (rew) {
    doc.setFontSize(12)
    if (y.current > 230) {
      doc.addPage()
      y.current = MARGIN
    }
    doc.text('Chosen rewrites', MARGIN, y.current)
    y.current += LINE_H * 1.4
    doc.setFontSize(10)
    addWrapped(doc, rew, y)
  }

  const safeName = (resumeFileName || 'report').replace(/[^\w\-./]+/g, '_').slice(0, 40)
  doc.save(`roleweaver-report-${safeName}.pdf`)
}
