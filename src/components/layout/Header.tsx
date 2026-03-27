import { EnergyBurst } from '@/components/illustrations/SciFiHeroArt'

function OmnitrixDial() {
  return (
    <div
      className="relative mx-auto h-28 w-28 shrink-0 md:mx-0 animate-floaty"
      aria-hidden
    >
      <EnergyBurst className="pointer-events-none absolute left-1/2 top-1/2 h-[9.5rem] w-[9.5rem] -translate-x-1/2 -translate-y-1/2 text-omni/45" />
      {/* Outer chassis */}
      <div className="absolute inset-0 rounded-full border-[3px] border-black bg-gradient-to-br from-dial-metal via-dial-dark to-black shadow-comic" />
      {/* Spinning ring */}
      <div
        className="absolute inset-1 rounded-full border-2 border-dashed border-omni/70 bg-gradient-to-tr from-gray-800/90 to-gray-900 animate-omni-spin"
        style={{ animationDuration: '14s' }}
      />
      <div
        className="absolute inset-2 rounded-full border-2 border-black/80 bg-gradient-to-b from-gray-700 to-gray-900"
      />
      {/* Core */}
      <div className="absolute inset-[22%] flex items-center justify-center rounded-full border-2 border-black bg-gradient-to-br from-lime-300 via-omni to-emerald-600 animate-omni-pulse" />
      <div className="absolute inset-[34%] rounded-full border border-white/40 bg-omni/90 blur-[0.5px]" />
      {/* “Hour” pip */}
      <div className="absolute left-1/2 top-2 h-2 w-2 -translate-x-1/2 rounded-sm bg-amber shadow-comic-sm" />
    </div>
  )
}

export function Header() {
  return (
    <header className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden border-b-[5px] border-black py-8 md:gap-8">
      <div
        className="pointer-events-none absolute -left-8 top-0 h-full w-32 -skew-x-6 bg-gradient-to-r from-omni/20 to-transparent"
        aria-hidden
      />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:gap-8">
        <OmnitrixDial />
        <div className="min-w-0 space-y-2 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <p className="inline-block rounded-md border-2 border-black bg-void px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.2em] text-omni shadow-comic-sm">
              classified
            </p>
            <p className="inline-block rounded-md border-2 border-black bg-danger px-2 py-0.5 font-display text-[9px] uppercase tracking-[0.15em] text-white shadow-comic-sm">
              plumber ops
            </p>
            <p className="hidden font-mono text-[9px] text-dim sm:inline">
              (fan theme · not affiliated)
            </p>
          </div>
          <h1 className="font-serif text-5xl font-normal leading-none tracking-wide md:text-7xl md:leading-none">
            <span className="text-voltage text-foreground">Role</span>
            <span className="text-voltage text-omni">Weaver</span>
          </h1>
          <p className="font-display text-xs uppercase tracking-[0.12em] text-dim md:text-sm">
            Galvan-grade résumé DNA · dial in the perfect match
          </p>
          <p className="mx-auto max-w-lg font-sans text-sm font-bold italic leading-snug text-foreground/90 md:mx-0">
            Slam your experience into the watch — we&apos;ll morph your bullets until the
            <span className="text-slime"> JD aliens </span>
            actually respect you.
          </p>
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-col items-center gap-2 md:w-auto md:items-end">
        <div className="flex items-center gap-2 rounded-full border-[3px] border-black bg-white px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.25em] shadow-comic">
          <span className="relative flex h-3 w-3" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-omni opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-black bg-omni shadow-omni-glow" />
          </span>
          omnitrix · sync
        </div>
        <p className="max-w-[200px] text-center font-mono text-[8px] uppercase leading-tight tracking-wider text-dim md:text-right">
          Watch charged · matrix stable · no Vilgax detected
        </p>
      </div>
    </header>
  )
}
