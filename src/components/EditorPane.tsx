import { useEditorStore } from '../store/editorStore'

export function EditorPane() {
  const { rawText, setRawText, validate, lastError } = useEditorStore()

  // Run validators when there is no parse error
  const validation = validate()
  const hasParseError = Boolean(lastError)
  const messages = hasParseError
    ? [`Parse error: ${lastError}`]
    : (validation.ok ? [] : validation.messages)

  const footerState = hasParseError
    ? 'error'
    : (validation.ok ? 'ok' : 'warn')

  return (
    <div className="flex flex-col h-full min-h-0">
      <textarea
        className="w-full flex-1 min-h-0 border rounded-xl p-3 font-mono text-sm resize-none"
        placeholder="Paste or type your .feature here. Saving will reprint from the model."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />
      <EditorFooter state={footerState} messages={messages} />
    </div>
  )
}

function EditorFooter({ state, messages }: { state: 'ok' | 'warn' | 'error', messages: string[] }) {
  const base = 'mt-2 rounded-xl border text-sm px-3 py-2'
  const tone =
    state === 'ok'
      ? 'border-green-300 bg-green-50 text-green-800'
      : state === 'warn'
      ? 'border-amber-300 bg-amber-50 text-amber-800'
      : 'border-red-300 bg-red-50 text-red-800'

  return (
    <div className={`${base} ${tone}`}>
      {state === 'ok' && <span>Valid ✅</span>}
      {state !== 'ok' && (
        <ul className="list-disc pl-5 space-y-1">
          {messages.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      )}
    </div>
  )
}
