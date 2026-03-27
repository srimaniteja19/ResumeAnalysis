import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/badge'

export function ImpactLanguageAudit() {
  const analysisResult = useAppStore((s) => s.analysisResult)
  if (!analysisResult) return null

  const { impactLanguageSummary, weakVerbs } = analysisResult

  if (!impactLanguageSummary && !(weakVerbs?.length)) {
    return (
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold">Impact language audit</h2>
        <div className="rounded-lg border border-border bg-bg2/40 p-4 font-sans text-sm text-dim">
          No impact-language audit in this response. Re-run analysis for weak-verb findings.
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-bold">Impact language audit</h2>
      {impactLanguageSummary && (
        <p className="rounded-lg border border-border bg-card/60 p-4 text-sm leading-relaxed text-foreground/90 backdrop-blur-sm">
          {impactLanguageSummary}
        </p>
      )}
      {weakVerbs && weakVerbs.length > 0 && (
        <ul className="space-y-2">
          {weakVerbs.map((v, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border/80 bg-bg2/50 px-3 py-2 font-mono text-xs"
            >
              <Badge
                variant="danger"
                className="font-normal normal-case"
              >
                {v.weak}
              </Badge>
              <span className="text-dim">in</span>
              <span className="max-w-md truncate text-dim italic">
                “{v.context}”
              </span>
              <span className="text-dim">→</span>
              <Badge
                variant="success"
                className="font-normal normal-case"
              >
                {v.strong}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
