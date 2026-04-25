# promptvault

**[promptvault-alpha.vercel.app](https://promptvault-alpha.vercel.app)**

Local-first LLM prompt injection organizer for red team research. Organize, version, and track attack prompts across challenges and models — everything stays in your browser.

![stack](https://img.shields.io/badge/React_19-Vite_8-blue) ![storage](https://img.shields.io/badge/storage-IndexedDB-green) ![license](https://img.shields.io/badge/license-MIT-gray)

## Features

- **Challenge-first organization** — prompts live under challenges, not just in a flat list
- **Versioning** — every edit creates a new version; full history preserved
- **Run tracking** — log results (bypassed / partial / blocked) per prompt, per model
- **Import** — paste or drop ChatGPT exports, Claude exports, raw JSON, or plain text
- **Export** — dump a workspace to re-importable JSON or a Markdown report
- **Tags** — multi-tag prompts with co-occurrence stats
- **Command palette** — `Ctrl+K` / `⌘K` to search across everything
- **100% offline** — no server, no account, no telemetry

## Stack

| Layer | Tech |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| Storage | Dexie.js (IndexedDB) |
| State | Zustand (UI only) |
| Routing | React Router v7 |
| Styling | Custom CSS with oklch tokens |

## Getting started

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:5173` and click **Open promptvault →** on the onboarding screen.

To load the bundled Gray Swan Safeguards dataset (365 real submissions across 32 challenges), leave **Load sample data** checked. Import takes ~10 seconds.

## Data & privacy

All data is stored in your browser's IndexedDB (`inject-dev` database). Nothing leaves your machine.

**To back up:** Overview → Export JSON  
**To restore:** Import screen → drop the exported `.json`  
**To reset:** DevTools → Application → IndexedDB → `inject-dev` → Delete database

## Project structure

```
app/
  public/
    safeguards.json       # Gray Swan Safeguards dataset (seed data)
  src/
    db/                   # Dexie schema, tables, and hooks
    lib/                  # Parsers, exporters, seed, id generation
    screens/              # Page-level components
    components/           # Shared atoms and layout
    store/                # Zustand UI store
    styles/               # CSS tokens and global styles
screens/                  # Original design mockups (reference)
```

## Challenge workflow

1. Create a challenge (or load from seed)
2. Add prompts via Library or Import
3. Log a run result after testing against a model
4. Track coverage: bypassed / partial / blocked across models
