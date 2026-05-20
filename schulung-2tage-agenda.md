# Atelier 2-Tages-Schulung — Curriculum

## Kontext

Aus den vorhandenen Atelier-Inhalten (Docs, `plan/*.md`, hosted Storybooks, MCP-Server, 27 produktive Komponenten in A/R/V, `figma-workspace-architect` Skill) wird eine 2-Tages-Schulung gebaut.

- **Zielgruppe:** Entwickler mit solider Frontend-Basis, aber wenig Erfahrung mit Figma, Storybook, MCP und AI-Codegen
- **Sprache:** Deutsch
- **Framework:** jeder Teilnehmer wählt sein eigenes (Angular / React / Vue) — Code ist zweitrangig
- **Hauptlernziel:** KI-gestützter Design-to-Code-Workflow
- **Endergebnis:** am Ende von Tag 2 hat jeder Teilnehmer eine **selbst designte und implementierte Komponente** in Figma + Storybook + Code im gewählten Framework
- **Format pro Tag:** ~7–8h netto, 60min Mittag, 2× 15min Kaffeepausen, kleine Mikro-Pausen

---

## Tag 1 — Werkzeuge verstehen & Workflow einmal end-to-end durchlaufen

**Tagesziel:** Jeder Teilnehmer hat ein laufendes Setup, kennt alle vier Pillars (Figma · Storybook · MCP · Claude Code) und hat einmal end-to-end eine existierende Atelier-Komponente per Prompt verändert.

| Block | Zeit | Format | Inhalt | Quellen / MCP / Skill |
|-------|------|--------|--------|-----------------------|
| **0. Kickoff** | 09:00–09:30 (30m) | Vortrag + Live-Demo | Warum component-driven? Warum AI? Live-Demo: in 5min eine Atelier-Komponente per Prompt cross-framework abändern. Was lernen Teilnehmer in 2 Tagen, was nicht. | `plan/big-picture.md`, `docs/src/pages/index.astro`, `docs/src/pages/llms.astro` |
| **1. Setup & Preflight** | 09:30–10:45 (75m) | Hands-on | `create-atelier-ui-workspace`, `npm run preflight`, Claude Code CLI installieren, Figma-Account/Token, MCP-Konfig in `.claude/settings.json` lesen und verstehen | `docs/src/pages/workshop.astro`, `docs/src/pages/figma-token.astro`, `docs/src/pages/troubleshooting.astro`, `docs/src/pages/install.astro` |
| Kaffeepause | 10:45–11:00 | | | |
| **2. Figma für Entwickler** | 11:00–12:15 (75m) | Geführte Tour | Wie Designer denken. Atelier-File öffnen (`QMnDD8uZQPldPrlCwZZ58T`). Variables / Tokens (Primitives → Semantic → Component). Component-Sets, Variants, Component Properties, Auto Layout, Modes (light/dark). Inventory- vs Components-Page. | `plan/figma.md`, `docs/src/pages/figma.astro`, `docs/src/pages/tokens.astro`, `docs/src/pages/figma-token.astro`, CLAUDE.md „Figma File"-Abschnitt |
| Mittag | 12:15–13:15 | | | |
| **3. Storybook als API-Wahrheit** | 13:15–14:30 (75m) | Hands-on Vergleich | Was ist Storybook, was sind Stories, Prop-Tables. Hosted Storybooks öffnen (`atelier.pieper.io/storybook-{angular,react,vue}`). Selbe Komponente (z.B. `Button`) in allen drei vergleichen → Parität spürbar machen. `libs/spec` als Quelle der Wahrheit. **Storybook 10.4-Note (2 min):** Agentic Setup (`npm create storybook@latest`), React-Docgen via TypeScript Language Server (schärfere Prop-Tabellen), Change Review Sidebar (filtert neue/geänderte Stories nach Git-Diff). | `docs/src/pages/storybook.astro`, `libs/spec/src/index.ts`, hosted Storybooks, [Storybook 10.4 Release Notes](https://storybook.js.org/releases/10.4) |
| Kaffeepause | 14:30–14:45 | | | |
| **4. MCP & Claude Code Grundlagen** | 14:45–16:00 (75m) | Hands-on Demo | Was ist MCP? Welche Server sind aktiv (`storybook-{angular,react,vue}`, `nx-mcp`, `figma-console`, `uianatomy`)? **Hosted vs. lokale Storybook-MCP-Surface** explizit zeigen: hosted = `atelier.pieper.io/storybook-*/mcp` (3 Docs-Tools für alle Frameworks); lokal = `http://localhost:6006/mcp` nach `nx storybook <fw>` (zusätzlich `preview-stories`, `run-story-tests`, `get-storybook-story-instructions` — laut Storybook 10.4 offiziell React-Preview, Vue/Angular experimentell). Live-Übung: Claude per Prompt nach Button-Props fragen (hosted), Token-Werte ausgeben lassen, Storybook-Preview im Chat sehen (lokal, React). Skills-Konzept (z.B. `figma-workspace-architect`, `atelier-design`) kurz vorstellen. | `docs/src/pages/mcp.astro`, `docs/src/pages/storybook.astro` (Step 03 Tool-Tabelle), `docs/src/pages/agent-skills.astro`, `docs/src/pages/claude-md.astro`, `docs/src/pages/skills/figma-workspace-architect.astro` |
| Mikro-Pause | 16:00–16:10 | | | |
| **5. Geführter End-to-End-Walkthrough** | 16:10–17:15 (65m) | Hands-on, alle synchron | Das offizielle `/tutorial`: Figma → MCP → Token-genauer Code in 5 Schritten. Teilnehmer prompten Claude in ihrem gewählten Framework, ändern eine vorhandene Komponente (z.B. neuer `Button`-Tone). Wichtig: **nicht selbst tippen, sondern prompten**. | `docs/src/pages/tutorial.astro`, `docs/src/pages/first-component.astro`, `docs/src/pages/prompts.astro` |
| **6. Wrap-up Tag 1** | 17:15–17:30 (15m) | Diskussion | Was war überraschend? Wo hat AI sauber funktioniert, wo nicht? Vorschau Tag 2 + optionale Hausaufgabe: kleine Komponente skizzieren (Toast / Tag-Chip / Stat-Card / Badge). | |

**Tag-1-Lieferergebnis pro Teilnehmer:**

- laufendes Atelier-Workspace mit grünem `preflight`
- mindestens ein erfolgreicher Prompt-zu-Code-Roundtrip
- Verständnis: Figma = Quelle, Storybook = Spec, MCP = Verbindung, Claude = Ausführung

---

## Tag 2 — Eigene Komponente bauen (Figma → Storybook → Code)

**Tagesziel:** Jeder Teilnehmer hat **eine selbst gestaltete Komponente** durchgängig produziert: Figma-Spec mit Variants & Tokens, generierte Story, generierter Code im gewählten Framework, A11y-Check bestanden, Dark Mode funktioniert.

**Komponenten-Brief (vom Trainer vorbereitet, klein gehalten):**
Empfehlung: `Toast`, `StatCard`, `TagChip` oder `Avatar`. Klein genug für einen Tag, groß genug für ≥2 Variants + Properties + States.

| Block | Zeit | Format | Inhalt | Quellen / MCP / Skill |
|-------|------|--------|--------|-----------------------|
| **0. Recap & Brief** | 09:00–09:30 (30m) | Vortrag | Tag-1-Recap, Komponenten-Brief vorstellen (Anatomie, Axes, States, A11y-Anforderungen). `uianatomy` MCP als Hilfsmittel zeigen. | `plan/design-principles.md`, `uianatomy` MCP via `uianatomy-mcp` Skill |
| **1. Design in Figma** | 09:30–11:00 (90m) | Hands-on | Eigenes Component-Set in Atelier-File anlegen: Variants, Component Properties, Auto Layout, korrekte Tokens (`--ui-*` Schicht), Dark-Mode-Variante. Skill als Co-Pilot: `figma-workspace-architect` für Architekturentscheidungen, MCP-Tools für Mutation. | `figma-workspace-architect` Skill, `figma-console` MCP (`figma_create_*`, `figma_add_component_property`, `figma_audit_component_accessibility`), `atelier-design` Skill |
| Kaffeepause | 11:00–11:15 | | | |
| **2. Spec & Story per Prompt** | 11:15–12:30 (75m) | Prompt-Übung | API in Worten beschreiben → von Claude eine Spec (im Stil von `libs/spec/src/index.ts`) und eine Storybook-Story generieren lassen. Schwerpunkt: LLM-optimierte API-Regeln aus `big-picture.md` (predictable naming, literal unions, composition über config, keine versteckten Defaults). Iterieren bis Prop-Table passt. **React-Teilnehmer:** `nx storybook react` parallel laufen lassen, dann `get-storybook-story-instructions` über die lokale MCP abrufen, bevor die Story geschrieben wird. **Angular/Vue-Teilnehmer:** `plan/big-picture.md` direkt zur Hand nehmen und ggf. eine React-Story als Vorlage holen (`get-documentation-for-story` über die hosted MCP). | `plan/big-picture.md`, `docs/src/pages/llms.astro`, `docs/src/pages/prompts.astro`, `get-storybook-story-instructions` (React-lokal), `get-documentation-for-story` (hosted) |
| Mittag | 12:30–13:30 | | | |
| **3. Codegen im Wunsch-Framework** | 13:30–15:00 (90m) | Prompt-Übung | Claude die Implementierung im gewählten Framework generieren lassen. **Fokus: Prompts schreiben, Output bewerten, korrigieren — nicht selbst tippen.** **Test-Loop pro Framework:** React → `preview-stories` + `run-story-tests` über lokale addon-MCP (`localhost:6006/mcp` nach `nx storybook react`). Angular/Vue → `nx test <lib>` (Vitest) als Test-Loop + Story manuell in der laufenden Storybook-Instanz im Browser prüfen (preview/test-Tools für Angular/Vue laut Storybook 10.4 noch nicht offiziell freigegeben). Typische Fehler: erfundene Props, fehlende Tokens, falscher Slot — wie korrigieren. | Storybook MCP lokal (React: `preview-stories`, `run-story-tests`); `nx test` für Angular/Vue; Angular CLI MCP / Nx MCP; `claude-md.astro` für Projekt-Kontext |
| Kaffeepause | 15:00–15:15 | | | |
| **4. A11y + Dark Mode + States** | 15:15–16:30 (75m) | Hands-on | `figma-audit-component-accessibility` laufen lassen, Befunde von Claude beheben lassen. ARIA-Anforderungen, Fokus-Ring via Tokens, Hover/Active/Disabled, Dark-Mode-Drift checken. | `docs/src/pages/accessibility.astro`, `docs/src/pages/a11y-workflow.astro`, `figma_audit_component_accessibility`, `figma_scan_code_accessibility` |
| Mikro-Pause | 16:30–16:40 | | | |
| **5. Show & Tell + Best Practices** | 16:40–17:30 (50m) | Präsentation + Diskussion | Jeder Teilnehmer zeigt 3–5min seine Komponente. Trainer-Synthese: Prompt-Patterns die geklappt haben, Anti-Patterns, wann Claude scheitert, wie man mit Drift umgeht. Ausblick: produktiver Einsatz im eigenen Repo, eigene CLAUDE.md, eigene Skills. | `docs/src/pages/patterns.astro`, `docs/src/pages/claude-md.astro` |

**Tag-2-Lieferergebnis pro Teilnehmer:**

- eigene Komponente im Atelier-Figma-File (Component-Set mit Variants + Properties + Dark-Mode)
- generierte Spec + Story im eigenen Workspace
- funktionierende Implementierung im gewählten Framework
- A11y-Audit bestanden

---

## Material- und Lücken-Übersicht

| Vorhanden (direkt nutzbar) | Lücke (Trainer muss vorbereiten) |
|----------------------------|----------------------------------|
| `/workshop`, `/tutorial`, `/first-component` als geführte Pfade | **Komponenten-Brief** für Tag 2 (1 Seite PDF: Anatomy, States, A11y-Anforderungen) |
| 27 Referenz-Komponenten in A/R/V mit Stories | **Slide-Deck** für die Vortrags-Blöcke (Kickoff, Recap, Show & Tell) — aus Doku-Seiten ableitbar |
| Hosted Storybook-MCPs + Figma-MCP + Nx-MCP + uianatomy-MCP | **Pre-Workshop-Mail**: Account-Setup (Figma, Anthropic API-Key / Claude Code), Hardware-Voraussetzungen |
| `figma-workspace-architect`, `atelier-design`, `uianatomy-mcp` Skills | **Trainer-Spickzettel**: typische Fehler / Prompts pro Block (Tag 1 Block 5, Tag 2 Block 3 und 4) |
| `preflight`-Script mit Fix-Hints | **Backup-Workspace** mit fertigen Komponenten, falls jemand komplett stuck ist |
| `plan/big-picture.md` als Quelle der LLM-API-Regeln | **Übungs-Brief-Varianten** (Toast / Chip / StatCard / Avatar) zur Auswahl |
| Hosted Storybook-MCP-Endpoints (3 Docs-Tools) per `.mcp.json` | **Lokale MCP-Konfig-Snippets** für Tag 2 Block 3: `http://localhost:6006/mcp`-Eintrag, der die React-Teilnehmer-Maschine an die Test-Tools koppelt; Hinweis für Angular/Vue auf `nx test`-Loop |

---

## Erfolgs-Verifizierung

End-to-End-Check am Ende von Tag 2 pro Teilnehmer:

1. Komponente liegt als Component-Set im Atelier-Figma-File (auf einer Schulungs-Page)
2. `npm run preflight` weiter grün
3. `nx serve <workshop-fw>` zeigt Komponente in einer kleinen Demo-Page
4. Test-Loop grün: React → `run-story-tests` MCP-Call passes; Angular/Vue → `nx test <lib>` passes + Story manuell im laufenden Storybook im Browser sichtbar
5. `figma_audit_component_accessibility` ohne kritische Findings
6. Dark Mode wird durch Token-Override korrekt umgeschaltet (`prefers-color-scheme`)

---

## Kritische Dateien als Trainings-Referenz

- `plan/big-picture.md` — API-Designregeln für LLM-Codegen (Tag 2 Block 2)
- `plan/design-principles.md` — Motion, Surface, Dark Mode (Tag 2 Block 4)
- `plan/figma.md` — Figma-Architektur, Token-Mapping (Tag 1 Block 2)
- `docs/src/pages/workshop.astro` — Setup-Pfad (Tag 1 Block 1)
- `docs/src/pages/tutorial.astro` — Geführter Walkthrough (Tag 1 Block 5)
- `docs/src/pages/prompts.astro` — Prompt-Patterns (Tag 2 Block 2/3)
- `docs/src/pages/accessibility.astro` + `a11y-workflow.astro` — A11y (Tag 2 Block 4)
- `docs/src/pages/mcp.astro` + `agent-skills.astro` + `claude-md.astro` — MCP / Skills (Tag 1 Block 4)
- `libs/spec/src/index.ts` — Spec-Vorlage (Tag 2 Block 2)
- CLAUDE.md „Figma File"- + „MCP Servers"-Abschnitte — Konventionen
