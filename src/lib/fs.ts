export async function openWithFS(): Promise<string | null> {
  // @ts-ignore - FS Access API
  if (!window.showOpenFilePicker) return null
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: 'Gherkin Feature', accept: { 'text/plain': ['.feature'] } }]
  })
  const file = await handle.getFile()
  return await file.text()
}

export async function saveWithFS(contents: string, suggestedName = 'feature.feature') {
  // @ts-ignore
  if (!window.showSaveFilePicker) return downloadFallback(contents, suggestedName)
  // @ts-ignore
  const handle = await window.showSaveFilePicker({
    suggestedName,
    types: [{ description: 'Gherkin Feature', accept: { 'text/plain': ['.feature'] } }]
  })
  const writable = await handle.createWritable()
  await writable.write(contents)
  await writable.close()
}

export function downloadFallback(contents: string, name: string) {
  const blob = new Blob([contents], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
