import { create } from 'zustand'
import { Feature, seedFeature } from '../lib/gherkin/model'
import { printFeature } from '../lib/gherkin/printer'
import { parseFeature } from '../lib/gherkin/parser'
import { validateFeature } from '../lib/gherkin/validators'

type Layout = 'side' | 'stack'

type State = {
  feature: Feature
  rawText: string
  layout: Layout
  lastError?: string
  // NEW — persisted split ratios
  splitRatio: number        // for side-by-side (0..1), default 0.5
  splitRatioStack: number   // for stacked layout (0..1), default 0.5
}

type Actions = {
  newFile: () => void
  openText: (txt: string) => void
  saveText: () => string
  setRawText: (txt: string) => void
  toggleLayout: () => void
  validate: () => { ok: boolean; messages: string[] }
  setSplitRatio: (r: number) => void
  setSplitRatioStack: (r: number) => void
}

export const useEditorStore = create<State & Actions>((set, get) => ({
  feature: seedFeature(),
  rawText: '',
  layout: 'side',
  lastError: undefined,
  splitRatio: Number(localStorage.getItem('splitRatio') ?? 0.5),
  splitRatioStack: Number(localStorage.getItem('splitRatioStack') ?? 0.5),
  newFile: () => set({ feature: seedFeature(), rawText: '' }),
  openText: (txt) => {
    try {
      const feat = parseFeature(txt)
      set({ feature: feat, rawText: txt, lastError: undefined })
    } catch (e: any) {
      set({ lastError: e?.message ?? String(e) })
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
  }
}))
