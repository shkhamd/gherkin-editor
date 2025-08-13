import { createPortal } from 'react-dom'

export function Modal({
  open,
  onClose,
  children,
  ariaLabel,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  ariaLabel?: string
}) {
  if (!open) return null
  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border p-4"
      >
        {children}
      </div>
    </div>
  )
  return createPortal(overlay, document.body)
}
