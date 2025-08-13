import { useRef, useEffect } from 'react'

type Dir = 'horizontal' | 'vertical'

export function ResizableSplit({
  dir,
  ratio,
  onRatio,
  a,
  b,
}: {
  dir: Dir
  ratio: number // 0..1
  onRatio: (r: number) => void
  a: React.ReactNode
  b: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const GUTTER = 8 // px

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      if (dir === 'horizontal') {
        const x = e.clientX - rect.left
        onRatio(Math.min(0.9, Math.max(0.1, (x - GUTTER / 2) / (rect.width - GUTTER))))
      } else {
        const y = e.clientY - rect.top
        onRatio(Math.min(0.9, Math.max(0.1, (y - GUTTER / 2) / (rect.height - GUTTER))))
      }
      e.preventDefault()
    }
    const stop = () => (draggingRef.current = false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', stop)
    window.addEventListener('mouseleave', stop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', stop)
      window.removeEventListener('mouseleave', stop)
    }
  }, [dir, onRatio])

  const startDrag = () => { draggingRef.current = true }

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const step = e.shiftKey ? 0.1 : 0.02
    if (dir === 'horizontal') {
      if (e.key === 'ArrowLeft') { onRatio(ratio - step); e.preventDefault() }
      if (e.key === 'ArrowRight') { onRatio(ratio + step); e.preventDefault() }
    } else {
      if (e.key === 'ArrowUp') { onRatio(ratio - step); e.preventDefault() }
      if (e.key === 'ArrowDown') { onRatio(ratio + step); e.preventDefault() }
    }
  }

  const gridStyle =
    dir === 'horizontal'
      ? { gridTemplateColumns: `${ratio * 100}% ${GUTTER}px 1fr` }
      : { gridTemplateRows: `${ratio * 100}% ${GUTTER}px 1fr` }

  const gutterCommon =
    'bg-neutral-200 rounded-full hover:bg-neutral-300 active:bg-neutral-400'

  return (
    <div
      ref={containerRef}
      className="grid gap-2 h-full min-h-0"
      style={gridStyle}
    >
      {/* Pane A */}
      <div className="min-w-0 min-h-0 overflow-hidden">{a}</div>

      {/* Gutter */}
      <div
        role="separator"
        aria-orientation={dir === 'horizontal' ? 'vertical' : 'horizontal'}
        tabIndex={0}
        onMouseDown={startDrag}
        onKeyDown={onKeyDown}
        className={`${gutterCommon} ${dir === 'horizontal' ? 'cursor-col-resize' : 'cursor-row-resize'}`}
        style={{
          width: dir === 'horizontal' ? `${GUTTER}px` : undefined,
          height: dir === 'vertical' ? `${GUTTER}px` : undefined,
        }}
        title="Drag to resize"
      />

      {/* Pane B */}
      <div className="min-w-0 min-h-0 overflow-hidden">{b}</div>
    </div>
  )
}
