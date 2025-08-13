# Gherkin Editor — Delivery Plan (Modular, Code‑Free)

## Goals
- Build a focused, local‑first Gherkin editor that opens/edits/saves **one feature per file**.
- Keep the UI simple but structured; keep domain rules in a testable library.
- Allow users to **save even when invalid**, but warn clearly (confirm dialog).

## Architecture Layers
1. **UI (`src/components/`, `src/app/`)** – presentation only; emits events.
2. **State (`src/state/`)** – single source of truth (reducer or small store).
3. **Domain (`src/lib/`)** – model, printer (export), parser (import), validators (rules).
4. **Services (`src/services/`)** – File I/O, local storage, clipboard.

## Project Structure (target)
```
src/
  app/
    AppShell.tsx              # Layout frame + toolbar + preview slot
    LayoutContext.tsx         # "below" | "side" persistence
  components/
    Toolbar/
      FileMenu.tsx            # New, Open, Save, Save As
      LayoutSwitch.tsx        # below/right
    Feature/
      FeatureHeader.tsx       # Feature title + description
      BackgroundPanel.tsx     # Background steps list
    Scenario/
      ScenariosList.tsx       # add/remove/reorder scenarios
      ScenarioCard.tsx        # title, description, tags, mode toggle
      StepList.tsx            # list of StepRow with insert/reorder/duplicate
      StepRow.tsx             # atomic block (keyword + text)
      OutlineToggle.tsx       # Scenario ⇄ Scenario Outline
      ExamplesTable.tsx       # headers + rows
    Preview/
      PreviewPane.tsx         # readonly Gherkin + copy/download
  lib/
    model.ts                  # types & constants (no UI assumptions)
    printer.ts                # model → .feature (adds @scenario.<n>)
    parser.ts                 # .feature → model (strips @scenario.<n>)
    validators.ts             # D/B/S/O rules
    reorder.ts                # pure list reordering helpers
  services/
    fileIO.ts                 # FS Access API + upload/download fallback
    storage.ts                # localStorage (layout, autosave, prefs)
    clipboard.ts              # copy with fallback
  state/
    useFeatureStore.ts        # doc state + actions
```

## Milestones (order of work)

### M1 — Domain carve‑out
- Create `lib/model.ts`, `lib/printer.ts`, `lib/parser.ts`, `lib/validators.ts`.
- Move logic out of the current single‑file component into these modules.
- **Done when:** Preview text and open/save behave the same, but editor file shrinks.

### M2 — Central store
- Create `state/useFeatureStore.ts` (doc, file handle, dirty, layout, validation mode).
- Editor reads/writes via store actions.
- **Done when:** Edits update preview; store owns the document.

### M3 — App shell + layout
- `app/AppShell.tsx` provides header/toolbar + editor area + preview area.
- `app/LayoutContext.tsx` or store persists `"below" | "side"`.
- **Done when:** Switch persists; preview is sticky at right in “side” mode.

### M4 — Toolbar & File I/O
- `components/Toolbar/FileMenu.tsx` + `services/fileIO.ts`.
- Save/Save As **always available**; invalid docs prompt with **Save anyway / Cancel**.
- **Done when:** New/Open/Save/Save As work with FS API and fallback.

### M5 — Background panel (constrained)
- `Feature/BackgroundPanel.tsx` + validator warnings (one **Given**, 0+ **And** only).
- **Done when:** Background prints before scenarios; violations show a small pill.

### M6 — Scenarios split + auto tag hint
- `Scenario/*` components; show read‑only hint “Auto tag: @scenario.<n>” under Tags input.
- Printer always emits `@scenario.<n>` (derived); parser strips it.
- **Done when:** Renumbering works on reorder/insert/delete/duplicate.

### M7 — Scenario Outline + Examples
- Outline toggle; examples table with headers/rows.
- Validation for `<param>` ↔ headers; rows width; ≥1 row & header.
- **Done when:** Outline prints with `Examples:`; invalid examples warn and appear in Save confirm.

### M8 — Deletion flow (simple)
- Allow deleting any scenario, including the last; confirm when deleting the last one.
- **Done when:** Empty state shows “+ Add Scenario”; Save prompts on invalid docs.

### M9 — Preview polish
- `PreviewPane.tsx` with Copy, Download; small “Invalid” chip when validators fail.
- **Done when:** Copy/Download always available; error list accessible (drawer optional).

## Validation & Save Policy
- Validators enforce **all scenarios valid** and **≥1 scenario present**.
- Save is **permitted** when invalid, but shows a confirm listing key issues.
- (Optional later) Strict mode: disable Save until valid.

## Acceptance Checklist
- [ ] New seeds a **complete scenario**; user may delete down to 0 (with confirm).
- [ ] Background: 1× Given then 0+ And; no But/When/Then.
- [ ] Every Scenario/Outline: exactly one Given/When/Then in order, And/But inside their blocks.
- [ ] Scenario Outline: Examples with ≥1 header & row; widths match; `<param>`s all declared.
- [ ] Auto tag `@scenario.<n>` always printed; never stored; parser strips if present.
- [ ] Layout switch persists; preview below/right.
- [ ] Open/Save/Save As work with FS API and fallback; invalid → confirm “Save anyway?”.

## Non‑Goals (v1)
- Rules/Rule backgrounds; non‑English keywords; DocStrings/Data Tables in steps; feature‑level tags.
- Server backend — keep it local‑first.
