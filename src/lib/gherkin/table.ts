// Formats a Gherkin Examples table with equal column widths.
// Preserves cell text exactly; pads with spaces to align columns.
export function formatExamplesTable(
  headers: string[],
  rows: string[][],
  indent = '  '
): string[] {
  const colCount = Math.max(headers.length, ...rows.map(r => r.length || 0))
  const cols = Array.from({ length: colCount }, (_, i) => i)

  // compute max width per column
  const widths = cols.map(i =>
    Math.max(
      (headers[i] ?? '').length,
      ...rows.map(r => (r[i] ?? '').length)
    )
  )

  const fmtRow = (cells: string[]) => {
    const padded = cols.map(i => (cells[i] ?? '').padEnd(widths[i], ' '))
    return `${indent}| ${padded.join(' | ')} |`
  }

  const lines: string[] = []
  lines.push(fmtRow(headers))
  for (const r of rows) lines.push(fmtRow(r))
  return lines
}
