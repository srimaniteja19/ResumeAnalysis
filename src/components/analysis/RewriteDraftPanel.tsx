import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'
import { applySuggestionsToResume } from '@/lib/mergeResumeDraft'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { copyTextToClipboard } from '@/lib/analysisReportContent'

export function RewriteDraftPanel() {
  const [copied, setCopied] = useState(false)
  const { resumeText, analysisResult, appliedSuggestionIndexes } = useAppStore(
    useShallow((s) => ({
      resumeText: s.resumeText,
      analysisResult: s.analysisResult,
      appliedSuggestionIndexes: s.appliedSuggestionIndexes,
    }))
  )

  const merged = useMemo(() => {
    if (!analysisResult?.suggestedReplacements?.length) return resumeText
    return applySuggestionsToResume(
      resumeText,
      analysisResult.suggestedReplacements,
      appliedSuggestionIndexes
    )
  }, [resumeText, analysisResult, appliedSuggestionIndexes])

  if (!analysisResult || !appliedSuggestionIndexes.length) return null

  return (
    <section className="rounded-xl border-2 border-cyan/40 bg-cyan/5 p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-foreground">
            Résumé draft preview
          </h2>
          <p className="mt-1 font-mono text-[10px] text-dim">
            In-memory merge of <span className="text-cyan">{appliedSuggestionIndexes.length}</span>{' '}
            applied line(s). Not saved to PDF — copy and paste into your doc.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-2 border-black font-mono text-xs shadow-comic-sm"
          onClick={() =>
            void copyTextToClipboard(merged).then(() => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 2000)
            })
          }
        >
          {copied ? 'Copied' : 'Copy merged draft'}
        </Button>
      </div>

      <Tabs defaultValue="merged" className="w-full">
        <TabsList className="mb-3 w-full justify-start overflow-x-auto">
          <TabsTrigger value="merged" className="font-mono text-xs">
            Merged scroll
          </TabsTrigger>
          <TabsTrigger value="split" className="font-mono text-xs">
            Side-by-side
          </TabsTrigger>
        </TabsList>
        <TabsContent value="merged">
          <pre className="max-h-[min(70vh,520px)] overflow-auto whitespace-pre-wrap rounded-lg border-2 border-border bg-bg2/80 p-4 font-sans text-sm leading-relaxed text-foreground">
            {merged}
          </pre>
        </TabsContent>
        <TabsContent value="split">
          <div className="grid max-h-[min(70vh,520px)] gap-3 overflow-hidden md:grid-cols-2">
            <div className="flex min-h-0 flex-col rounded-lg border-2 border-border bg-danger/5">
              <p className="shrink-0 border-b border-border bg-danger/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-danger">
                Original
              </p>
              <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-3 font-sans text-xs leading-relaxed">
                {resumeText}
              </pre>
            </div>
            <div className="flex min-h-0 flex-col rounded-lg border-2 border-border bg-success/5">
              <p className="shrink-0 border-b border-border bg-success/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-success">
                With applied rewrites
              </p>
              <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-3 font-sans text-xs leading-relaxed">
                {merged}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
