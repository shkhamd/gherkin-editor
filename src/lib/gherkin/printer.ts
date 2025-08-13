import { Feature, ScenarioLike } from './model'

export function printFeature(f: Feature): string {
  const out: string[] = []
  out.push(f.title)

  if (f.description && f.description.trim() !== '') {
    out.push('', ...f.description.split('\n')) // keep spacing
  }

  if (f.background) {
    out.push('', 'Background:')
    out.push('  ' + f.background.given)
    for (const a of f.background.and) out.push('  ' + a)
  }

  f.scenarios.forEach((s, idx) => {
    out.push('', autoTag(idx) + (s.userTags.length ? ' ' + s.userTags.join(' ') : ''))
    if (s.isOutline) out.push(`Scenario Outline: ${s.name}`)
    else out.push(`Scenario: ${s.name}`)

    // Scenario description (optional)
    if (s.description && s.description.trim() !== '') {
      for (const line of s.description.split('\n')) {
        out.push(line ? `  ${line}` : '') // keep blank lines; indent non-blank
      }
    }

    emitSteps(out, s)
    if (s.isOutline) {
      out.push('Examples:')
      out.push('  | ' + s.examples.headers.join(' | ') + ' |')
      for (const row of s.examples.rows) out.push('  | ' + row.join(' | ') + ' |')
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
