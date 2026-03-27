import type { Config } from 'tailwindcss'

/** Ben 10–adjacent “Omnitrix / Plumber tech” cartoon sci‑fi (fan homage, not official). */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#ecfccb',
        bg2: '#f7fee7',
        bg3: '#d9f99d',
        card: '#ffffff',
        border: '#0a0a0a',
        /** Token name unchanged — main hero / Omnitrix-adjacent green. */
        cyan: '#16a34a',
        omni: '#39ff14',
        'omni-shadow': '#22c55e',
        'dial-metal': '#374151',
        'dial-dark': '#1f2937',
        slime: '#84cc16',
        void: '#0f172a',
        amber: '#f97316',
        success: '#15803d',
        danger: '#ef4444',
        dim: '#3f3f46',
        muted: '#52525b',
        foreground: '#0a0a0a',
        background: '#ecfccb',
        primary: { DEFAULT: '#22c55e', foreground: '#ffffff' },
        secondary: { DEFAULT: '#fef08a', foreground: '#0a0a0a' },
        destructive: { DEFAULT: '#ef4444', foreground: '#ffffff' },
        accent: { DEFAULT: '#bbf7d0', foreground: '#14532d' },
        input: '#0a0a0a',
        ring: '#39ff14',
        pastel: {
          lavender: '#d9f99d',
          peach: '#fed7aa',
          rose: '#fecaca',
        },
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        serif: ['Bangers', 'cursive'],
        display: ['Bungee', 'cursive'],
        sans: [
          '"Comic Neue"',
          '"Comic Sans MS"',
          '"Chalkboard SE"',
          'cursive',
          'sans-serif',
        ],
      },
      borderRadius: {
        lg: '18px',
        md: '14px',
        sm: '8px',
      },
      boxShadow: {
        card: '5px 5px 0 0 #0a0a0a',
        soft: '7px 7px 0 0 rgba(10, 10, 10, 0.25)',
        comic: '6px 6px 0 0 #0a0a0a',
        'comic-sm': '3px 3px 0 0 #0a0a0a',
        glow: '0 0 28px rgba(57, 255, 20, 0.55)',
        'omni-glow':
          '0 0 8px #39ff14, 0 0 24px rgba(57, 255, 20, 0.45), inset 0 0 12px rgba(255,255,255,0.15)',
      },
      backgroundImage: {
        hazard: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 10px,
          rgba(10, 10, 10, 0.06) 10px,
          rgba(10, 10, 10, 0.06) 20px
        )`,
        'slime-radial':
          'radial-gradient(circle at 50% 0%, rgba(57, 255, 20, 0.25) 0%, transparent 55%)',
      },
      animation: {
        'bar-fill': 'barFill 1.5s cubic-bezier(0.4,0,0.2,1) forwards',
        blink: 'blink 0.8s step-start infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.4s ease both',
        'omni-spin': 'omniSpin 12s linear infinite',
        'omni-dial': 'omniSpin 3s linear infinite',
        'omni-pulse': 'omniCorePulse 2.5s ease-in-out infinite',
        skew: 'skewJitter 4s ease-in-out infinite',
        floaty: 'floaty 5s ease-in-out infinite',
      },
      keyframes: {
        barFill: { from: { width: '0%' }, to: { width: 'var(--bar-width)' } },
        blink: { '50%': { opacity: '0' } },
        glowPulse: {
          '0%,100%': {
            filter:
              'drop-shadow(0 0 4px rgba(57,255,20,0.9)) drop-shadow(0 0 16px rgba(34,197,94,0.5))',
          },
          '50%': {
            filter:
              'drop-shadow(0 0 12px rgba(57,255,20,1)) drop-shadow(0 0 28px rgba(57,255,20,0.6))',
          },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        omniSpin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        omniCorePulse: {
          '0%,100%': {
            boxShadow:
              '0 0 12px #39ff14, 0 0 28px rgba(57,255,20,0.5), inset 0 0 8px rgba(255,255,255,0.35)',
          },
          '50%': {
            boxShadow:
              '0 0 20px #7fff00, 0 0 48px rgba(57,255,20,0.65), inset 0 0 14px rgba(255,255,255,0.5)',
          },
        },
        skewJitter: {
          '0%,100%': { transform: 'skewX(0deg)' },
          '25%': { transform: 'skewX(-0.6deg)' },
          '75%': { transform: 'skewX(0.6deg)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
