import React, { useMemo, useState } from "react";

/**
 * Minimal Gherkin Editor
 * - Feature title
 * - Single Scenario title
 * - Steps list: Given/When/Then/And/But (add, edit, delete)
 * - Live Gherkin preview (no file I/O, no tags/background)
 */

type StepType = "Given" | "When" | "Then" | "And" | "But";
type Step = { id: string; type: StepType; text: string };

const STEP_TYPES: StepType[] = ["Given", "When", "Then", "And", "But"];
const PLACEHOLDER: Record<StepType, string> = {
  Given: "preconditions…",
  When: "action/event…",
  Then: "expected outcome…",
  And: "continuation…",
  But: "negative/alternative…",
};
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export default function GherkinBlockEditor() {
  const [featureTitle, setFeatureTitle] = useState("My Feature");
  const [scenarioTitle, setScenarioTitle] = useState("Happy path");
  const [steps, setSteps] = useState<Step[]>([
    { id: uid(), type: "Given", text: "" },
  ]);

  const addStep = (type: StepType) =>
    setSteps((prev) => [...prev, { id: uid(), type, text: "" }]);

  const updateStep = (id: string, patch: Partial<Step>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const deleteStep = (id: string) =>
    setSteps((prev) => prev.filter((s) => s.id !== id));

  const gherkinText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Feature: ${featureTitle.trim() || "Feature"}`);
    lines.push("");
    lines.push(`  Scenario: ${scenarioTitle.trim() || "Scenario"}`);
    steps.forEach((s) => {
      const text = s.text.trim() || "<step>";
      lines.push(`    ${s.type} ${text}`);
    });
    return lines.join("\n");
  }, [featureTitle, scenarioTitle, steps]);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">Minimal Gherkin Editor</h1>
          <p className="text-sm text-slate-600">
            Feature + one Scenario with simple step rows.
          </p>
        </header>

        {/* Feature + Scenario titles */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Feature title
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={featureTitle}
            onChange={(e) => setFeatureTitle(e.target.value)}
            placeholder="Feature title"
          />

          <label className="block text-xs font-medium text-slate-500 mt-3 mb-1">
            Scenario title
          </label>
          <input
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            value={scenarioTitle}
            onChange={(e) => setScenarioTitle(e.target.value)}
            placeholder="Scenario title"
          />
        </section>

        {/* Steps */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Steps</h2>
            <div className="flex flex-wrap gap-2">
              {STEP_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => addStep(t)}
                  className="px-3 py-1.5 rounded-full text-xs border shadow-sm hover:bg-slate-50"
                  type="button"
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>

          {steps.length === 0 && (
            <div className="text-sm text-slate-500 p-4 border border-dashed rounded-xl text-center">
              No steps yet
            </div>
          )}

          <ul className="space-y-2">
            {steps.map((s) => (
              <li key={s.id} className="rounded-xl border bg-white">
                <div className="grid grid-cols-1 md:grid-cols-[110px_1fr_auto] gap-2 p-3 items-center">
                  <select
                    value={s.type}
                    onChange={(e) =>
                      updateStep(s.id, { type: e.target.value as StepType })
                    }
                    className="w-full md:w-[110px] rounded-xl border px-2 py-2 text-sm bg-slate-50"
                  >
                    {STEP_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <input
                    value={s.text}
                    onChange={(e) => updateStep(s.id, { text: e.target.value })}
                    placeholder={PLACEHOLDER[s.type]}
                    className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />

                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Delete"
                      onClick={() => deleteStep(s.id)}
                      className="px-3 py-2 rounded-xl border text-xs hover:bg-rose-50"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Output */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold">Generated Gherkin</h2>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(gherkinText);
                  alert("Copied ✔");
                } catch {
                  alert("Copy failed");
                }
              }}
              className="text-xs px-3 py-1.5 rounded-xl border shadow-sm hover:bg-slate-50"
              type="button"
            >
              Copy
            </button>
          </div>
          <pre className="w-full h-56 overflow-auto font-mono text-sm rounded-xl border p-3 bg-slate-50 whitespace-pre-wrap">
{gherkinText}
          </pre>
        </section>
      </div>
    </div>
  );
}
