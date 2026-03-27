import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'

export function KeywordGapMap() {
  const analysisResult = useAppStore((s) => s.analysisResult)
  if (!analysisResult) return null

  const present = analysisResult.keywordsPresent ?? []
  const partial = analysisResult.keywordsPartial ?? []
  const missing = analysisResult.keywordsMissing ?? []

  if (!present.length && !partial.length && !missing.length) {
    return (
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold">Keyword &amp; skill map</h2>
        <div className="rounded-lg border border-border bg-bg2/40 p-4 font-sans text-sm text-dim">
          No keyword buckets in this response. Re-run{' '}
          <span className="text-cyan">Analyze</span>.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-bold">Keyword &amp; skill map</h2>
      <div className="flex flex-wrap gap-4 font-mono text-xs text-dim">
        <span className="text-success">✓ Present</span>
        <span className="text-amber">~ Partial</span>
        <span className="text-danger">✗ Missing</span>
      </div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card/60 p-4 backdrop-blur-sm">
        {present.map((k) => (
          <Badge
            key={`p-${k}`}
            variant="success"
            className="font-normal normal-case tracking-normal"
          >
            ✓ {k}
          </Badge>
        ))}
        {partial.map((k) => (
          <Badge
            key={`a-${k}`}
            variant="warning"
            className="font-normal normal-case tracking-normal"
          >
            ~ {k}
          </Badge>
        ))}
        {missing.map((k) => (
          <Badge
            key={`m-${k}`}
            variant="danger"
            className="font-normal normal-case tracking-normal"
          >
            ✗ {k}
          </Badge>
        ))}
      </div>
    </section>
  )
}
