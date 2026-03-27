import type { Provider } from '@/types'
import { useShallow } from 'zustand/react/shallow'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import {
  MODEL_CATALOG_DOCS,
  PROVIDER_CONFIGS,
} from '@/lib/providerModels'

const PROVIDER_KEYS: Provider[] = ['claude', 'openai', 'gemini']

export function ProviderBar() {
  const {
    provider,
    apiKey,
    model,
    rememberApiKey,
    setProvider,
    setApiKey,
    setModel,
    setRememberApiKey,
  } = useAppStore(
    useShallow((s) => ({
      provider: s.provider,
      apiKey: s.apiKey,
      model: s.model,
      rememberApiKey: s.rememberApiKey,
      setProvider: s.setProvider,
      setApiKey: s.setApiKey,
      setModel: s.setModel,
      setRememberApiKey: s.setRememberApiKey,
    }))
  )

  const cfg = PROVIDER_CONFIGS[provider]
  const docsHref = MODEL_CATALOG_DOCS[provider]

  const labelClass = 'font-mono text-[10px] uppercase tracking-wider text-dim'

  return (
    <section className="relative mb-6 overflow-hidden rounded-xl border-[3px] border-black bg-card p-4 shadow-comic before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-omni before:via-amber before:to-omni">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        {/* Left column */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <p className={labelClass + ' tracking-[0.2em]'}>LLM Provider</p>
          <div className="flex flex-wrap gap-2">
            {PROVIDER_KEYS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={cn(
                  'rounded-md border-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide transition-all duration-200',
                  provider === p
                    ? 'border-border bg-pastel-lavender text-foreground shadow-comic-sm ring-2 ring-cyan'
                    : 'border-border/80 bg-bg2 text-dim hover:border-cyan hover:bg-accent/50 hover:text-foreground'
                )}
              >
                {PROVIDER_CONFIGS[p].label}
              </button>
            ))}
          </div>
          <p className="max-w-xl font-mono text-[10px] leading-relaxed text-dim">
            Supported model IDs follow each vendor&apos;s current API catalog — see{' '}
            <a
              href={docsHref}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-cyan underline decoration-cyan/40 underline-offset-2 hover:text-cyan/90"
            >
              {cfg.label} model docs
            </a>
            . Preview or alias IDs may require allowlisting on your key.
          </p>
        </div>

        {/* Right column — same vertical rhythm (label → control → note) */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:max-w-xl">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>API Key</span>
              <input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={cfg.placeholder}
                className="w-full rounded-md border-2 border-border bg-bg2 px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-shadow placeholder:text-muted/70 focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,197,94,0.25)]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-md border-2 border-border bg-bg2 px-3 py-2.5 font-mono text-sm text-foreground outline-none transition-shadow focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,197,94,0.25)]"
              >
                {cfg.models.map((m) => (
                  <option
                    key={m.value}
                    value={m.value}
                  >
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex cursor-pointer gap-2">
            <input
              type="checkbox"
              checked={rememberApiKey}
              onChange={(e) => setRememberApiKey(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-border text-cyan focus:ring-cyan"
            />
            <span className="font-mono text-[10px] leading-relaxed text-dim">
              <span className="font-bold uppercase tracking-wide text-foreground">
                Remember API key on this device
              </span>
              {' — '}
              Saves your key, provider, and model in this browser only (localStorage). Anyone with
              access to this device or a malicious script on this site could read it. Your résumé
              and job text are <span className="text-foreground">not</span> saved. Clear the
              checkbox to remove stored credentials.
            </span>
          </label>
        </div>
      </div>
    </section>
  )
}
