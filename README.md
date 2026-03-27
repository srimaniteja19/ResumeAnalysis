# Role Weaver

Role Weaver is a single-page app that compares a résumé to a job description and produces a structured report: match scores, must-have checklist, keyword gaps, section-level feedback, suggested rewrites, and optional score projections. You bring your own API key; nothing is sent through Role Weaver’s servers.

## Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev) for dev and production builds
- [Tailwind CSS](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com) primitives
- [Zustand](https://zustand-demo.pmnd.rs) for UI state (optional local persistence for provider settings)
- [pdf.js](https://mozilla.github.io/pdf.js/) (workers) for PDF text extraction in the browser

## Features

- **Providers**: Anthropic Claude, OpenAI, and Google Gemini, with selectable models per provider.
- **Inputs**: Paste or upload a résumé (including PDF), paste a job description, then run analysis when both are ready.
- **Résumé scope**: For multi-page PDFs, you can emphasize the first page and exclude specific pages from the text sent to the model.
- **Analysis tone**: Choose a stricter or more creative instruction bias for suggestions (still grounded in your material).
- **Report**: Dashboard scores, must-haves table, keyword map, weak verbs, impact language notes, section breakdown, and line-level replacement ideas with optional “if you applied everything” score projection.
- **Session history**: Recent runs are stored locally in IndexedDB (limited history); restore a past session from the panel.
- **Export**: Download the analysis as a PDF from the results view.

## Privacy and API keys

Keys are entered in the browser and used to call the provider APIs directly from your device. **They can be read by anyone with access to this browser, DevTools, or malicious extensions.** You can opt in to remember the key in `localStorage` for convenience; leave that off on shared machines.

For production or team settings, consider a backend or serverless proxy that holds provider credentials server-side instead of in the client.

## Prerequisites

- Node.js 18+ (or current LTS) and npm

## Scripts

```bash
npm install
npm run dev      # local dev server with HMR
npm run build    # typecheck + production bundle
npm run preview  # serve the production build locally
npm run lint     # ESLint
```

## Deployment

The repo includes a [Vercel](https://vercel.com) configuration with SPA rewrites and security headers (including CSP `connect-src` entries for the supported provider API hosts). Point Vercel at this repo or run `npm run build` and deploy the `dist` output to any static host that supports client-side routing.

## License

This project is private (`"private": true` in `package.json`). Add a license file if you intend to distribute it.
