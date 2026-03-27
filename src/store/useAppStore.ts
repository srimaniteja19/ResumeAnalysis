import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DEFAULT_MODEL_BY_PROVIDER } from '@/lib/providerModels'
import type {
  AnalysisTone,
  AppState,
  Provider,
  ResumePageFocusSettings,
} from '../types'

const STORAGE_KEY = 'roleweaver-settings-v1'

const defaultPageFocus = (): ResumePageFocusSettings => ({
  emphasizeFirstPage: false,
  ignoredPages: [],
})

type PersistedFields = Pick<
  AppState,
  'rememberApiKey' | 'apiKey' | 'provider' | 'model'
>

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      provider: 'claude',
      apiKey: '',
      model: DEFAULT_MODEL_BY_PROVIDER.claude,
      rememberApiKey: false,

      setRememberApiKey: (remember) => {
        set({ rememberApiKey: remember })
        if (!remember) {
          void Promise.resolve().then(() => {
            useAppStore.persist.clearStorage()
          })
        }
      },

      setProvider: (provider: Provider) =>
        set({
          provider,
          model: DEFAULT_MODEL_BY_PROVIDER[provider],
          apiKey: '',
        }),

      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),

      analysisTone: 'strict' as AnalysisTone,
      setAnalysisTone: (analysisTone) => set({ analysisTone }),

      resumeText: '',
      resumeFileName: '',
      resumePageCount: 0,
      resumePageTexts: [] as string[],
      jobDescription: '',
      resumePageFocus: defaultPageFocus(),

      setResumeText: (resumeText) =>
        set({
          resumeText,
          resumePageTexts: [],
          resumePageCount: 0,
          resumeFileName: '',
          resumePageFocus: defaultPageFocus(),
        }),

      setResumeFile: (resumeFileName, resumePageCount, resumeText, pageTexts) =>
        set({
          resumeFileName,
          resumePageCount,
          resumeText,
          resumePageTexts: pageTexts ?? [],
          resumePageFocus: defaultPageFocus(),
        }),

      setJobDescription: (jobDescription) => set({ jobDescription }),

      setResumePageFocus: (resumePageFocus) => set({ resumePageFocus }),

      setEmphasizeFirstResumePage: (emphasizeFirstPage) =>
        set((s) => ({
          resumePageFocus: { ...s.resumePageFocus, emphasizeFirstPage },
        })),

      toggleIgnoredResumePage: (page1Based) =>
        set((s) => {
          const cur = s.resumePageFocus.ignoredPages
          const has = cur.includes(page1Based)
          const ignoredPages = has
            ? cur.filter((p) => p !== page1Based)
            : [...cur, page1Based].sort((a, b) => a - b)
          return { resumePageFocus: { ...s.resumePageFocus, ignoredPages } }
        }),

      restoreSessionSnapshot: (snap) =>
        set({
          jobDescription: snap.jobDescription,
          resumeFileName: snap.resumeFileName,
          resumePageCount: snap.resumePageCount,
          resumeText: snap.resumeText,
          resumePageTexts: snap.resumePageTexts,
          analysisResult: snap.analysisResult,
          appliedSuggestionIndexes: [...snap.appliedSuggestionIndexes],
          analysisTone: snap.analysisTone,
          resumePageFocus: {
            emphasizeFirstPage: snap.resumePageFocus.emphasizeFirstPage,
            ignoredPages: [...snap.resumePageFocus.ignoredPages],
          },
          provider: snap.provider,
          model: snap.model,
          error: null,
        }),

      isAnalyzing: false,
      loadingStep: '',
      analysisResult: null,
      error: null,
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setLoadingStep: (loadingStep) => set({ loadingStep }),
      setAnalysisResult: (analysisResult) =>
        set({ analysisResult, appliedSuggestionIndexes: [] }),
      setError: (error) => set({ error }),

      appliedSuggestionIndexes: [],
      toggleAppliedSuggestion: (index) =>
        set((s) => {
          const cur = s.appliedSuggestionIndexes
          const has = cur.includes(index)
          const appliedSuggestionIndexes = has
            ? cur.filter((i) => i !== index)
            : [...cur, index].sort((a, b) => a - b)
          return { appliedSuggestionIndexes }
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): Partial<PersistedFields> => {
        if (!state.rememberApiKey) {
          return { rememberApiKey: false }
        }
        return {
          rememberApiKey: true,
          apiKey: state.apiKey,
          provider: state.provider,
          model: state.model,
        }
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<PersistedFields> | undefined
        if (!p || !p.rememberApiKey) {
          return {
            ...current,
            rememberApiKey: false,
          }
        }
        return {
          ...current,
          rememberApiKey: true,
          apiKey: typeof p.apiKey === 'string' ? p.apiKey : '',
          provider: (p.provider as Provider) ?? current.provider,
          model:
            typeof p.model === 'string'
              ? p.model
              : DEFAULT_MODEL_BY_PROVIDER[
                  (p.provider as Provider) ?? current.provider
                ],
        }
      },
      version: 1,
    }
  )
)
