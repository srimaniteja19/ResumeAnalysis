import { useAppStore } from '@/store/useAppStore'
import { Textarea } from '@/components/ui/textarea'

export function JobDescriptionInput() {
  const jobDescription = useAppStore((s) => s.jobDescription)
  const setJobDescription = useAppStore((s) => s.setJobDescription)

  return (
    <div className="rounded-lg border-2 border-border bg-card p-4 shadow-card">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
        Job description
      </p>
      <Textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the full job description. More detail yields a sharper match analysis."
        className="h-56 resize-y font-sans text-sm leading-relaxed"
      />
      <p className="mt-2 text-right font-mono text-xs text-muted">
        {jobDescription.length} chars
      </p>
    </div>
  )
}
