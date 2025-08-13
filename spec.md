# Gherkin Editor — Product Specification (v1)

## Scope
A local‑first editor for Cucumber‑style Gherkin **feature files**, one feature per file. Users can open/edit/save `.feature` files, with live preview and simple warnings. The editor permits saving invalid documents (user’s choice) but clearly communicates issues.

---

## Entities & Fields (conceptual, code‑free)

### Feature file (one per document)
- **Feature title** (required)
- **Feature description** (optional, multiline)
- **Background** (optional; at most one)
- **Scenarios** (list, required: must have **≥1** Scenario or Scenario Outline)

### Background (optional)
- Steps list with **exactly one `Given`** as the first step.
- May have **zero or more `And`** steps after the `Given`.
- **Disallowed** in Background: `But`, `When`, `Then`, and leading `And` before `Given`.

### Scenario (type = Scenario)
- **Title** (required)
- **Description** (optional, multiline)
- **Tags** (optional list; user‑defined only — see auto tag rule below)
- **Steps** organized into three **ordered blocks**:
  1) **Given** block — exactly one `Given`, followed by 0+ `And/But`
  2) **When** block — exactly one `When`, followed by 0+ `And/But`
  3) **Then** block — exactly one `Then`, followed by 0+ `And/But`
- **Rules inside a block:**
  - `And/But` may only appear **immediately after** the block’s major step or another continuation in the same block.
  - No leading `And/But` at the very start.
  - No extra major steps and no reordering across blocks.

### Scenario Outline (type = Scenario Outline)
- All the same as **Scenario** for steps (the S‑rules apply).
- Additionally includes **Examples**:
  - **Headers:** at least one header column.
  - **Rows:** at least one row; each row has exactly as many values as headers.
  - **Placeholders:** any `<param>` used in step text must appear in **Headers**. (Unused headers may warn but are allowed in v1.)

### Tags
- **Auto tag (implicit):** Each scenario (Scenario or Outline) is **always printed** with a default tag **`@scenario.<n>`**, where **`n`** is the 1‑based position of that scenario in the feature file (top to bottom).
  - The auto tag is **derived** and **not stored** in the model.
  - When scenarios are reordered/inserted/deleted/duplicated, the printed numbers **renumber** accordingly.
- **User tags (explicit):** Users can add their own tags; these are stored and printed on the same line as the auto tag.
  - Duplicates are deduplicated when printing (case‑insensitive).
  - The parser **ignores** any `@scenario.<number>` tags in source files (they are treated as implicit).

---

## Parsing & Printing (import/export)

### Printing (model → `.feature` text)
- Order:
  1) `Feature:` line, then optional feature description lines (indented two spaces)
  2) Optional **`Background:`** (with its steps)
  3) For each scenario, in order from top to bottom:
     - A **tags** line that **always includes** `@scenario.<n>` plus any user tags
     - The **Scenario** or **Scenario Outline** heading with title
     - Optional scenario description lines (indented four spaces)
     - Steps (indented four spaces)
     - (For outlines) an **`Examples:`** block with headers and rows
- Keywords are printed **capitalized** (`Given`, `When`, …).

### Parsing (text → model)
- Accept **English keywords**, case‑insensitive.
- Preserve description text (minus leading/trailing blank lines).
- Ignore lines that are pure `# comments`.
- Background steps become a list; Scenario/Outline steps become a list.
- Tags: collect tokens from `@tag` lines; **drop** any `@scenario.<n>` entries and store only user tags (without the `@`).

---

## Validation Rules (what “valid” means)

### Doc‑level
- **D1 — Presence:** There must be **at least one** Scenario or Scenario Outline.
- **D2 — Validity:** **All** scenarios in the file must be complete and valid (per S‑ or O‑rules).
- **D3 — Background (if present):** Must pass B‑rules.

### Background
- **B1:** First step is `Given`.
- **B2:** After the `Given`, only `And` steps are allowed (0+).
- **B3:** `But`, `When`, `Then` are disallowed; no leading `And` before the `Given`.

### Scenario
- **S1:** Exactly one `Given`, one `When`, one `Then`, in that order (three blocks).
- **S2:** Each block may include 0+ `And/But` continuations directly after its major step.
- **S3:** No leading `And/But`; no cross‑block continuations; no extra major steps.

### Scenario Outline
- **O1:** S‑rules apply to its steps.
- **O2:** `Examples` exist with ≥1 header and ≥1 row; all rows match header width.
- **O3:** Every `<param>` in step text appears in `Examples` headers. (Unused headers may warn.)

---

## UI/UX Behaviors (policy, not layout)

- **New File:** Seed with **one complete scenario** using a simple, valid three‑step template (users can change or delete).
- **Delete Scenario:** Always allowed, even the last one. If deleting the last, show a confirm:  
  “This will leave the feature with 0 scenarios (invalid). Continue?”
- **Invalid State:** When doc is invalid (fails any rule):
  - Preview still renders; show a small “Invalid” chip/badge.
  - **Save / Save As** prompt with a confirm showing the top issues; user may **Save anyway**.
  - (Optional setting later) Strict mode that disables Save until valid.
- **Tags UI:** A thin, subtle user‑tags input on each Scenario card; below it, a read‑only hint:  
  “Auto tag: `@scenario.<n>`”.

---

## Error Reporting (examples)
- `doc.noScenarios` — “Add at least one Scenario or Scenario Outline.”
- `background.onlyGivenAnd` — “Background: one Given, then And steps only.”
- `scenario.missingMajors` — “Scenario {i} must have exactly one Given, one When, one Then.”
- `scenario.order` — “Scenario {i} must follow Given → When → Then.”
- `scenario.leadingAnd` — “Scenario {i}: first step cannot be And/But.”
- `outline.examplesMissing` — “Scenario Outline {i}: Examples need headers and at least one row.”
- `outline.missingParam` — “Scenario Outline {i}: `<param>` used in steps but missing from Examples headers.”

---

## Test Cases (happy paths & edge cases)
1) **Single scenario, valid** → prints with `@scenario.1`; Save without prompts.
2) **Two scenarios, reorder** → printed tags renumber to `@scenario.1`, `@scenario.2` based on order.
3) **Background includes `When`** → validator error; Save shows confirm; printing still reflects current content.
4) **Scenario missing `Then`** → per‑scenario pill shows; Save confirm lists issue; “Save anyway” allowed.
5) **Outline with `<user>` but no header** → validator error; Save confirm lists issue.
6) **Open file containing `@scenario.7` as first scenario** → parser strips it; preview prints `@scenario.1`.
7) **Delete down to 0 scenarios** → confirm shows; preview shows “Invalid” chip; Save prompts with `doc.noScenarios`.
8) **User tags** (`@smoke @login`) → printed alongside auto tag; duplicates deduped on print.

---

## Non‑Goals (v1)
- `Rule` sections, Rule‑level Backgrounds.
- Non‑English Gherkin keywords.
- Step **DocStrings** or data tables.
- Feature‑level tags.
- Server‑side storage; collaboration.

---

## Save / Open Policy
- **Open:** Parse; if errors, display them and let user decide whether to replace current doc.
- **Save / Save As:** Always available. If invalid, show confirm with **Save anyway** / Cancel.
- **Clipboard:** Copy Gherkin is always available.

---

## Notes
- Keywords are normalized to capitalized when printing.
- Descriptions are preserved verbatim (except trimming surrounding blank lines).
- Auto tag is derived, never stored; parser strips it, printer regenerates it.
