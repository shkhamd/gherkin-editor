Project structure

gherkin-editor/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ .gitignore
├─ src/
│  ├─ main.tsx                 # app entry mounts <App/>
│  ├─ App.tsx                  # page shell + layout switcher
│  ├─ components/
│  │  ├─ GherkinBlockEditor.tsx# your editor (from canvas)
│  │  ├─ BackgroundPanel.tsx   # (optional split later)
│  │  ├─ ScenarioCard.tsx      # (optional split later)
│  │  └─ StepRow.tsx           # (optional split later)
│  ├─ lib/
│  │  ├─ gherkinParser.ts      # parse .feature → model
│  │  └─ gherkinPrinter.ts     # model → .feature text
│  ├─ styles/
│  │  └─ index.css             # Tailwind @tailwind base/components/utilities
│  └─ types/
│     └─ gherkin.ts            # Step, Scenario, enums
└─ public/                      # static assets if any

