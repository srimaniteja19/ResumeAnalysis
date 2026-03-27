import type { AnalysisResult, Provider } from '../types'
import {
  mergeDualAnalysisRaw,
  parseAnalysisFromRaw,
} from './analysisParse'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt'
import {
  SYSTEM_PROMPT_ANALYSIS_CORE,
  SYSTEM_PROMPT_ANALYSIS_REWRITES,
} from './promptDual'

/**
 * Single request: high ceiling so nothing truncates.
 * Dual-pass: each call generates fewer tokens → typically lower wall time in parallel
 * (see OpenAI “parallelize” / latency optimization guides).
 */
const ANALYZE_MAX_CLAUDE = 16_384
const ANALYZE_MAX_CLAUDE_CORE = 12_288
const ANALYZE_MAX_CLAUDE_REWRITE = 8192

const ANALYZE_MAX_OPENAI = 16_384
const ANALYZE_MAX_OPENAI_CORE = 12_288
const ANALYZE_MAX_OPENAI_REWRITE = 8192

const ANALYZE_MAX_GEMINI = 16_384
const ANALYZE_MAX_GEMINI_CORE = 12_288
const ANALYZE_MAX_GEMINI_REWRITE = 8192

/** Set false to force one monolithic request (slower, easier to debug). */
const USE_DUAL_PASS_ANALYSIS = true

/** Claude prompt caching: 2nd+ requests within TTL reuse KV cache. */
function claudeCachedSystemBlocks(systemText: string) {
  return [
    {
      type: 'text',
      text: systemText,
      cache_control: { type: 'ephemeral' as const },
    },
  ]
}

async function callClaude(
  apiKey: string,
  model: string,
  userPrompt: string,
  system: string,
  maxTokens: number
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0,
      system: claudeCachedSystemBlocks(system),
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string }
    }
    throw new Error(err?.error?.message ?? `Claude API error ${res.status}`)
  }
  const data = (await res.json()) as {
    content: Array<{ text?: string }>
  }
  return data.content[0].text as string
}

async function callOpenAI(
  apiKey: string,
  model: string,
  userPrompt: string,
  system: string,
  opts: { responseJson?: boolean; maxTokens: number }
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    max_tokens: opts.maxTokens,
    temperature: 0,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt },
    ],
  }
  if (opts.responseJson && model.startsWith('gpt-')) {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string }
    }
    throw new Error(err?.error?.message ?? `OpenAI API error ${res.status}`)
  }
  const data = (await res.json()) as {
    choices: Array<{ message?: { content?: string | null } }>
  }
  return data.choices[0].message?.content as string
}

async function callGemini(
  apiKey: string,
  model: string,
  userPrompt: string,
  system: string,
  jsonMode: boolean,
  maxOutputTokens: number
): Promise<string> {
  const generationConfig: Record<string, unknown> = {
    maxOutputTokens,
    temperature: 0,
  }
  if (jsonMode) generationConfig.responseMimeType = 'application/json'

  const safeModel = encodeURIComponent(model)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${safeModel}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig,
      }),
    }
  )
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: { message?: string }
    }
    throw new Error(err?.error?.message ?? `Gemini API error ${res.status}`)
  }
  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      finishReason?: string
    }>
  }
  const parts: Array<{ text?: string }> =
    data.candidates?.[0]?.content?.parts ?? []
  const text = parts.filter((p) => p.text).map((p) => p.text).join('')
  if (!text)
    throw new Error(
      `Gemini returned no content. Reason: ${data.candidates?.[0]?.finishReason}`
    )
  return text
}

async function fetchAnalysisSinglePass(
  provider: Provider,
  apiKey: string,
  model: string,
  resumeText: string,
  jobDescription: string
): Promise<string> {
  const userPrompt = buildUserPrompt(resumeText, jobDescription, 'full')
  if (provider === 'claude') {
    return callClaude(apiKey, model, userPrompt, SYSTEM_PROMPT, ANALYZE_MAX_CLAUDE)
  }
  if (provider === 'openai') {
    return callOpenAI(apiKey, model, userPrompt, SYSTEM_PROMPT, {
      responseJson: true,
      maxTokens: ANALYZE_MAX_OPENAI,
    })
  }
  return callGemini(
    apiKey,
    model,
    userPrompt,
    SYSTEM_PROMPT,
    true,
    ANALYZE_MAX_GEMINI
  )
}

async function requestAnalysisCore(
  provider: Provider,
  apiKey: string,
  model: string,
  userPrompt: string
): Promise<string> {
  if (provider === 'claude') {
    return callClaude(
      apiKey,
      model,
      userPrompt,
      SYSTEM_PROMPT_ANALYSIS_CORE,
      ANALYZE_MAX_CLAUDE_CORE
    )
  }
  if (provider === 'openai') {
    return callOpenAI(apiKey, model, userPrompt, SYSTEM_PROMPT_ANALYSIS_CORE, {
      responseJson: true,
      maxTokens: ANALYZE_MAX_OPENAI_CORE,
    })
  }
  return callGemini(
    apiKey,
    model,
    userPrompt,
    SYSTEM_PROMPT_ANALYSIS_CORE,
    true,
    ANALYZE_MAX_GEMINI_CORE
  )
}

async function requestAnalysisRewrites(
  provider: Provider,
  apiKey: string,
  model: string,
  userPrompt: string
): Promise<string> {
  if (provider === 'claude') {
    return callClaude(
      apiKey,
      model,
      userPrompt,
      SYSTEM_PROMPT_ANALYSIS_REWRITES,
      ANALYZE_MAX_CLAUDE_REWRITE
    )
  }
  if (provider === 'openai') {
    return callOpenAI(
      apiKey,
      model,
      userPrompt,
      SYSTEM_PROMPT_ANALYSIS_REWRITES,
      {
        responseJson: true,
        maxTokens: ANALYZE_MAX_OPENAI_REWRITE,
      }
    )
  }
  return callGemini(
    apiKey,
    model,
    userPrompt,
    SYSTEM_PROMPT_ANALYSIS_REWRITES,
    true,
    ANALYZE_MAX_GEMINI_REWRITE
  )
}

export async function fetchAnalysisRaw(
  provider: Provider,
  apiKey: string,
  model: string,
  resumeText: string,
  jobDescription: string
): Promise<string> {
  if (!apiKey.trim()) throw new Error('Please enter your API key.')

  if (!USE_DUAL_PASS_ANALYSIS) {
    return fetchAnalysisSinglePass(
      provider,
      apiKey,
      model,
      resumeText,
      jobDescription
    )
  }

  const uCore = buildUserPrompt(resumeText, jobDescription, 'core')
  const uRew = buildUserPrompt(resumeText, jobDescription, 'rewrite')

  try {
    const [coreRaw, rewriteRaw] = await Promise.all([
      requestAnalysisCore(provider, apiKey, model, uCore),
      requestAnalysisRewrites(provider, apiKey, model, uRew),
    ])
    return mergeDualAnalysisRaw(coreRaw, rewriteRaw)
  } catch (err) {
    console.warn(
      'Dual-pass analysis failed; falling back to single request:',
      err
    )
    return fetchAnalysisSinglePass(
      provider,
      apiKey,
      model,
      resumeText,
      jobDescription
    )
  }
}

export async function analyzeResume(
  provider: Provider,
  apiKey: string,
  model: string,
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const raw = await fetchAnalysisRaw(
    provider,
    apiKey,
    model,
    resumeText,
    jobDescription
  )
  try {
    return parseAnalysisFromRaw(raw)
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Raw AI response:', raw)
    } else {
      console.error(
        'Failed to parse AI response (detail omitted in production). Length:',
        raw.length
      )
    }
    throw new Error(`Failed to parse AI response: ${(e as Error).message}`)
  }
}
