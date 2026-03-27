import { useAppStore } from '@/store/useAppStore'
import { SectionCard } from '@/components/results/SectionCard'

export function SectionBreakdown() {
  const analysisResult = useAppStore((s) => s.analysisResult)
  if (!analysisResult) return null

  if (!analysisResult.sections?.length) {
    return (
      <div className="rounded-lg border border-border bg-bg2/40 p-4 font-sans text-sm text-dim">
        No per-section scores were returned. Try <span className="text-cyan">Analyze</span> again
        or another model.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {analysisResult.sections.map((section, index) => (
        <SectionCard
          key={`${section.name}-${index}`}
          section={section}
          index={index}
        />
      ))}
    </div>
  )
}
