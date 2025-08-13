import { Feature, ScenarioLike } from './model'

export function validateFeature(f: Feature): { ok: boolean; messages: string[] } {
  const msgs: string[] = []
  if (!f.title.startsWith('Feature:')) msgs.push('Title must start with "Feature:"')
  if (f.background) {
    if (!f.background.given.startsWith('Given ')) msgs.push('Background must start with exactly one Given')
    for (const a of f.background.and) if (!a.startsWith('And ')) msgs.push('Background And must start with "And "')
    // Only one Given allowed per spec
    // (not strictly enforced beyond single given field in model)
  }
  if (!f.scenarios.length) msgs.push('At least one Scenario or Scenario Outline is required')

  f.scenarios.forEach((s, idx) => {
    const p = `Scenario #${idx + 1}: `
    if (!s.steps.given.startsWith('Given ')) msgs.push(p + 'Must have a Given')
    if (!s.steps.when.startsWith('When ')) msgs.push(p + 'Must have a When')
    if (!s.steps.then.startsWith('Then ')) msgs.push(p + 'Must have a Then')
    // Outline checks
    if (s.isOutline) {
      if (!s.examples.headers.length) msgs.push(p + 'Scenario Outline requires Examples headers')
      if (!s.examples.rows.length) msgs.push(p + 'Scenario Outline requires at least one Examples row')
      // ensure all <param> exist in headers (simple check)
      const headerSet = new Set(s.examples.headers)
      const paramRe = /<([^>]+)>/g
      const allParams = new Set<string>()
      ;[s.steps.given, ...s.steps.andGiven, s.steps.when, ...s.steps.andWhen, s.steps.then, ...s.steps.andThen].forEach(line => {
        for (const m of line.matchAll(paramRe)) allParams.add(m[1])
      })
      for (const p2 of allParams) if (!headerSet.has(p2)) msgs.push(p + `Missing Examples header for <${p2}>`)
    }
  })

  return { ok: msgs.length === 0, messages: msgs }
}
