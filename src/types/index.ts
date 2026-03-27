export type Provider = 'claude' | 'openai' | 'gemini'

/** LLM instruction bias: conservative vs bolder (still no invented facts). */
export type AnalysisTone = 'strict' | 'creative'

/** When PDF yields per-page text, control what is sent to the model. */
export interface ResumePageFocusSettings {
  emphasizeFirstPage: boolean
  /** 1-based page indices excluded from the extract sent for analysis. */
  ignoredPages: number[]
}

export interface ProviderConfig {
  label: string
  placeholder: string
  models: { value: string; label: string }[]
}

export interface MustHaveItem {
  requirement: string
  status: 'met' | 'partial' | 'missing'
  evidence: string | null
}

export interface WeakVerb {
  weak: string
  context: string
  strong: string
}

export interface ResumeSection {
  name: string
  score: number
  contentPreview: string
  strengths: string
  suggestions: string[]
}

export interface SuggestedReplacement {
  section: string
  original: string
  rewritten: string
  reason: string
  /** Estimated overall-style lift if this single change were applied (1–15). */
  impactGain?: number
}

export interface ProjectedScores {
  overallMatch: number
  atsScore: number
  impactScore: number
}

export interface AnalysisResult {
  roleTitle: string
  seniorityLevel: string
  domain: string
  overallMatch: number
  atsScore: number
  impactScore: number
  completenessScore: number
  matchSummary: string
  mustHavesAssessment: MustHaveItem[]
  keywordsPresent: string[]
  keywordsPartial: string[]
  keywordsMissing: string[]
  weakVerbs: WeakVerb[]
  impactLanguageSummary: string
  sections: ResumeSection[]
  suggestedReplacements?: SuggestedReplacement[]
  /** Model-estimated scores if every suggested replacement were applied. */
  projectedScores?: ProjectedScores
}

export interface AppState {
  // Provider
  provider: Provider
  apiKey: string
  model: string
  /** When true, apiKey + provider + model are saved to localStorage on this device. */
  rememberApiKey: boolean
  setProvider: (p: Provider) => void
  setApiKey: (k: string) => void
  setModel: (m: string) => void
  setRememberApiKey: (remember: boolean) => void

  analysisTone: AnalysisTone
  setAnalysisTone: (t: AnalysisTone) => void

  // Inputs
  resumeText: string
  resumeFileName: string
  resumePageCount: number
  /** Normalized text per page (index 0 = page 1) when Source is PDF; empty if unknown. */
  resumePageTexts: string[]
  jobDescription: string
  resumePageFocus: ResumePageFocusSettings
  setResumeText: (t: string) => void
  setResumeFile: (
    name: string,
    pages: number,
    text: string,
    pageTexts?: string[]
  ) => void
  setJobDescription: (jd: string) => void
  setResumePageFocus: (f: ResumePageFocusSettings) => void
  setEmphasizeFirstResumePage: (v: boolean) => void
  toggleIgnoredResumePage: (page1Based: number) => void

  restoreSessionSnapshot: (snap: SessionSnapshot) => void

  // Analysis
  isAnalyzing: boolean
  loadingStep: string
  analysisResult: AnalysisResult | null
  error: string | null
  setIsAnalyzing: (v: boolean) => void
  setLoadingStep: (s: string) => void
  setAnalysisResult: (r: AnalysisResult) => void
  setError: (e: string | null) => void

  /** Indexes into suggestedReplacements the user marked as applied. */
  appliedSuggestionIndexes: number[]
  toggleAppliedSuggestion: (index: number) => void
}

/** Restores inputs + last report (local session / history). */
export interface SessionSnapshot {
  jobDescription: string
  resumeFileName: string
  resumePageCount: number
  resumeText: string
  resumePageTexts: string[]
  analysisResult: AnalysisResult
  appliedSuggestionIndexes: number[]
  analysisTone: AnalysisTone
  resumePageFocus: ResumePageFocusSettings
  provider: Provider
  model: string
}
