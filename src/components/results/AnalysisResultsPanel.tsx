import { useAppStore } from '@/store/useAppStore'
import { RoleBanner } from '@/components/results/RoleBanner'
import { MustHavesTable } from '@/components/results/MustHavesTable'
import { ScoreDashboard } from '@/components/results/ScoreDashboard'
import { KeywordGapMap } from '@/components/results/KeywordGapMap'
import { ImpactLanguageAudit } from '@/components/results/ImpactLanguageAudit'
import { SuggestedReplacements } from '@/components/results/SuggestedReplacements'
import { SectionBreakdown } from '@/components/results/SectionBreakdown'

/**
 * Bundled for `React.lazy` so the main bundle does not parse these modules until
 * after the first successful analysis (smaller main-thread work on first paint).
 */
export function AnalysisResultsPanel() {
  const analysisResult = useAppStore((s) => s.analysisResult)
  if (!analysisResult) return null

  return (
    <div className="mt-10 animate-fade-up space-y-5">
      <RoleBanner />
      <MustHavesTable />
      <ScoreDashboard />
      <KeywordGapMap />
      <ImpactLanguageAudit />
      <div>
        <h2 className="mb-4 font-display text-xl uppercase tracking-wide text-foreground drop-shadow-[2px_2px_0_#fff]">
          Mission log · section scan
        </h2>
        <SectionBreakdown />
      </div>
      <SuggestedReplacements />
    </div>
  )
}
