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
| **1. Setup-Verifikation & Preflight** 🔴 | 09:30–10:45 (75m) | Hands-on | **High-Risk Block — Pre-Workshop-Setup ist Pflicht-Hausaufgabe** (siehe Material-Lücken / Pre-Workshop-Mail). Block prüft nur, installiert nicht von Null: Node 20 oder 22 LTS aktiv (`.node-version` empfohlen), pnpm/npm-Version aus `package.json#packageManager`, Repo geklont, Claude Code CLI eingeloggt mit eigenem API-Key, Figma-Account-Token gesetzt, `npm run preflight` lokal grün. Troubleshooting für Nachzügler. Anschließend MCP-Konfig in `.claude/settings.json` gemeinsam lesen und verstehen. | `docs/src/pages/workshop.astro`, `docs/src/pages/figma-token.astro`, `docs/src/pages/troubleshooting.astro`, `docs/src/pages/install.astro` |
| Kaffeepause | 10:45–11:00 | | | |
| **2. Figma für Entwickler** | 11:00–12:15 (75m) | Geführte Tour | Wie Designer denken. Atelier-File öffnen (`QMnDD8uZQPldPrlCwZZ58T`). Variables / Tokens (Primitives → Semantic → Component). Component-Sets, Variants, Component Properties, Auto Layout, Modes (light/dark). Inventory- vs Components-Page. | `plan/figma.md`, `docs/src/pages/figma.astro`, `docs/src/pages/tokens.astro`, `docs/src/pages/figma-token.astro`, CLAUDE.md „Figma File"-Abschnitt |
| Mittag | 12:15–13:15 | | | |
| **3. Storybook als API-Wahrheit** | 13:15–14:30 (75m) | Hands-on Vergleich | Was ist Storybook, was sind Stories, Prop-Tables. Hosted Storybooks öffnen (`atelier.pieper.io/storybook-{angular,react,vue}`). Selbe Komponente (z.B. `Button`) in allen drei vergleichen → Parität spürbar machen. `libs/spec` als Quelle der Wahrheit. **Storybook 10.4-Note (5 min):** (a) Agentic Setup `npm create storybook@latest` mit MCP-Default. (b) Neuer `experimentalReactComponentMeta`-Docgen (Volar + TS Language Server) → schärfere Prop-Tabellen + schnellere HMR; ersetzt `react-docgen` / `react-docgen-typescript`. (c) Change Review Sidebar — filtert neue/geänderte/affected Stories nach Git-Diff; speist später den `get-changed-stories` MCP-Tool. (d) Subcomponent-Docs in `get-documentation` seit `@storybook/mcp@0.7.0`. | `docs/src/pages/storybook.astro`, `libs/spec/src/index.ts`, hosted Storybooks, [Storybook 10.4 Release Notes](https://storybook.js.org/releases/10.4) |
| Kaffeepause | 14:30–14:45 | | | |
| **4. MCP & Claude Code Grundlagen** | 14:45–16:00 (75m) | Hands-on Demo | Was ist MCP? Welche Server sind aktiv (`storybook-{angular,react,vue}`, `nx-mcp`, `figma-console`, `uianatomy`)? **Storybook 10.4 Toolset-Modell** an Tafel: drei Toolsets — `docs` (3 Tools, in beiden Surfaces), `dev` (`get-storybook-story-instructions`, `preview-stories`, `get-changed-stories` — nur lokal), `test` (`run-story-tests` — nur lokal, braucht `@storybook/addon-vitest`; A11y via `@storybook/addon-a11y`). **Hosted vs. lokale Surface** dann konkret: hosted = `atelier.pieper.io/storybook-*/mcp` (nur `docs`-Toolset für alle Frameworks); lokal = `http://localhost:6006/mcp` nach `nx storybook <fw>` (`docs` + `dev` + `test`; preview/test offiziell React, Vue/Angular experimentell). Toolset-Gating in Addon-Optionen (`toolsets: { dev, docs, test }`) zeigen — wann man `test` für Read-Only-Agents deaktiviert. Live-Übung: Claude per Prompt nach Button-Props fragen (hosted), Token-Werte ausgeben lassen, Storybook-Preview im Chat sehen (lokal, React; MCP-Apps-`ui://`-Resource erwähnen). **Negativ-Demo (~5 min):** dieselbe Frage nach Atelier-Button-API im Claude-Browser-Chat **ohne** MCP stellen → Halluzination. Dann mit MCP-Terminal → korrekte Antwort. Skills-Konzept (z.B. `figma-workspace-architect`, `atelier-design`) kurz vorstellen. | `docs/src/pages/mcp.astro`, `docs/src/pages/storybook.astro` (Step 03 Toolset-Tabelle + Step 04 10.4-Highlights + Step 05 Toolset-Config), `docs/src/pages/agent-skills.astro`, `docs/src/pages/claude-md.astro`, `docs/src/pages/skills/figma-workspace-architect.astro` |
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
| **1. Design in Figma** | 09:30–11:00 (90m) | Hands-on | **Pflicht-Vorabschritt:** Teilnehmer dupliziert das Atelier-File in eigene Figma-Drafts (`File → Duplicate to your drafts`). Alle Mutationen, Variants und Token-Edits passieren **ausschließlich im Duplikat** — **niemals im Original-File `QMnDD8uZQPldPrlCwZZ58T`** (das ist Read-Only-Referenz, Variables/Tokens sind dort file-scope und würden global kollidieren). Auto-Layout-Schablone wird beim Duplizieren von der `Workshop-Templates`-Page mitkopiert. **Zeitstruktur:** ~45m manuelles Design im Figma-UI (Layout, Variants, Token-Zuweisung im UI), ~45m MCP-Strukturierung (Component Properties, A11y-Audits). **Rolle figma-console MCP schärfen:** MCP für Metadaten-Strukturierung (Properties anlegen, Tokens zuweisen) und Audits — visuelles Design und Auto-Layout passieren manuell im Figma-UI, nicht per MCP-Mutation (fehleranfällig, Rate-Limits). Eigenes Component-Set anlegen: Variants, Component Properties, korrekte Tokens (`--ui-*` Schicht), Dark-Mode-Variante. Skill als Co-Pilot: `figma-workspace-architect` für Architekturentscheidungen, `atelier-design` für Brand-Konsistenz. | `figma-workspace-architect` Skill, `figma-console` MCP (`figma_create_*`, `figma_add_component_property`, `figma_audit_component_accessibility`), `atelier-design` Skill |
| Kaffeepause | 11:00–11:15 | | | |
| **2. Spec & Story per Prompt** | 11:15–12:30 (75m) | Prompt-Übung | API in Worten beschreiben → von Claude eine Spec (im Stil von `libs/spec/src/index.ts`) und eine Storybook-Story generieren lassen. Schwerpunkt: LLM-optimierte API-Regeln aus `big-picture.md` (predictable naming, literal unions, composition über config, keine versteckten Defaults). Iterieren bis Prop-Table passt. **React-Teilnehmer:** `nx storybook react` parallel laufen lassen, dann `get-storybook-story-instructions` über die lokale MCP abrufen (Pflicht-Tool vor jedem `*.stories.*`-Edit). **Angular/Vue-Teilnehmer:** `plan/big-picture.md` direkt zur Hand nehmen und ggf. eine React-Story als Vorlage holen (`get-documentation-for-story` über die hosted MCP — `storybookId` setzen wenn mehrere Sources konfiguriert sind). | `plan/big-picture.md`, `docs/src/pages/llms.astro`, `docs/src/pages/prompts.astro`, `get-storybook-story-instructions` (React-lokal), `get-documentation-for-story` (hosted) |
| Mittag | 12:30–13:30 | | | |
| **3. Codegen im Wunsch-Framework** | 13:30–15:00 (90m) | Prompt-Übung | Claude die Implementierung im gewählten Framework generieren lassen. **Fokus: Prompts schreiben, Output bewerten, korrigieren — nicht selbst tippen.** **Token-Treue erzwingen:** Golden-Prompts aus Trainer-Spickzettel verwenden, die `--ui-*` Custom Properties verlangen (statt Inline-Styles oder Standard-Tailwind-Klassen). Vor Codegen `plan/big-picture.md` (LLM-API-Regeln) und `plan/design-principles.md` (Surface/Motion/Dark Mode) im Prompt-Kontext referenzieren. **Framework-Framing:** Angular und Vue sind durch Signal-Forms bzw. deklarative Templates exzellente Codegen-Ziele — der lokale Storybook-MCP-Test-Loop ist dort experimentell, der `nx test --watch`-Loop liefert gleichwertig schnelles Feedback. **Test-Loop pro Framework (Toolset-Mapping):** React → `dev`-Toolset (`preview-stories`, optional `get-changed-stories` für Diff-Scope) + `test`-Toolset (`run-story-tests` mit `a11y: true`) über lokale addon-MCP (`localhost:6006/mcp` nach `nx storybook react`). Angular/Vue → `nx test <lib> --watch` (Vitest watch-mode) plus parallel laufende Storybook-Instanz im Browser für visuelles Feedback (`dev`/`test`-Toolsets für Angular/Vue laut Storybook 10.4 noch nicht offiziell freigegeben). **`get-changed-stories`-Mikro-Demo (~5 min, React-only):** `features.changeDetection: true` aktivieren, ein-zwei Stories editieren, Tool über MCP-Inspector aufrufen → Claude scoped Review nur auf den Diff. **AI-gestütztes Debugging (~10 min Mikro-Block):** Compiler- und Test-Fehlermeldungen aus `nx test` oder Storybook-Build per Copy-Paste an Claude zurückgeben statt selbst debuggen — Mindset-Shift explizit demonstrieren. Typische Fehler: erfundene Props, fehlende Tokens, falscher Slot — wie korrigieren. | Storybook MCP lokal (React: `preview-stories`, `run-story-tests`, `get-changed-stories`); `nx test <lib> --watch` für Angular/Vue; Angular CLI MCP / Nx MCP; `plan/big-picture.md`, `plan/design-principles.md`, `claude-md.astro` für Projekt-Kontext |
| Kaffeepause | 15:00–15:15 | | | |
| **4. A11y + Dark Mode + States** | 15:15–16:30 (75m) | Hands-on | **Dreischritt-A11y-Check:** (1) `figma_audit_component_accessibility` für die Figma-Spec, (2) **Storybook A11y-Panel** im Browser (axe-core integriert) — Kontrast- und ARIA-Fehler visuell sehen und beheben, (3) **Keyboard-Walkthrough** — Komponente nur per Tastatur durchspielen (Tab / Shift+Tab / Enter / Escape). Befunde von Claude beheben lassen. ARIA-Anforderungen, Fokus-Ring via Tokens, Hover/Active/Disabled-States. **Dark-Mode-Toggle:** Storybook backgrounds-/theme-Addon nutzen, um Dark Mode visuell zu togglen (nicht nur via `prefers-color-scheme`) — Token-Override-Drift wird so direkt sichtbar. | `docs/src/pages/accessibility.astro`, `docs/src/pages/a11y-workflow.astro`, `figma_audit_component_accessibility`, `figma_scan_code_accessibility`, Storybook A11y-Addon |
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
| `/workshop`, `/tutorial`, `/first-component` als geführte Pfade | **Komponenten-Brief** für Tag 2 (2-seitiges PDF): visuelle Anatomie (Spacing, Radius), API-Definition mit literal-union-Beispiel (z.B. `variant: 'info' \| 'success'`), Keyboard-Interaktions-Matrix (z.B. Toast: `Escape` schließt) |
| 27 Referenz-Komponenten in A/R/V mit Stories | **Slide-Deck** für die Vortrags-Blöcke (Kickoff, Recap, Show & Tell) — aus Doku-Seiten ableitbar |
| Hosted Storybook-MCPs + Figma-MCP + Nx-MCP + uianatomy-MCP | **Pre-Workshop-Mail (Pflicht-Hausaufgabe)**: Step-by-Step-PDF mit Screenshots — Node 20/22 LTS-Pin (`.node-version`), pnpm/npm-Version aus `package.json#packageManager`, Repo-Clone, Claude Code CLI install + Login mit eigenem API-Key, Figma-Account-Token, `npm run preflight` lokal grün vor Schulungsbeginn. Hardware-Voraussetzungen. |
| `figma-workspace-architect`, `atelier-design`, `uianatomy-mcp` Skills | **Trainer-Spickzettel mit Golden-Prompts**: typische Fehler / Prompts pro Block (Tag 1 Block 5, Tag 2 Block 3 und 4). Golden-Prompts erzwingen Token-Treue (`--ui-*` Custom Properties), barrierefreies Markup, Slot-Konventionen — abgeleitet aus `docs/src/pages/prompts.astro` |
| `preflight`-Script mit Fix-Hints | **Backup-Workspace** mit Git-Branches `solved-toast`, `solved-tagchip`, `solved-statcard`, `solved-avatar` — Teilnehmer können per `git checkout solved-<name>` springen, wenn die eigene Komponente komplett kaputt-gepromptet wurde |
| `plan/big-picture.md` als Quelle der LLM-API-Regeln | **Übungs-Brief-Varianten** (Toast / Chip / StatCard / Avatar) zur Auswahl |
| Hosted Storybook-MCP-Endpoints (3 Docs-Tools) per `.mcp.json` | **Lokale MCP-Konfig-Snippets** für Tag 2 Block 3: `http://localhost:6006/mcp`-Eintrag, der die React-Teilnehmer-Maschine an die Test-Tools koppelt; Hinweis für Angular/Vue auf `nx test <lib> --watch`-Loop |
| `figma_create_*` / `figma_add_component_property` MCP-Tools | **Auto-Layout-Schablone in Figma**: vorgefertigte Frames mit Tokens auf einer dedizierten `Workshop-Templates`-Page im Atelier-File — Teilnehmer kopiert die Schablone beim Duplizieren des Files in die eigenen Drafts mit |

---

## Erfolgs-Verifizierung

End-to-End-Check am Ende von Tag 2 pro Teilnehmer:

1. Komponente liegt als Component-Set im Atelier-Figma-File (auf einer Schulungs-Page)
2. `npm run preflight` weiter grün
3. `nx serve <workshop-fw>` zeigt Komponente in einer kleinen Demo-Page
4. Test-Loop grün: React → `run-story-tests` MCP-Call passes; Angular/Vue → `nx test <lib>` passes + Story manuell im laufenden Storybook im Browser sichtbar
5. `figma_audit_component_accessibility` ohne kritische Findings **und** Storybook A11y-Tab im Browser zeigt keine kritischen axe-core-Findings
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

---

## Slide-Outline (Vortragsblöcke)

Bullets als Roh-Material für Deck. Jede Folie ~1–3 Bullets, jeder Block ~6–10 Folien.

### Tag 1 Block 0 — Kickoff (09:00–09:30, 30m)

**Folie 1 — Titel**
- „Atelier — Component-Driven UI mit Claude"
- 2 Tage · Figma · Storybook · MCP · Claude Code
- Trainer, Datum, eigenes Framework wählen

**Folie 2 — Warum component-driven?**
- Eine API, drei Frameworks (A/R/V) — gleicher Spec-Contract (`libs/spec`)
- Designer + Entwickler reden über dieselbe Anatomie (Variants, Slots, Tokens)
- Quelle: `plan/big-picture.md`

**Folie 3 — Warum AI?**
- LLMs scheitern an erfundenen Props, halluzinierten Tokens, Drift
- Lösung: Live-Anbindung an Storybook + Figma per MCP statt Trainings-Cutoff
- Statt „beschreibe API" → „lies API via MCP"

**Folie 4 — Die vier Pillars**
- Figma = Designquelle (Variables, Variants, Modes)
- Storybook = API-Wahrheit (Props, Stories, A11y)
- MCP = Live-Brücke (Werkzeuge für Claude)
- Claude Code = Ausführer (prompt → diff → run)

**Folie 5 — Live-Demo (5 min)**
- Atelier-Button in React: neuer Tone „warning" per Prompt
- Diff anzeigen → cross-framework parallel in Angular/Vue
- Zeigt: Token-Treue, Spec-Parität, keine Halluzination

**Folie 6 — Was lernt ihr in 2 Tagen**
- Tag 1: Werkzeuge + ein End-to-End-Roundtrip mit existierender Komponente
- Tag 2: eigene Komponente Figma → Storybook → Code im Wunsch-Framework
- Kein Framework-Tutorial — Fokus = Workflow

**Folie 7 — Was lernt ihr NICHT**
- Kein React/Angular/Vue von Null
- Keine Storybook-Konfiguration aus dem Nichts
- Keine produktive CI/CD-Pipeline (eigenes Repo später)

**Folie 8 — Format & Spielregeln**
- ~7–8h netto pro Tag · 60min Mittag · 2× 15min Kaffeepausen
- Pair / hands-on / wenig Vortrag
- Fragen jederzeit · „verloren?" → laut sagen

**Folie 9 — Pre-Workshop-Check**
- `node --version` (20 oder 22 LTS) · `npm run preflight` grün
- Claude Code CLI eingeloggt · Figma-Token gesetzt
- Wer rot ist: bleibt nach Folie 9 für Troubleshooting

### Tag 2 Block 0 — Recap & Brief (09:00–09:30, 30m)

**Folie 1 — Tag-1-Recap in 60 Sekunden**
- Setup grün, MCP-Server live, ein erfolgreicher Roundtrip pro Person
- Drei MCP-Toolsets (`docs` / `dev` / `test`) sind klar
- Mindset: Prompt > Tippen

**Folie 2 — Was war überraschend? (Kurz-Diskussion)**
- Sammeln in 2 Min an Whiteboard
- Aufgreifen: 1–2 typische Antworten → Aha-Moment markieren

**Folie 3 — Tagesziel Tag 2**
- Eine **selbst gestaltete** Komponente
- Figma-Spec + Story + Code im gewählten Framework
- A11y + Dark Mode bestanden

**Folie 4 — Komponenten-Brief (Auswahl)**
- Optionen: Toast · StatCard · TagChip · Avatar
- Klein genug für 1 Tag, groß genug für ≥2 Variants + States
- Auswahl jetzt — danach kein Wechsel

**Folie 5 — Anatomie-Schema (Brief-PDF zeigen)**
- Spacing, Radius, Variants-Matrix, Keyboard-Verhalten
- A11y-Pflichten: Kontrast, ARIA, Fokus
- Dark-Mode-Anforderung

**Folie 6 — Workflow für heute**
- 09:30 Figma-Design (manuell + MCP-Strukturierung)
- 11:15 Spec & Story per Prompt
- 13:30 Codegen + Test-Loop
- 15:15 A11y + Dark Mode + States
- 16:40 Show & Tell

**Folie 7 — Gefahren-Hinweise**
- Original-Atelier-Figma-File NICHT editieren — duplizieren in eigene Drafts
- Tokens IMMER über `--ui-*` Custom Properties, NIE Inline-Hex
- Bei kaputt-gepromptet: `git checkout solved-<name>` als Rettung

**Folie 8 — `uianatomy` MCP als Co-Pilot**
- Anatomie-Vorlagen, Axes, Slots, Mismatches zwischen Libraries
- Trigger: Skill `uianatomy-mcp` auto-aktiv
- Beispielprompt zeigen: „Get anatomy for Toast"

### Tag 2 Block 5 — Show & Tell + Best Practices (16:40–17:30, 50m)

**Folie 1 — Format**
- 3–5 min pro Person · Komponente in Figma + Storybook + Code zeigen
- Eine Sache die geklappt hat, eine die nervig war
- Keine Diskussion während Präsentation — Feedback danach

**Folie 2 — Was wir gleich synthetisieren**
- Prompt-Patterns die geklappt haben
- Anti-Patterns die euch Zeit gekostet haben
- Wann Claude scheitert — und woran erkennt man's früh

**Folie 3 — Prompt-Patterns die geklappt haben** (Trainer-Synthese, live ergänzen)
- Zuerst Spec lesen lassen, dann Code generieren
- Token-Liste explizit im Prompt referenzieren
- „Schreibe Story zuerst, Implementierung danach"
- Failure-Message als nächsten Prompt zurückspielen

**Folie 4 — Anti-Patterns** (live ergänzen)
- „Mach mal einen Toast" ohne Spec → halluzinierte Props
- Inline `style={{ color: '#ff…' }}` statt `var(--ui-color-…)`
- Auto-Layout per `figma_execute` statt im UI
- Lokalen MCP gestartet, aber Hosted-Endpoint im `.mcp.json` referenziert

**Folie 5 — Drift erkennen & korrigieren**
- Spec-Drift: `libs/spec` vs. Implementierung
- Token-Drift: Hard-coded Werte schleichen sich rein
- Tool: `npm run preflight` + Storybook A11y-Tab
- Component-Trinity Subagent prüft cross-framework

**Folie 6 — Wann Claude scheitert**
- Sehr abstrakte Briefs ohne Anatomie
- Komponente ohne Referenz im Repo (neue Architektur)
- Mehrere Quellen widersprechen sich (Figma ≠ Spec ≠ Doc)
- Symptom: viele kleine „fix dieses Detail"-Prompts → STOP & re-plan

**Folie 7 — Produktiver Einsatz im eigenen Repo**
- Eigene CLAUDE.md schreiben (Workflow, MCP-Liste, Konventionen)
- Eigene Skills für wiederkehrende Aufgaben (`.claude/skills/`)
- Hosted MCP für Design-System aufsetzen (`createStorybookMcpHandler`)
- Pre-Push-Hooks für llms.txt + Trinity-Sync

**Folie 8 — Weiterlesen**
- `plan/big-picture.md` · `plan/design-principles.md`
- `docs/src/pages/{mcp,storybook,claude-md,prompts}.astro`
- Storybook 10.4 Release Notes
- MCP-Spec: modelcontextprotocol.io

**Folie 9 — Danke / Q&A**
- 10 min freie Fragen
- Trainer-Kontakt für Follow-up
- Feedback-Form-Link
