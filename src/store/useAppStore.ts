import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DEFAULT_MODEL_BY_PROVIDER } from '@/lib/providerModels'
import type { AppState, Provider } from '../types'

const STORAGE_KEY = 'roleweaver-settings-v1'

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

      resumeText: '',
      resumeFileName: '',
      resumePageCount: 0,
      jobDescription: '',
      setResumeText: (resumeText) => set({ resumeText }),
      setResumeFile: (resumeFileName, resumePageCount, resumeText) =>
        set({ resumeFileName, resumePageCount, resumeText }),
      setJobDescription: (jobDescription) => set({ jobDescription }),

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
      /** Only rehydrate provider credentials; never persist resume/JD/analysis from disk. */
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
