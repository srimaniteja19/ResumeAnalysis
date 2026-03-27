export type Provider = 'claude' | 'openai' | 'gemini'

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

  // Inputs
  resumeText: string
  resumeFileName: string
  resumePageCount: number
  jobDescription: string
  setResumeText: (t: string) => void
  setResumeFile: (name: string, pages: number, text: string) => void
  setJobDescription: (jd: string) => void

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
