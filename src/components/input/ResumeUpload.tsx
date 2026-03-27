import { useCallback, useState } from 'react'
import { ResumePageFocusControls } from '@/components/input/ResumePageFocusControls'
import { BlobAlienMascot } from '@/components/illustrations/SciFiHeroArt'
import { useAppStore } from '@/store/useAppStore'
import { extractTextFromPDF } from '@/lib/pdf'
import { cn } from '@/lib/utils'

type UploadStatus = 'idle' | 'loading' | 'loaded' | 'error'

export function ResumeUpload() {
  const setResumeFile = useAppStore((s) => s.setResumeFile)
  const resumeFileName = useAppStore((s) => s.resumeFileName)
  const resumePageCount = useAppStore((s) => s.resumePageCount)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [message, setMessage] = useState<string>('')

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      setMessage('')
      setStatus('loading')
      try {
        const { text, pageCount, pageTexts } = await extractTextFromPDF(file)
        setResumeFile(file.name, pageCount, text, pageTexts)
        setStatus('loaded')
      } catch (e) {
        setStatus('error')
        setMessage((e as Error).message)
      }
    },
    [setResumeFile]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    void handleFile(file)
  }

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    void handleFile(file)
  }

  const loaded = status === 'loaded' && resumeFileName

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-border bg-card p-4 shadow-card transition-colors',
        status === 'error'
          ? 'border-danger/60'
          : loaded
            ? 'border-success/50'
            : 'border-border'
      )}
    >
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
        Resume (PDF)
      </p>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={cn(
          'relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border-[3px] border-dashed border-border px-4 py-8 text-center transition-colors',
          status === 'loading' && 'pointer-events-none opacity-70',
            status === 'error'
            ? 'border-danger/40 bg-danger/5'
            : loaded
              ? 'border-success/30 bg-success/5'
              : 'border-border hover:border-cyan hover:bg-accent/40'
        )}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          id="resume-pdf-input"
          onChange={onSelect}
        />
        {!loaded && status !== 'loading' && status !== 'error' && (
          <BlobAlienMascot className="pointer-events-none absolute bottom-1 right-2 h-12 w-[3.5rem] opacity-80 sm:h-14 sm:w-[4rem] text-omni" />
        )}
        <label
          htmlFor="resume-pdf-input"
          className="cursor-pointer space-y-2"
        >
          {status === 'loading' ? (
            <p className="font-mono text-sm text-cyan animate-pulse">
              Extracting PDF…
            </p>
          ) : loaded ? (
            <>
              <p className="font-mono text-sm font-bold text-success">
                {resumeFileName}
              </p>
              <p className="font-mono text-xs text-dim">
                {resumePageCount} page{resumePageCount !== 1 ? 's' : ''}{' '}
                extracted
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-lg text-foreground">
                Drop PDF here or click to upload
              </p>
              <p className="font-mono text-xs text-dim">Max 10MB · PDF only</p>
            </>
          )}
        </label>
      </div>
      {status === 'error' && message && (
        <p className="mt-2 font-mono text-xs text-danger">⚠ {message}</p>
      )}
      <ResumePageFocusControls />
    </div>
  )
}
