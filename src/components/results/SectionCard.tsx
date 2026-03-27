import { memo } from 'react'
import type { ResumeSection } from '@/types'
import { Badge } from '@/components/ui/badge'
import { getBadgeVariant } from '@/lib/utils'

interface SectionCardProps {
  section: ResumeSection
  index: number
}

function SectionCardComponent({ section, index }: SectionCardProps) {
  const variant = getBadgeVariant(section.score)

  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-lg border-2 border-border bg-card shadow-card animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <header
        className={`flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-3 ${
          ['bg-pastel-lavender/80', 'bg-pastel-peach/80', 'bg-pastel-rose/80'][index % 3]
        }`}
      >
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">
          {section.name}
        </h3>
        <Badge variant={variant}>{section.score}%</Badge>
      </header>
      <div className="relative max-h-[6rem] flex-1 overflow-hidden px-4 py-3">
        <p className="text-sm leading-relaxed text-foreground/85">
          {section.contentPreview}
        </p>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card via-card/80 to-transparent"
          aria-hidden
        />
      </div>
      <div className="mx-4 mb-3 rounded-md border-l-2 border-success/70 bg-success/5 px-3 py-2 text-sm text-foreground/90">
        <span className="font-mono text-[10px] uppercase tracking-wider text-success">
          Strengths
        </span>
        <p className="mt-1">{section.strengths}</p>
      </div>
      <div className="border-t border-border/60 px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-dim">
          Suggestions
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm text-dim marker:text-cyan">
          {(section.suggestions ?? []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </article>
  )
}

export const SectionCard = memo(SectionCardComponent)
