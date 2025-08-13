import { create } from 'zustand'
import { Feature, seedFeature } from '../lib/gherkin/model'
import { printFeature } from '../lib/gherkin/printer'
import { parseFeature } from '../lib/gherkin/parser'
import { validateFeature } from '../lib/gherkin/validators'
import { saveWithFS } from '../lib/fs' // ⬅️ NEW

type Layout = 'side' | 'stack'

type State = {
  feature: Feature
  rawText: string
  layout: Layout
  lastError?: string
  splitRatio: number
  splitRatioStack: number
  // ⬅️ NEW
  skipValidationWarning: boolean
}

type Actions = {
  newFile: () => void
  openText: (txt: string) => void
  // kept for compatibility, but no longer used by AppShell
  saveText: () => string
  setRawText: (txt: string) => void
  toggleLayout: () => void
  validate: () => { ok: boolean; messages: string[] }
  setSplitRatio: (r: number) => void
  setSplitRatioStack: (r: number) => void
  // ⬅️ NEW
  setSkipValidationWarning: (v: boolean) => void
  savePrinted: () => Promise<void>
  saveRaw: () => Promise<void>
}

export const useEditorStore = create<State & Actions>((set, get) => ({
  feature: seedFeature(),
  rawText: '',
  layout: 'side',
  lastError: undefined,
  splitRatio: Number(localStorage.getItem('splitRatio') ?? 0.5),
  splitRatioStack: Number(localStorage.getItem('splitRatioStack') ?? 0.5),
  // ⬅️ NEW
  skipValidationWarning: JSON.parse(localStorage.getItem('skipValidationWarning') ?? 'false'),

  newFile: () => set({ feature: seedFeature(), rawText: '' }),
  openText: (txt) => {
    try {
      const feat = parseFeature(txt)
      set({ feature: feat, rawText: txt, lastError: undefined })
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e), rawText: txt })
    }
  },
  saveText: () => {
    const printed = printFeature(get().feature)
    set({ rawText: printed })
    return printed
  },
  setRawText: (txt) => {
    set({ rawText: txt })
    try {
      const feat = parseFeature(txt)
      set({ feature: feat, lastError: undefined })
    } catch (e: any) {
      set({ lastError: (e as Error).message })
    }
  },
  toggleLayout: () => set(s => ({ layout: s.layout === 'side' ? 'stack' : 'side' })),
  validate: () => validateFeature(get().feature),
  setSplitRatio: (r) => {
    const clamped = Math.min(0.9, Math.max(0.1, r))
    localStorage.setItem('splitRatio', String(clamped))
    set({ splitRatio: clamped })
  },
  setSplitRatioStack: (r) => {
    const clamped = Math.min(0.9, Math.max(0.1, r))
    localStorage.setItem('splitRatioStack', String(clamped))
    set({ splitRatioStack: clamped })
  },
  // ⬅️ NEW
  setSkipValidationWarning: (v) => {
    localStorage.setItem('skipValidationWarning', JSON.stringify(v))
    set({ skipValidationWarning: v })
  },
  savePrinted: async () => {
    const txt = printFeature(get().feature)
    await saveWithFS(txt, 'feature.feature')
  },
  saveRaw: async () => {
    await saveWithFS(get().rawText, 'feature.feature')
  }
}))
