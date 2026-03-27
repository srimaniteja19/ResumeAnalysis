import { useAppStore } from '@/store/useAppStore'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  getStatusIcon,
  getStatusLabel,
  getStatusColor,
} from '@/lib/utils'
import type { MustHaveItem } from '@/types'

function statusVariant(
  status: MustHaveItem['status']
): 'success' | 'warning' | 'danger' {
  if (status === 'met') return 'success'
  if (status === 'partial') return 'warning'
  return 'danger'
}

export function MustHavesTable() {
  const analysisResult = useAppStore((s) => s.analysisResult)
  if (!analysisResult) return null

  if (!analysisResult.mustHavesAssessment?.length) {
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl font-bold">Must-have requirements</h2>
          <Separator className="max-w-[120px] flex-1 bg-border" />
        </div>
        <div className="rounded-lg border border-border bg-bg2/40 p-4 font-sans text-sm text-dim">
          No must-have table in this response. Re-run analysis or switch models if the job
          description lists clear requirements.
        </div>
      </section>
    )
  }

  const items = analysisResult.mustHavesAssessment

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-xl font-bold">Must-have requirements</h2>
        <Separator className="max-w-[120px] flex-1 bg-border" />
      </div>
      <ul className="space-y-2 rounded-lg border border-border bg-card/60 p-3 backdrop-blur-sm">
        {items.map((item, i) => (
          <li
            key={i}
            className="rounded-md border border-border/60 bg-bg2/40 p-3"
          >
            <div className="flex flex-wrap items-start gap-2">
              <Badge variant={statusVariant(item.status)}>
                {getStatusIcon(item.status)} {getStatusLabel(item.status)}
              </Badge>
              <p className="min-w-0 flex-1 font-sans text-sm text-foreground">
                {item.requirement}
              </p>
            </div>
            {item.evidence && (
              <p
                className="mt-2 border-l-2 border-dim/50 pl-3 font-sans text-xs italic text-dim"
                style={{ borderLeftColor: `${getStatusColor(item.status)}55` }}
              >
                {item.evidence}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
