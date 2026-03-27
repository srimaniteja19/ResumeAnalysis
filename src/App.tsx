import {
  lazy,
  startTransition,
  Suspense,
  useRef,
  useState,
} from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Header } from './components/layout/Header'
import { ProviderBar } from './components/layout/ProviderBar'
import { ResumeUpload } from './components/input/ResumeUpload'
import { JobDescriptionInput } from './components/input/JobDescriptionInput'
import { AnalysisOptionsBar } from './components/analysis/AnalysisOptionsBar'
import { SessionHistoryPanel } from './components/analysis/SessionHistoryPanel'

const AnalysisResultsPanel = lazy(async () => {
  const m = await import('./components/results/AnalysisResultsPanel')
  return { default: m.AnalysisResultsPanel }
})
import {
  ComicBurstOutline,
  DnaHelixStrip,
  HexOpsBadge,
} from './components/illustrations/SciFiHeroArt'
import { Button } from './components/ui/button'
import { useAppStore } from './store/useAppStore'
import { fetchAnalysisRaw } from './lib/ai'
import { parseAnalysisFromRawAsync } from './lib/analysisParseAsync'
import { buildResumeTextForModel } from './lib/resumeScope'
import { saveHistoryRecord } from './lib/sessionHistoryDb'

const LOADING_STEPS = [
  'Scanning résumé DNA strands…',
  'Decrypting JD alien dialect…',
  'Calibrating Omnitrix match matrix…',
  'Boosting keyword plasma…',
  'Hunting weak verbs in the wild…',
  'Forging line-level battle upgrades…',
  'Patching Plumber intelligence brief…',
]

export default function App() {
  const resultsRef = useRef<HTMLDivElement>(null)
  const [isParsingResult, setIsParsingResult] = useState(false)
  const {
    provider,
    apiKey,
    model,
    resumeText,
    resumePageTexts,
    resumePageCount,
    resumeFileName,
    resumePageFocus,
    analysisTone,
    jobDescription,
    isAnalyzing,
    loadingStep,
    analysisResult,
    error,
    setIsAnalyzing,
    setLoadingStep,
    setAnalysisResult,
    setError,
  } = useAppStore(
    useShallow((s) => ({
      provider: s.provider,
      apiKey: s.apiKey,
      model: s.model,
      resumeText: s.resumeText,
      resumePageTexts: s.resumePageTexts,
      resumePageCount: s.resumePageCount,
      resumeFileName: s.resumeFileName,
      resumePageFocus: s.resumePageFocus,
      analysisTone: s.analysisTone,
      jobDescription: s.jobDescription,
      isAnalyzing: s.isAnalyzing,
      loadingStep: s.loadingStep,
      analysisResult: s.analysisResult,
      error: s.error,
      setIsAnalyzing: s.setIsAnalyzing,
      setLoadingStep: s.setLoadingStep,
      setAnalysisResult: s.setAnalysisResult,
      setError: s.setError,
    }))
  )

  const isReady = resumeText.length > 0 && jobDescription.trim().length > 50

  async function handleAnalyze() {
    setError(null)
    setIsAnalyzing(true)
    setIsParsingResult(false)

    let stepIdx = 0
    setLoadingStep(LOADING_STEPS[0])
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % LOADING_STEPS.length
      setLoadingStep(LOADING_STEPS[stepIdx])
    }, 2000)

    let raw = ''
    try {
      const { modelText, resumeExtraNote } = buildResumeTextForModel(
        resumeText,
        resumePageTexts,
        resumePageCount,
        resumePageFocus
      )
      raw = await fetchAnalysisRaw(
        provider,
        apiKey,
        model,
        modelText,
        jobDescription,
        analysisTone,
        resumeExtraNote
      )
      clearInterval(interval)
      setIsAnalyzing(false)
      setIsParsingResult(true)
      const result = await parseAnalysisFromRawAsync(raw)
      startTransition(() => {
        setAnalysisResult(result)
      })
      void saveHistoryRecord({
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        jobDescription,
        resumeFileName,
        resumePageCount,
        resumeText,
        resumePageTexts,
        analysisResult: result,
        appliedSuggestionIndexes: [],
        analysisTone,
        resumePageFocus: {
          emphasizeFirstPage: resumePageFocus.emphasizeFirstPage,
          ignoredPages: [...resumePageFocus.ignoredPages],
        },
        provider,
        model,
      }).then(() => {
        window.dispatchEvent(new Event('roleweaver-history-updated'))
      })
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      if (raw) console.error('Raw AI response:', raw)
      setError((err as Error).message)
    } finally {
      clearInterval(interval)
      setIsAnalyzing(false)
      setIsParsingResult(false)
    }
  }

  return (
    <div className="relative z-10 min-h-screen">
      {isAnalyzing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-void/90 px-4 backdrop-blur-md">
          <div className="relative rounded-2xl border-[3px] border-black bg-gradient-to-b from-bg2 via-white to-bg3 px-8 py-8 shadow-[8px_8px_0_0_#0a0a0a] md:px-12 md:py-10">
            <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full border-[3px] border-black bg-gradient-to-br from-gray-700 to-black shadow-comic">
              <div className="absolute inset-2 animate-omni-dial rounded-full border-2 border-dashed border-omni/80" />
              <div className="absolute inset-[28%] rounded-full border border-black bg-omni shadow-omni-glow animate-omni-pulse" />
            </div>
            <p className="text-center font-display text-[10px] uppercase tracking-[0.4em] text-danger">
              transformation sequence
            </p>
            <p className="mt-1 text-center font-serif text-4xl tracking-wide md:text-5xl">
              <span className="text-voltage text-foreground">Role</span>
              <span className="text-voltage text-omni">Weaver</span>
            </p>
            <p className="mt-2 text-center font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-dim">
              do not remove watch · stay still
            </p>
          </div>
          <div className="h-4 w-80 overflow-hidden rounded-full border-[3px] border-black bg-dial-dark shadow-comic">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-omni to-lime-400 shadow-omni-glow animate-[loadBar_1.8s_ease-in-out_infinite]" />
          </div>
          <p className="max-w-sm text-center font-mono text-xs font-bold leading-relaxed tracking-wide text-bg2 after:ml-0.5 after:inline-block after:animate-blink after:content-['▋']">
            {loadingStep}
          </p>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-6 pb-16">
        <div
          className="pointer-events-none absolute -left-2 top-36 z-0 hidden text-border/30 sm:block md:-left-4 lg:top-44"
          aria-hidden
        >
          <DnaHelixStrip className="h-52 w-11 md:h-64" />
        </div>
        <div
          className="pointer-events-none absolute -right-2 top-[28rem] z-0 hidden flex-col items-end gap-0 text-amber/40 sm:flex md:-right-4 lg:top-[22rem]"
          aria-hidden
        >
          <HexOpsBadge className="h-14 w-[4.5rem] rotate-[8deg] drop-shadow-sm" />
          <ComicBurstOutline className="-mr-1 h-20 w-20 -translate-y-3 text-omni/35" />
        </div>
        <Header />
        <ProviderBar />
        <div className="mb-5 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AnalysisOptionsBar />
          </div>
          <div className="lg:col-span-1">
            <SessionHistoryPanel />
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ResumeUpload />
          <JobDescriptionInput />
        </div>

        <Button
          onClick={() => void handleAnalyze()}
          disabled={!isReady || isAnalyzing || isParsingResult}
          className="h-14 w-full rounded-xl border-[3px] border-black bg-gradient-to-r from-lime-300 via-slime to-emerald-400 font-display text-sm uppercase tracking-[0.12em] text-black shadow-[6px_6px_0_0_#0a0a0a] transition-all duration-200 hover:translate-y-[-3px] hover:shadow-[8px_8px_0_0_#0a0a0a] hover:brightness-110 active:translate-y-0 active:shadow-comic disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-comic"
        >
          {isAnalyzing
            ? '⚡ Analyzing...'
            : isParsingResult
              ? '⚡ Formatting results…'
              : isReady
                ? '⚡ Analyze Resume Against Job Description'
                : '⬡ Load Resume & Job Description to Begin'}
        </Button>

        {isParsingResult && (
          <p className="mt-2 text-center font-mono text-[10px] tracking-wider text-dim">
            Parsing and building the report UI…
          </p>
        )}

        {error && (
          <div className="mt-3 rounded-lg border-2 border-border bg-pastel-rose p-4 font-mono text-xs font-bold tracking-wide text-danger shadow-comic-sm">
            Hold up! {error}
          </div>
        )}

        {analysisResult && (
          <div ref={resultsRef}>
            <Suspense
              fallback={
                <p className="mt-10 text-center font-mono text-xs text-dim">
                  Loading report…
                </p>
              }
            >
              <AnalysisResultsPanel />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}
