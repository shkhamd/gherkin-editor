import { useEditorStore } from '../store/editorStore'
import { openWithFS, saveWithFS } from '../lib/fs'

export function AppShell() {
  const { newFile, saveText, openText, validate, toggleLayout, layout  } = useEditorStore()
  const onOpen = async () => {
    const txt = await openWithFS()
    if (txt != null) openText(txt)
    else alert('Your browser does not support the File System Access API. Use the Editor to paste text or use Save (fallback).')
  }
  const onSave = async () => {
    const txt = saveText()
    await saveWithFS(txt, 'feature.feature')
  }
  const onValidate = () => {
    const res = validate()
    if (res.ok) alert('Valid ✅')
    else alert('Invalid:\n' + res.messages.join('\n'))
  }

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="w-full p-2 flex items-center gap-2 justify-start">
        <h1 className="text-xl font-bold mr-4">Gherkin Editor</h1>
        <button className="btn" onClick={newFile}>New</button>
        <button className="btn" onClick={onOpen}>Open</button>
        <button className="btn" onClick={onSave}>Save</button>
        <button className="btn" onClick={onValidate}>Validate</button>
        <button className="btn" onClick={toggleLayout}>
            Layout: <span className='capitalize italic'>{layout}</span>
        </button>
      </div>
    </header>
  )
}
