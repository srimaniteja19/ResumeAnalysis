import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'
import { getScoreColor, getScoreHex } from '@/lib/utils'
import { computeAppliedScores } from '@/lib/scoreProjection'

const METRICS: {
  key: 'overallMatch' | 'atsScore' | 'impactScore' | 'completenessScore'
  label: string
}[] = [
  { key: 'overallMatch', label: 'Overall match' },
  { key: 'atsScore', label: 'ATS keywords' },
  { key: 'impactScore', label: 'Impact language' },
  { key: 'completenessScore', label: 'Completeness' },
]

export function ScoreDashboard() {
  const { analysisResult, appliedSuggestionIndexes } = useAppStore(
    useShallow((s) => ({
      analysisResult: s.analysisResult,
      appliedSuggestionIndexes: s.appliedSuggestionIndexes,
    }))
  )
  const [animate, setAnimate] = useState(false)

  const suggestions = analysisResult?.suggestedReplacements

  const appliedPreview = useMemo(() => {
    if (
      !analysisResult ||
      !suggestions?.length ||
      appliedSuggestionIndexes.length === 0
    )
      return null
    return computeAppliedScores(
      analysisResult,
      suggestions,
      appliedSuggestionIndexes
    )
  }, [analysisResult, suggestions, appliedSuggestionIndexes])

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [analysisResult, appliedPreview])

  if (!analysisResult) return null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {METRICS.map(({ key, label }) => {
        let score = Math.min(
          100,
          Math.max(0, Math.round(Number(analysisResult[key]) || 0))
        )
        if (
          appliedPreview &&
          (key === 'overallMatch' ||
            key === 'atsScore' ||
            key === 'impactScore')
        ) {
          score = appliedPreview[key]
        }
        const colorClass = getScoreColor(score)
        const hex = getScoreHex(score)

        return (
          <div
            key={key}
            className="rounded-lg border border-border bg-card/70 p-4 backdrop-blur-sm"
          >
            <p
              className={`font-serif text-4xl font-black tabular-nums ${colorClass}`}
              style={{ textShadow: `0 0 24px ${hex}33` }}
            >
              {score}%
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              {label}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full ${animate ? 'animate-bar-fill' : 'w-0'}`}
                style={
                  {
                    '--bar-width': `${score}%`,
                    backgroundColor: hex,
                    boxShadow: `0 0 10px ${hex}55`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
