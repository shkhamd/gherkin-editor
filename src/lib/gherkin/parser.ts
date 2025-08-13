import { Feature, Scenario, ScenarioOutline, uuid } from './model'

// Permissive single-feature parser with descriptions support.
export function parseFeature(txt: string): Feature {
  const lines = txt.split(/\r?\n/).map(l => l.trimEnd()); // preserve blank lines
  const titleIdx = lines.findIndex(l => l.trimStart().startsWith('Feature:'));
  if (titleIdx < 0) throw new Error('Missing "Feature:" line');
  const title = lines[titleIdx].trim();

  let i = titleIdx + 1;

  const peek = () => (i < lines.length ? lines[i].trim() : '');
  const isStartOfSection = (s: string) =>
    s.startsWith('Background:') || s.startsWith('Scenario Outline:') || s.startsWith('Scenario:');

  // ---- Feature description (all lines until Background/Scenario/Outline) ----
  const featureDescLines: string[] = [];
  while (i < lines.length && !isStartOfSection(peek())) {
    featureDescLines.push(lines[i]); // keep original spacing
    i++;
  }
  // Trim trailing blank lines in description
  while (featureDescLines.length && featureDescLines[featureDescLines.length - 1].trim() === '') {
    featureDescLines.pop();
  }
  const featureDescription = featureDescLines.join('\n') || undefined;

  let backgroundGiven: string | undefined;
  const backgroundAnd: string[] = [];
  const scenarios: (Scenario | ScenarioOutline)[] = [];

  while (i < lines.length) {
    const line = peek();

    // Background
    if (line.startsWith('Background:')) {
      i++;
      // skip blanks
      while (i < lines.length && peek() === '') i++;
      if (i < lines.length && peek().startsWith('Given ')) {
        backgroundGiven = peek(); i++;
        // optional Ands (skip blanks between)
        while (i < lines.length) {
          const cur = peek();
          if (cur === '') { i++; continue; }
          if (cur.startsWith('And ')) { backgroundAnd.push(cur); i++; continue; }
          break;
        }
        continue;
      }
    }

    // Scenario / Outline
    if (line.startsWith('Scenario Outline:') || line.startsWith('Scenario:')) {
      const isOutline = line.startsWith('Scenario Outline:');
      const name = line.replace('Scenario Outline:', '').replace('Scenario:', '').trim() || 'Untitled';
      i++;

      // optional blank lines
      while (i < lines.length && peek() === '') i++;

      // inline user tags (zero or more lines starting with @)
      const tags: string[] = [];
      while (i < lines.length && peek().startsWith('@')) {
        tags.push(...peek().split(/\s+/).filter(Boolean));
        i++;
      }

      // ---- Scenario description (until first step/examples/next section) ----
      const scenDescLines: string[] = [];
      while (i < lines.length) {
        const cur = peek();
        if (
          cur.startsWith('Given ') || cur.startsWith('When ') || cur.startsWith('Then ') ||
          cur.startsWith('And ') || cur.startsWith('But ') ||
          cur.startsWith('Examples:') ||
          cur.startsWith('Scenario: ') || cur.startsWith('Scenario Outline:') || cur.startsWith('Background:')
        ) break;
        scenDescLines.push(lines[i]); // keep spacing
        i++;
      }
      while (scenDescLines.length && scenDescLines[scenDescLines.length - 1].trim() === '') {
        scenDescLines.pop();
      }
      const scenarioDescription = scenDescLines.join('\n') || undefined;

      // allow blanks before first step
      while (i < lines.length && peek() === '') i++;

      const step = { given: '', andGiven: [] as string[], when: '', andWhen: [] as string[], then: '', andThen: [] as string[] };

      // collect steps
      while (i < lines.length) {
        const ln = peek();
        if (ln.startsWith('Scenario: ') || ln.startsWith('Scenario Outline:') || ln.startsWith('Background:')) break;
        if (isOutline && ln.startsWith('Examples:')) break;
        if (ln === '') { i++; continue; }

        if (ln.startsWith('Given ')) step.given = ln;
        else if (ln.startsWith('When ')) step.when = ln;
        else if (ln.startsWith('Then ')) step.then = ln;
        else if (ln.startsWith('And ') || ln.startsWith('But ')) {
          if (!step.when) step.andGiven.push(ln.replace(/^But /, 'And '));
          else if (!step.then) step.andWhen.push(ln.replace(/^But /, 'And '));
          else step.andThen.push(ln.replace(/^But /, 'And '));
        }
        i++;
      }

      if (isOutline) {
        // tolerate blanks before "Examples:"
        while (i < lines.length && peek() === '') i++;
        if (i >= lines.length || !peek().startsWith('Examples:'))
          throw new Error('Scenario Outline missing Examples');
        i++; // consume "Examples:"

        // tolerate blanks before header
        while (i < lines.length && peek() === '') i++;
        const headerLine = peek();
        if (!headerLine || !headerLine.includes('|')) throw new Error('Examples must have a header row');
        const headers = headerLine.split('|').map(s => s.trim()).filter(Boolean);
        i++;

        const rows: string[][] = [];
        while (i < lines.length) {
          const cur = peek();
          if (cur.startsWith('Scenario: ') || cur.startsWith('Scenario Outline:') || cur.startsWith('Background:')) break;
          if (cur === '') { i++; continue; }
          if (!cur.includes('|')) break;
          const row = cur.split('|').map(s => s.trim()).filter(Boolean);
          if (row.length) rows.push(row);
          i++;
        }

        scenarios.push({ id: uuid(), name, userTags: tags, description: scenarioDescription, steps: step, isOutline: true, examples: { headers, rows } });
      } else {
        scenarios.push({ id: uuid(), name, userTags: tags, description: scenarioDescription, steps: step, isOutline: false });
      }
      continue;
    }

    i++;
  }

  const feature: Feature = {
    title,
    description: featureDescription,
    background: backgroundGiven ? { given: backgroundGiven, and: backgroundAnd } : undefined,
    scenarios
  };
  return feature;
}
