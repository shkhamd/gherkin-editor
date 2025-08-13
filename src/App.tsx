import { AppShell } from './components/AppShell'
import { EditorPane } from './components/EditorPane'
import { PreviewPane } from './components/PreviewPane'
import { useEditorStore } from './store/editorStore'
import { ResizableSplit } from './components/ResizableSplit'

export default function App() {
  const { layout, splitRatio, setSplitRatio, splitRatioStack, setSplitRatioStack } = useEditorStore()
  const sideBySide = layout === 'side'

  return (
 <div className="h-full bg-neutral-50 text-neutral-900 flex flex-col">
   <AppShell />
   <div className="p-2 flex-1 min-h-0">
        {sideBySide ? (
          <ResizableSplit
            dir="horizontal"
            ratio={splitRatio}
            onRatio={setSplitRatio}
            a={
              <section className="rounded-2xl bg-white shadow-sm border p-3 h-full flex flex-col min-w-0 min-h-0">
                <h2 className="text-lg font-semibold mb-2">Editor</h2>
                <EditorPane />
              </section>
            }
            b={
              <section className="rounded-2xl bg-white shadow-sm border p-3 h-full overflow-auto min-w-0 min-h-0">
                <h2 className="text-lg font-semibold mb-2">Preview</h2>
                <PreviewPane />
              </section>
            }
          />
        ) : (
          <ResizableSplit
            dir="vertical"
            ratio={splitRatioStack}
            onRatio={setSplitRatioStack}
            a={
              <section className="rounded-2xl bg-white shadow-sm border p-3 h-full flex flex-col min-w-0 min-h-0">
                <h2 className="text-lg font-semibold mb-2">Editor</h2>
                <EditorPane />
              </section>
            }
            b={
              <section className="rounded-2xl bg-white shadow-sm border p-3 h-full overflow-auto min-w-0 min-h-0">
                <h2 className="text-lg font-semibold mb-2">Preview</h2>
                <PreviewPane />
              </section>
            }
          />
        )}
      </div>
    </div>
  )
}
