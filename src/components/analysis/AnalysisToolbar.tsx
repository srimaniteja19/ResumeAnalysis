import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import {
  buildAppliedRewritesText,
  buildAtsSummaryText,
  buildKeywordsListText,
  buildMarkdownReport,
  copyTextToClipboard,
  downloadMarkdownFile,
} from '@/lib/analysisReportContent'
import { downloadAnalysisPdf } from '@/lib/exportAnalysisPdf'

export function AnalysisToolbar() {
  const [notice, setNotice] = useState<string | null>(null)
  const {
    analysisResult,
    appliedSuggestionIndexes,
    resumeFileName,
    jobDescription,
    analysisTone,
  } = useAppStore(
    useShallow((s) => ({
      analysisResult: s.analysisResult,
      appliedSuggestionIndexes: s.appliedSuggestionIndexes,
      resumeFileName: s.resumeFileName,
      jobDescription: s.jobDescription,
      analysisTone: s.analysisTone,
    }))
  )

  if (!analysisResult) return null

  const flash = (msg: string) => {
    setNotice(msg)
    window.setTimeout(() => setNotice(null), 2200)
  }

  const md = buildMarkdownReport({
    result: analysisResult,
    appliedIndexes: appliedSuggestionIndexes,
    resumeFileName,
    analysisTone,
    jobDescriptionPreview: jobDescription,
  })

  const safe = (resumeFileName || 'report').replace(/[^\w\-./]+/g, '_').slice(0, 36)

  return (
    <div className="space-y-3 rounded-xl border-2 border-border bg-card/80 p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-sm uppercase tracking-wide text-foreground">
          Export &amp; copy
        </p>
        {notice && (
          <span className="font-mono text-[10px] font-bold text-success animate-pulse">
            {notice}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="border-2 border-border font-mono text-xs"
          onClick={() => {
            downloadMarkdownFile(`roleweaver-report-${safe}.md`, md)
            flash('Markdown downloaded')
          }}
        >
          Download Markdown
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-2 border-border font-mono text-xs"
          onClick={() => {
            downloadAnalysisPdf({
              result: analysisResult,
              appliedIndexes: appliedSuggestionIndexes,
              resumeFileName,
              analysisTone,
            })
            flash('PDF saved')
          }}
        >
          Download PDF
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="font-mono text-xs"
          onClick={() =>
            void copyTextToClipboard(
              buildAppliedRewritesText(analysisResult, appliedSuggestionIndexes)
            ).then(() => flash('Rewrites copied'))
          }
        >
          Copy applied rewrites
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="font-mono text-xs"
          onClick={() =>
            void copyTextToClipboard(buildKeywordsListText(analysisResult)).then(
              () => flash('Keywords copied')
            )
          }
        >
          Copy keyword lists
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="font-mono text-xs"
          onClick={() =>
            void copyTextToClipboard(buildAtsSummaryText(analysisResult)).then(
              () => flash('ATS summary copied')
            )
          }
        >
          Copy ATS summary
        </Button>
      </div>
      <p className="font-mono text-[9px] leading-relaxed text-dim">
        Exports include scores, must-haves, keywords, section notes, and only{' '}
        <span className="text-foreground">rewrites you marked applied</span>.
        Review everything before sharing.
      </p>
    </div>
  )
}
