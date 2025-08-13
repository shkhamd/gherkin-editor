import { useEffect, useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import { openWithFS } from '../lib/fs'
import { SaveWarningModal } from './SaveWarningModal'
import { ValidationModal } from './ValidationModal' // ⬅️ NEW

export function AppShell() {
  const {
    newFile, validate, toggleLayout, layout, lastError,
    skipValidationWarning, setSkipValidationWarning,
    savePrinted, saveRaw, openText
  } = useEditorStore()

  const onOpen = async () => {
    const txt = await openWithFS()
    if (txt != null) openText(txt)
    else alert('Your browser does not support the File System Access API. Use the Editor to paste text or use Save (fallback).')
  }

  // Save modal state
  const [modal, setModal] = useState<{ open: boolean; mode: 'parse' | 'validation'; errors: string[] }>({
    open: false, mode: 'validation', errors: []
  })

  // Validate modal state
  const [vmodal, setVmodal] = useState<{ open: boolean; mode: 'ok' | 'parse' | 'validation'; errors: string[] }>({
    open: false, mode: 'ok', errors: []
  })

  const onSave = async () => {
    if (lastError) {
      setModal({ open: true, mode: 'parse', errors: [`Parse error: ${lastError}`] })
      return
    }
    const res = validate()
    if (!res.ok && !skipValidationWarning) {
      setModal({ open: true, mode: 'validation', errors: res.messages })
      return
    }
    await savePrinted()
  }

  const onValidate = () => {
    if (lastError) {
      setVmodal({ open: true, mode: 'parse', errors: [`Parse error: ${lastError}`] })
      return
    }
    const res = validate()
    if (res.ok) setVmodal({ open: true, mode: 'ok', errors: [] })
    else setVmodal({ open: true, mode: 'validation', errors: res.messages })
  }

  const closeSaveModal = () => setModal(s => ({ ...s, open: false }))
  const confirmSaveModal = async () => {
    if (modal.mode === 'parse') await saveRaw()
    else await savePrinted()
    closeSaveModal()
  }
  const altConfirm = async () => { await savePrinted(); closeSaveModal() }

  // Ctrl/Cmd+S: Save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isSave = (e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)
      if (!isSave) return
      e.preventDefault()
      onSave()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSave])

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="w-full p-2 flex items-center gap-2 justify-start">
        <h1 className="text-xl font-bold mr-4">Gherkin Editor</h1>
        <button className="btn" onClick={newFile}>New</button>
        <button className="btn" onClick={onOpen}>Open</button>
        <button className="btn" onClick={onSave}>Save</button>
        <button className="btn" onClick={onValidate}>Validate</button>
        <button className="btn" onClick={toggleLayout}>Layout: <span className="capitalize italic">{layout}</span></button>
      </div>

      {/* Centered modals */}
      <SaveWarningModal
        open={modal.open}
        mode={modal.mode}
        errors={modal.errors}
        onConfirm={confirmSaveModal}
        onAltConfirm={modal.mode === 'parse' ? altConfirm : undefined}
        onCancel={closeSaveModal}
        skip={modal.mode === 'validation'
          ? { value: skipValidationWarning, onChange: setSkipValidationWarning }
          : undefined}
      />
      <ValidationModal
        open={vmodal.open}
        mode={vmodal.mode}
        errors={vmodal.errors}
        onClose={() => setVmodal(s => ({ ...s, open: false }))}
      />
    </header>
  )
}
