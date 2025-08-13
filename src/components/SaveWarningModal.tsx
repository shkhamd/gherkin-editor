import { useEffect, useState } from 'react'
import { Modal } from './Modal'

type Mode = 'parse' | 'validation'

export function SaveWarningModal({
  open, mode, errors,
  onConfirm, onAltConfirm, onCancel,
  skip = undefined
}: {
  open: boolean
  mode: Mode
  errors: string[]
  onConfirm: () => void
  onAltConfirm?: () => void
  onCancel: () => void
  skip?: { value: boolean; onChange: (v: boolean) => void }
}) {
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { onCancel(); e.preventDefault() }
      if (e.key === 'Enter') { onConfirm(); e.preventDefault() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onConfirm, onCancel])

  if (!open) return null

  const title = mode === 'parse' ? 'Save anyway? (Parse error)' : 'Save anyway? (Validation issues)'
  const bodyLead = mode === 'parse'
    ? 'Your file has a parse error and may not open correctly in other tools.'
    : 'Your file has validation issues.'
  const primary = mode === 'parse' ? 'Save raw text (recommended)' : 'Save anyway'
  const secondary = mode === 'parse' ? 'Save last valid print' : undefined

  const shown = showAll ? errors : errors.slice(0, 3)
  const hasMore = errors.length > shown.length

  return (
    <Modal open={open} onClose={onCancel} ariaLabel={title}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="mb-3 text-sm text-neutral-700">{bodyLead}</p>

      {errors.length > 0 && (
        <div className="mb-3 max-h-40 overflow-auto border rounded-md p-2 bg-neutral-50">
          <ul className="list-disc pl-5 text-sm space-y-1">
            {shown.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
          {hasMore && (
            <button className="mt-2 text-xs underline" onClick={() => setShowAll(s => !s)}>
              {showAll ? 'Show less' : `Show all (${errors.length})`}
            </button>
          )}
        </div>
      )}

      {mode === 'validation' && skip && (
        <label className="flex items-center gap-2 text-sm mb-3">
          <input type="checkbox" checked={skip.value} onChange={(e) => skip.onChange(e.target.checked)} />
          Don’t warn me again for validation issues
        </label>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        <button className="btn" onClick={onCancel}>Cancel</button>
        {secondary && onAltConfirm && <button className="btn" onClick={onAltConfirm}>{secondary}</button>}
        <button className="btn" onClick={onConfirm}>{primary}</button>
      </div>
    </Modal>
  )
}
