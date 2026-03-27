import type { Provider, ProviderConfig } from '@/types'

/**
 * Curated chat/analysis model IDs for each vendor API used by RoleWeaver.
 * Source docs (verify before production changes):
 * - Anthropic: https://docs.anthropic.com/en/docs/about-claude/models
 * - OpenAI: https://platform.openai.com/docs/models
 * - Google Gemini: https://ai.google.dev/gemini-api/docs/models/gemini
 *
 * Aliases (e.g. claude-sonnet-4-6) and snapshots may require an account with access;
 * older snapshot IDs are kept for compatibility.
 */
export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  claude: {
    label: 'Claude',
    placeholder: 'sk-ant-api03-...',
    models: [
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (latest)' },
      { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
      {
        value: 'claude-haiku-4-5-20251001',
        label: 'Claude Haiku 4.5',
      },
      {
        value: 'claude-sonnet-4-5-20250929',
        label: 'Claude Sonnet 4.5',
      },
      {
        value: 'claude-opus-4-5-20251101',
        label: 'Claude Opus 4.5',
      },
      { value: 'claude-opus-4-1-20250805', label: 'Claude Opus 4.1' },
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { value: 'claude-opus-4-20250514', label: 'Claude Opus 4' },
    ],
  },
  openai: {
    label: 'OpenAI',
    placeholder: 'sk-...',
    models: [
      { value: 'gpt-5.4', label: 'GPT-5.4 (frontier)' },
      {
        value: 'gpt-5.4-2026-03-05',
        label: 'GPT-5.4 snapshot 2026-03-05',
      },
      { value: 'gpt-5.4-mini', label: 'GPT-5.4 mini' },
      { value: 'gpt-5.4-nano', label: 'GPT-5.4 nano' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
    ],
  },
  gemini: {
    label: 'Gemini',
    placeholder: 'AIza...',
    models: [
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (stable)' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
      { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (preview)' },
      {
        value: 'gemini-3.1-pro-preview',
        label: 'Gemini 3.1 Pro (preview)',
      },
      // Google lists 2.0 Flash as deprecated; keep for older projects only
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (legacy)' },
    ],
  },
}

/**
 * Defaults favor faster models; frontier IDs stay in each list for max depth.
 * Dual-pass requests (see `ai.ts`) also cut wall-clock vs one huge completion.
 */
export const DEFAULT_MODEL_BY_PROVIDER: Record<Provider, string> = {
  claude: PROVIDER_CONFIGS.claude.models[0].value,
  openai: 'gpt-4o',
  gemini: 'gemini-2.5-flash-lite',
}

export const MODEL_CATALOG_DOCS: Record<Provider, string> = {
  claude: 'https://docs.anthropic.com/en/docs/about-claude/models',
  openai: 'https://platform.openai.com/docs/models',
  gemini: 'https://ai.google.dev/gemini-api/docs/models/gemini',
}
