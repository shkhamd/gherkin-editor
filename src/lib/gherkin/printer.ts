import { Feature, ScenarioLike } from './model'
import { formatExamplesTable } from './table'

export function printFeature(f: Feature): string {
  const out: string[] = []

  out.push(f.title)

  // Feature description: print immediately after title (no extra newline),
  // then exactly one blank line before the next section.
  const fdesc = normalizeBlock(f.description)
  if (fdesc.length) {
    out.push(...fdesc)
    sep(out) // one blank line after description
  }

  // Background (optional)
  if (f.background) {
    sep(out)
    out.push('Background:')
    out.push('  ' + f.background.given)
    for (const a of f.background.and) out.push('  ' + a)
  }

  // Scenarios / Outlines
  f.scenarios.forEach((s, idx) => {
    sep(out)
    out.push(autoTag(idx) + (s.userTags.length ? ' ' + s.userTags.join(' ') : ''))
    if (s.isOutline) out.push(`Scenario Outline: ${s.name}`)
    else out.push(`Scenario: ${s.name}`)

    // Scenario description (optional): no extra blank around it; indent non-blank lines
    const sdesc = normalizeBlock(s.description)
    if (sdesc.length) {
      for (const line of sdesc) out.push(line ? `  ${line}` : '')
    }

    emitSteps(out, s)

    if (s.isOutline) {
      out.push('Examples:')
      //out.push('  | ' + s.examples.headers.join(' | ') + ' |')
      //for (const row of s.examples.rows) out.push('  | ' + row.join(' | ') + ' |')
      out.push(...formatExamplesTable(s.examples.headers, s.examples.rows))
    }
  })

  return out.join('\n')
}

function emitSteps(out: string[], s: ScenarioLike) {
  out.push('  ' + s.steps.given)
  for (const a of s.steps.andGiven) out.push('  ' + a)
  out.push('  ' + s.steps.when)
  for (const a of s.steps.andWhen) out.push('  ' + a)
  out.push('  ' + s.steps.then)
  for (const a of s.steps.andThen) out.push('  ' + a)
}

export function autoTag(i: number) {
  return `@scenario.${i + 1}`
}

// Ensure exactly one blank line between sections
function sep(out: string[]) {
  if (out.length && out[out.length - 1] !== '') out.push('')
}

// Trim trailing whitespace and remove leading/trailing blank lines.
// (Preserves intentional internal blank lines.)
// Remove only leading/trailing *blank* lines; preserve internal formatting & spaces
function normalizeBlock(text?: string): string[] {
  if (!text) return []
  const lines = text.split('\n')
  while (lines.length && lines[0].trim() === '') lines.shift()
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop()
  return lines
}
