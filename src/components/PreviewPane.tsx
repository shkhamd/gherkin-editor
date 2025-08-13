import { useEditorStore } from '../store/editorStore'
import { printFeature } from '../lib/gherkin/printer'

export function PreviewPane() {
  const { feature } = useEditorStore()
  const text = printFeature(feature)
  return (
    <pre className="whitespace-pre-wrap font-mono text-sm bg-neutral-50 border rounded-xl p-3 flex-1 min-h-0 overflow-auto">
    {text}
    </pre>
  )
}
