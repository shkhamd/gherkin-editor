import { useEffect } from 'react'
import { Modal } from './Modal'

export function ValidationModal({
  open, mode, errors, onClose
}: {
  open: boolean
  mode: 'ok' | 'parse' | 'validation'
  errors: string[]
  onClose: () => void
}) {
  const title =
    mode === 'ok' ? 'Validation passed' :
    mode === 'parse' ? 'Parse error' :
    'Validation issues'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape' || e.key === 'Enter') { onClose(); e.preventDefault() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <Modal open={open} onClose={onClose} ariaLabel={title}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {mode === 'ok' ? (
        <p className="text-sm text-green-700">Valid ✅</p>
      ) : (
        <div className="max-h-60 overflow-auto border rounded-md p-2 bg-neutral-50">
          <ul className="list-disc pl-5 text-sm space-y-1">
            {errors.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button className="btn" onClick={onClose}>OK</button>
      </div>
    </Modal>
  )
}
