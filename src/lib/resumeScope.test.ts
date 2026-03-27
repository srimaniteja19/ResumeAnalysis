import { describe, expect, it } from 'vitest'
import { buildResumeTextForModel } from './resumeScope'
import type { ResumePageFocusSettings } from '@/types'

const focus = (partial: Partial<ResumePageFocusSettings> = {}): ResumePageFocusSettings => ({
  emphasizeFirstPage: false,
  ignoredPages: [],
  ...partial,
})

describe('buildResumeTextForModel', () => {
  it('returns full text when there is no per-page map', () => {
    const full = 'LINE ONE\n\nLINE TWO'
    const { modelText, resumeExtraNote } = buildResumeTextForModel(
      full,
      [],
      0,
      focus()
    )
    expect(modelText).toBe(full)
    expect(resumeExtraNote).toBeUndefined()
  })

  it('adds layout note when emphasizeFirstPage but no page map', () => {
    const { modelText, resumeExtraNote } = buildResumeTextForModel(
      'only paste',
      [],
      0,
      focus({ emphasizeFirstPage: true })
    )
    expect(modelText).toBe('only paste')
    expect(resumeExtraNote).toContain('per-page PDF structure unavailable')
  })

  it('notes ignored pages are ignored when no per-page map', () => {
    const { resumeExtraNote } = buildResumeTextForModel(
      'x',
      [],
      0,
      focus({ ignoredPages: [1, 2] })
    )
    expect(resumeExtraNote).toContain('Page omit list ignored')
  })

  it('omits ignored pages from joined extract and annotates', () => {
    const pages = ['PAGE1', 'PAGE2', 'PAGE3']
    const { modelText, resumeExtraNote } = buildResumeTextForModel(
      'FALLBACK FULL',
      pages,
      3,
      focus({ ignoredPages: [2] })
    )
    expect(modelText).toContain('PAGE1')
    expect(modelText).toContain('PAGE3')
    expect(modelText).not.toContain('PAGE2')
    expect(resumeExtraNote).toContain('omitted page(s) 2')
  })

  it('adds priority note for page 1 when multi-page and emphasized', () => {
    const pages = ['A', 'B']
    const { resumeExtraNote } = buildResumeTextForModel(
      'FULL',
      pages,
      2,
      focus({ emphasizeFirstPage: true })
    )
    expect(resumeExtraNote).toContain('page 1 carries headline')
  })

  it('does not add priority note if page 1 is ignored', () => {
    const pages = ['A', 'B']
    const { resumeExtraNote } = buildResumeTextForModel(
      'FULL',
      pages,
      2,
      focus({ emphasizeFirstPage: true, ignoredPages: [1] })
    )
    expect(resumeExtraNote).toBeDefined()
    expect(resumeExtraNote).not.toContain('page 1 carries headline')
  })

  it('falls back to full resume text when every page is omitted', () => {
    const pages = ['ONLY']
    const full = 'FULL RESUME BODY'
    const { modelText } = buildResumeTextForModel(full, pages, 1, focus({
      ignoredPages: [1],
    }))
    expect(modelText).toBe(full)
  })

  it('ignores out-of-range ignored page indices', () => {
    const pages = ['ONE', 'TWO']
    const { modelText } = buildResumeTextForModel(
      'FULL',
      pages,
      2,
      focus({ ignoredPages: [99, -1] })
    )
    expect(modelText).toContain('ONE')
    expect(modelText).toContain('TWO')
  })

  it('normalizes whitespace in joined page text', () => {
    const pages = ['foo   bar', 'baz\n\n\nqux']
    const { modelText } = buildResumeTextForModel(
      'FULL',
      pages,
      2,
      focus()
    )
    expect(modelText).toMatch(/foo bar/)
    expect(modelText).toMatch(/baz\n\nqux/)
  })
})
