# Atelier vs. AI & Design Systems – Lückenanalyse

Stand: 2026-10-08 · Dominik Pieper · Übertragen aus einem Claude-Docs-Dokument
(Revision 9, am 2026-10-08 gelöscht)

Status-Werte: **Offen** · **Übernehmen** · **Erledigt** · **Gestrichen**. Zum Abhaken oder Streichen
den Wert in der Spalte Status ändern.

Von rund 60 Themen der Schulung, die Atelier nicht oder nur teilweise abdeckt, passen 11 direkt in den Design-to-Code-Kern (A), 13 als Vertiefung (B) und 12 als Exkurs (C). Der Rest ist Produkt-, Organisations- oder Zukunftsthema und gehört nicht in Atelier.

## Maßstab

Die Leitfrage war: Braucht eine Teilnehmerin das für ihr eigenes Design System, wenn sie eine Figma-Komponente per KI in verifizierten Code überführt? Je näher ein Thema am Loop Figma → Contract → Code → Verify liegt, desto höher die Priorität.

- **A**: verbessert direkt den Kern-Loop oder seine Verifikation; gehört in Lehrseiten, Kata oder Schulungsagenda.
- **B**: hilft beim eigenen DS rund um den Loop (Tokens, a11y, Versionierung, MCP); eigener Abschnitt oder Exkurs.
- **C**: fremdes Tool oder Randthema; reicht als Hinweis, Vergleich oder Link.
- **Außerhalb**: Produkt-Adoption, Organisation, Zukunftsvisionen; anderes Format.

Aufwand: **S** = Absatz oder Glossareintrag, **M** = neuer Abschnitt oder Übung, **L** = neue Seite, Skill oder Gate. Nummern in der Spalte Transkripte sind die Präfixe der Dateien in `~/Downloads/ai-design-systems-transcripts`.

## Reihenfolge

Die 36 offenen Punkte in Arbeitsreihenfolge, in vier Wellen. Sortiert nach Nutzen für
Teilnehmende, dann Aufwand, dann Abhängigkeiten. Die Stufe (A/B/C) sagt, wie wichtig ein
Punkt ist; der Rang sagt, wann er dran ist. Deshalb steht A4 (L) hinter mehreren B-Punkten.

**Welle 1 – schnelle Gewinne (alle S, keine Abhängigkeiten).** Schließt Fehlerbilder, auf die
Teilnehmende schon in der Kata treffen.

| Rang | #   | Thema                                 | Aufwand | Warum hier                                                                                  |
| ---- | --- | ------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| 1    | A6  | Prompt-Guard Canvas → Code            | S       | Verhindert erfundene Varianten direkt im ersten Durchlauf der Kata.                         |
| 2    | A5  | Guardrail-Demo mit/ohne DS            | S       | Stärkster Aha-Moment für die Schulung, passt neben die Halluzinations-Demo in Block 4.      |
| 3    | A7  | Dead Prop                             | S       | Benennt, was `check:props` schon fängt; macht ein bestehendes Gate verständlich.            |
| 4    | B11 | Session-Hygiene und Permission-Modi   | S       | Sicherheit für Teilnehmende; Gegengewicht zu `--dangerously-skip-permissions` aus dem Kurs. |
| 5    | B12 | Glossar: LLM, Agent, Subagent         | S       | Begriffe werden auf fast jeder Seite benutzt, aber nirgends erklärt.                        |
| 6    | A11 | Console MCP vs. offizielles Figma MCP | S       | Die häufigste Frage von Teilnehmenden mit Figma-Erfahrung.                                  |
| 7    | B13 | "Kein DS mit KI von Null generieren"  | S       | Ein Satz in `design-principles`; verhindert einen falschen Einstieg.                        |

**Welle 2 – Verify-Strang ausbauen (Kern-Loop, meist M).** Prüfen ist im Loop Pflicht, aber
am dünnsten gelehrt.

| Rang | #   | Thema                                      | Aufwand | Warum hier                                                                        |
| ---- | --- | ------------------------------------------ | ------- | --------------------------------------------------------------------------------- |
| 8    | A1  | Ist dein DS bereit? (Selbstcheck)          | M       | Einstieg Tag 1; Teilnehmende bringen ihr eigenes DS mit.                          |
| 9    | A3  | Parity-Bericht lesen und weiterverarbeiten | M       | Jede Kata endet im Parity-Check; heute fehlt, was man mit dem Ergebnis tut.       |
| 10   | A10 | Readiness-Score vor dem Handoff            | M       | Sauberer Design-Input senkt alle späteren Fehler.                                 |
| 11   | A8  | Self-Healing-Schleife                      | M       | Verbindet Screenshot, axe und Tastatur zu einer lehrbaren Schleife.               |
| 12   | A9  | Feste Gate-Reihenfolge                     | S       | Erst nach A10 und A8 sinnvoll, weil es deren Reihenfolge beschreibt.              |
| 13   | A2  | Code-only Props Layer                      | M       | Braucht eine saubere Abgrenzung zu `codeOnly` (ADR-0145), daher nicht in Welle 1. |

**Welle 3 – Tiefe für das eigene DS (B-Punkte, plus A4).**

| Rang | #   | Thema                                             | Aufwand | Warum hier                                                                    |
| ---- | --- | ------------------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| 14   | B8  | a11y-Urteilsfragen                                | M       | Atelier positioniert sich über a11y; die Entscheidungen fehlen.               |
| 15   | B9  | Struktur- vs. Verhaltens-Tests, Visual Regression | M       | Ergänzt "every story is a test" um die Frage, was ein guter Test ist.         |
| 16   | B3  | Live-Beweis: Agent baut mit dem DS                | S       | Billiger Test, ob `llms.txt` und Skills tragen.                               |
| 17   | B10 | Kontextbasierter Lebenszyklus, Context Engineer   | S       | Gibt dem Handoff-Dokument einen Namen und einen Platz.                        |
| 18   | B6  | Theme-Exploration und Pink Test Mode              | S       | Kleine, anschauliche Token-Übung.                                             |
| 19   | B7  | Token-Pipeline praktisch                          | M       | Nach B6, nutzt dieselben Tools tiefer.                                        |
| 20   | A4  | Evals für Komponenten                             | L       | Hoher Nutzen, aber groß und erst nach A8/A9 klar einzuordnen; vermutlich ADR. |
| 21   | B4  | Deprecation-Fenster und Codemods                  | M       | Wichtig für gepflegte DS, nicht für den ersten Durchlauf.                     |
| 22   | B5  | Benennung vereinheitlichen                        | M       | Wie B4: Pflege, nicht Einstieg.                                               |
| 23   | B2  | Eigenes DS-MCP veröffentlichen                    | M       | Für Fortgeschrittene; Atelier hat die Vorlage in `worker/mcp.ts`.             |
| 24   | B1  | DS aus laufender App extrahieren                  | L       | Eigener Pfad für Teams ohne Figma-DS; größter Aufwand in B.                   |

**Welle 4 – Exkurse (C-Punkte), S zuerst.**

| Rang | #   | Thema                                      | Aufwand | Warum hier                                                    |
| ---- | --- | ------------------------------------------ | ------- | ------------------------------------------------------------- |
| 25   | C3  | Claude Design aus der Praxis               | S       | Ergänzt eine bestehende Seite um Zahlen.                      |
| 26   | C2  | Company Docs MCP                           | S       | Ein Absatz Abgrenzung zum eigenen Weg.                        |
| 27   | C12 | Lückenanalyse gegen andere DS              | S       | uianatomy ist schon angebunden.                               |
| 28   | C9  | Layer-Benennung für KI begründen           | S       | Kurze Begründung zu bestehenden Konventionen.                 |
| 29   | C1  | Story UI                                   | S       | Ein Hinweis auf der Storybook-Seite.                          |
| 30   | C8  | Wartungsrezepte für große Bibliotheken     | S       | Gehört in den Skill, nicht auf eine Lehrseite.                |
| 31   | C6  | Agenten über Templates und Recipes steuern | M       | Baut auf `patterns` auf.                                      |
| 32   | C7  | Seiten aus DS-Komponenten in Figma bauen   | M       | Nach C6, gleiche Idee in Figma.                               |
| 33   | C11 | Projekt-SPEC und Phasen-Regelwerk          | M       | Überschneidet sich mit `AGENTS.md`; erst klären, was neu ist. |
| 34   | C4  | Prototyping-Tools im Vergleich             | M       | Veraltet schnell.                                             |
| 35   | C5  | Regelwerk für Kompositionen                | L       | Großer Bau, geringer Bezug zum Komponenten-Loop.              |
| 36   | C10 | Theme Orchestrator                         | L       | Native-Teil passt nicht zu Atelier.                           |

## Welle 2 – Plan (Entwurf, 2026-10-08)

Recherche liegt bei: `wave2-notebooklm-a10-readiness.md`, `wave2-notebooklm-a8-self-healing.md`
(NotebookLM-Synthesen, unverifiziert) plus die Transkripte aus den Tabellen unten.

**Entscheidungen (Owner, 2026-10-08):** 1 ja, 2 ja. 3 zuerst „in den Master“, nach dem Spike
(`wave2-a2-code-only-props-spike.md`) zurückgenommen: kein versteckter Layer, stattdessen eine
`- Code-only`-Zeile in der Master-Beschreibung, von `check:contracts` in beide Richtungen geprüft
(ADR-0161). Alle sechs Punkte erledigt.

**Ursprünglich offene Entscheidungen:**

1. **A1 – Ort.** Vorschlag: Abschnitt „Before you start: is your design system ready?“ am Anfang
   von `design-to-code`; die Schulungsagenda verweist nur darauf, keine neue Blockzeit.
2. **A3 – Ort.** Vorschlag: Abschnitt in `design-to-code` Schritt 4 plus ein Übungsschritt in
   `first-component`.
3. **A2 – Umfang.** Nur erklären (Doku, Abgrenzung zu `codeOnly`, Atelier nutzt den Layer nicht)
   oder in den eigenen Figma-Mastern einführen? Einführen heißt ADR, Figma-Arbeit und Aufwand L
   statt M.

**Fertig, wenn …**

| #   | Fertig, wenn                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A1  | Checkliste mit den fünf Qualitäten, je 2–3 prüfbare Fragen; jede Frage nennt, womit Atelier sie prüft (Gate oder Tool). Teilnehmende können ihr eigenes DS in ~10 min einschätzen. Kein Score-Versprechen.                                                                                             |
| A3  | Die Felder des `figma_check_design_parity`-Ergebnisses sind an einem echten Lauf gegen eine Atelier-Komponente erklärt (Ausgabe erzeugt, nicht erfunden). Drei Folgeschritte: Code fixen, Figma fixen, als gewollte Abweichung in den Contract. Rückwärts-Parität mit `figma_post_comment` als Option. |
| A10 | Readiness-Checkliste vor dem Handoff (Token-Bindung, `codeSyntax.WEB`, Variable-Scopes, Layer-Namen, Beschreibung, TEXT-Properties); jeder Punkt nennt das figma-console-mcp-Tool, das ihn prüft. Einmal gegen die Atelier-Figma-Datei gelaufen, Ergebnis notiert.                                     |
| A8  | Atelier-Variante der Schleife: `storybook-test` / `test-run` + `figma_check_design_parity` + `figma_scan_code_accessibility`. Stoppbedingung (z. B. 3 Runden, dann Mensch). Die vier Fehlerbilder, mit der Regel „Assertions und Schwellen nicht ohne Rückfrage ändern“.                               |
| A9  | Erst nach A10 und A8: Reihenfolge Readiness → Codegen → Gates → Parity, mit Begründung, an einer Stelle in `design-to-code`.                                                                                                                                                                           |
| A2  | Je nach Entscheidung 3: Die Seite sagt klar, was der Layer ist, was `codeOnly` ist und was Atelier davon nutzt.                                                                                                                                                                                        |

**A4 – Entscheidungen (Owner, 2026-10-09):** Lehren mit Rubrik-Prompt statt eigenem Eval-Skill;
kein Score 0–100, der Judge liefert Befunde mit Beleg und blockiert nie; Ticket-Review (Steel
Curtain) als Variante mit Handoff-Dokument plus Diff. Umgesetzt in `design-to-code` Schritt 4
(„Evals: where the judge comes in“), Glossar `eval`, ADR-0164.

## Priorität A – passt direkt, hoher Hebel

Elf Themen schärfen den Kern-Loop. Vier davon sind mit Aufwand S erledigt (A5, A6, A7, A11).

| #   | Status   | Thema                                                  | Was der Kurs zeigt                                                                                                                                      | Stand Atelier                                                                       | Wohin                                                  | Aufwand | Transkripte        |
| --- | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------ | ------- | ------------------ |
| A1  | Erledigt | Ist dein DS bereit? (Check Engine Light, 5 Qualitäten) | Ein DS, das gesund wirkt, versteckt Probleme in drei Schweregraden; bewertet nach Complete, Sound, Synchronized, Extensible, AI-ready.                  | Nur AI-ready, als Spec in `plan/ai-readiness.md`, nicht als Lehrinhalt.             | Einstieg Schulung Tag 1, Selbstcheck für das eigene DS | M       | 038, 057, 271      |
| A2  | Erledigt | Code-only Props Layer (Nathan Curtis)                  | Versteckte Ebene in der Figma-Komponente trägt aria-label, alt, Verhaltensabsicht für Agenten.                                                          | Fehlt. `codeOnly` im Contract ist etwas anderes (ADR-0145) – Abgrenzung nötig.      | `design-to-code`, `figma`                              | M       | 102, 115           |
| A3  | Erledigt | Parity-Bericht lesen und weiterverarbeiten             | Score, Schweregrade, "Paradigmen-Unterschiede" deuten; Bericht als Issue mit Checkliste; Rückwärts-Parität mit Code als Wahrheit und Figma-Kommentaren. | Aufruf ist gezeigt, Deutung und Folgeschritte fehlen.                               | `design-to-code`, `first-component`                    | M       | 109, 116, 138, 153 |
| A4  | Erledigt | Evals für Komponenten                                  | Deterministische Skripte plus LLM-as-Judge, Score 0–100; Taxonomie deterministisch vs. agentisch.                                                       | Gates decken die deterministische Hälfte; Evals gibt es nur für Skills.             | Verify-Schritt, eigener Abschnitt                      | L       | 219, 223, 228      |
| A5  | Erledigt | Guardrail-Demo mit/ohne DS                             | Derselbe Prompt einmal frei, einmal mit DS-Grundlage; Unterschied wird sichtbar.                                                                        | Fehlt; nur Halluzinations-Negativdemo in Block 4.                                   | Schulungsagenda, `prompts`                             | S       | 178                |
| A6  | Erledigt | Prompt-Guard Canvas → Code                             | "Nur tun, was im Input steht"; Modelle erfinden sonst Varianten.                                                                                        | Fehlt als Regel und Warnung.                                                        | `prompts`, Handoff-Vorlage                             | S       | 105, 115           |
| A7  | Erledigt | Dead Prop                                              | Dokumentierte API, die still nichts tut, zerstört Vertrauen; Fix über Token-Fallback-Kette.                                                             | `check:props` existiert, das Fehlerbild ist nicht benannt.                          | `design-to-code`, `tokens`                             | S       | 076, 185           |
| A8  | Erledigt | Self-Healing-Schleife mit Screenshot und Playwright    | Agent rendert, prüft per Screenshot, axe und Tastatur, wiederholt bis es passt.                                                                         | Steht in Server-Instruktionen und Skill, nicht auf einer Lehrseite.                 | `a11y-workflow`, Verify                                | M       | 081, 227           |
| A9  | Erledigt | Feste Gate-Reihenfolge                                 | FigmaLint → Codegen → Eval → Playwright; Design-Input zuerst sauber.                                                                                    | Gates existieren, Reihenfolge und Begründung nicht gelehrt.                         | `design-to-code`                                       | S       | 227                |
| A10 | Erledigt | Readiness-Score vor dem Handoff (FigmaLint-Prinzip)    | Komponente in Figma erst bis Score ~90+ bringen, dann an den Agenten geben.                                                                             | `figma_lint_design` vorhanden; FigmaLint nur in `plan/research`, kein Gate-Gedanke. | `figma`, Kata Schritt 1                                | M       | 019, 141–156       |
| A11 | Erledigt | Console MCP vs. offizielles Figma MCP                  | JSON-Spec ohne URL vs. React+Tailwind mit URL; Kopf-an-Kopf-Vergleich.                                                                                  | Nur in `plan/research`.                                                             | `mcp`                                                  | S       | 034, 053, 122      |

## Priorität B – passt, mittlerer Hebel

Dreizehn Themen helfen beim eigenen DS rund um den Loop. Die meisten sind Vertiefungen bestehender Seiten.

| #   | Status   | Thema                                                    | Was der Kurs zeigt                                                                                                                                                                       | Stand Atelier                                                                        | Wohin                                 | Aufwand | Transkripte             |
| --- | -------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------- | ------- | ----------------------- |
| B1  | Offen    | DS aus laufender App extrahieren                         | `figma_ds_analyze` → `extract_tokens` → `scaffold` → `setup_storybook` → `figma_ds_verify`, für Teams ohne Figma-DS.                                                                     | Tools nur in Skill-`tool-map.md`.                                                    | Exkurs-Seite oder Kata-Variante       | L       | 214                     |
| B2  | Erledigt | Eigenes DS-MCP veröffentlichen                           | Remote-Server (streamable HTTP), gebündelter Wissensgraph, aus Codex, Cursor, Claude anbinden.                                                                                           | `worker/mcp.ts` hostet Storybook-Docs, kein How-to fürs eigene DS.                   | `mcp`                                 | M       | 268, 269                |
| B3  | Erledigt | Live-Beweis: Agent baut mit dem DS                       | "Doku existiert" heißt nicht "maschinell nutzbar"; Agent baut testweise eine Seite, man schaut, wo er stolpert.                                                                          | `llms.txt`, `agent-skills` vorhanden, kein Test-Ritual.                              | `llms`, `agent-skills`                | S       | 258, 263, 264           |
| B4  | Erledigt | Deprecation-Fenster und Codemods                         | Alter Prop bleibt als Fallback, als deprecated markiert, nach N Monaten entfernt, im MCP sichtbar.                                                                                       | Nur Figma-seitig "erst additiv, dann entfernen".                                     | Neuer Abschnitt Versionierung         | M       | 209, 213                |
| B5  | Erledigt | Benennung vereinheitlichen                               | Konsistenzbericht, dann einmalige Normalisierung (`size=large` vs `lg`, Tokens, Layer).                                                                                                  | Drift-Gates prüfen Gleichheit, nicht Konsistenz der Begriffe.                        | `figma-workspace-architect`, `tokens` | M       | 205, 209, 213           |
| B6  | Erledigt | Theme-Exploration und Pink Test Mode                     | `figma_add_mode` für Explorations-Themes; Wegwerf-Mode zeigt, welche Komponenten neue Variables nutzen.                                                                                  | `figma_add_mode` nur im Migration-Playbook.                                          | `tokens`                              | S       | 009, 128, 153           |
| B7  | Erledigt | Token-Pipeline praktisch                                 | DTCG/Style Dictionary, `export_tokens`/`import_tokens` für Code-first-Rundlauf; Knockout-Farben.                                                                                         | Ebenen erklärt, Pipeline nur in Research.                                            | `tokens`                              | M       | 063, 079, 167, 173      |
| B8  | Erledigt | a11y-Urteilsfragen                                       | Modal: Fokus auf den Dialog, Rückgabe an Trigger, `inert`; DS-a11y ≠ Produkt-a11y; manueller VoiceOver-Check.                                                                            | Audit vorhanden, Entscheidungen nicht gelehrt.                                       | `accessibility`, `a11y-workflow`      | M       | 197, 201                |
| B9  | Erledigt | Struktur- vs. Verhaltens-Tests, Visual Regression        | Tooltip von 0 auf 24 Verhaltenstests; "grüne Haken sind kein Beweis".                                                                                                                    | "Every story is a test" deckt viel; Unterscheidung und VR fehlen.                    | `storybook`, Verify                   | M       | 230, 233                |
| B10 | Erledigt | Kontextbasierter DS-Lebenszyklus, Rolle Context Engineer | Design-QA → Protokoll → Review auf Design-Branch → Tests → Publish; jede Stufe erbt Kontext.                                                                                             | Handoff-Dokument ist die Idee, aber nicht benannt; 0 Treffer für "Context Engineer". | `design-principles`, Schulung         | S       | 238, 064, 009           |
| B11 | Erledigt | Session-Hygiene und Permission-Modi                      | `/doctor`, Kontext-Overhead von CLAUDE.md und MCPs; Abschlussfrage "Worin bist du am wenigsten sicher?"; Regeln gegen Sykophanz; Permission-Modi statt `--dangerously-skip-permissions`. | Fehlt für Teilnehmende.                                                              | `claude-md`, `prompts`                | S       | 070, 094, 108, 124, 180 |
| B12 | Erledigt | LLM-, Agent-, Subagent-Grundbegriffe                     | Was LLMs nicht sind; Stack: LLM = Gehirn, Agent = Hände, MCP = USB, Skill = Know-how.                                                                                                    | Glossar (`docs/src/data/glossary.ts`) ohne LLM, Agent, Subagent.                     | Glossar                               | S       | 089, 187, 191, 207–229  |
| B13 | Erledigt | "Kein DS mit KI von Null generieren"                     | Lookalike-Problem; KI nur, um Organisationskontext zu sammeln.                                                                                                                           | Fehlt als Prinzip.                                                                   | `design-principles`                   | S       | 013                     |

## Priorität C – passt, optional oder Exkurs

Zwölf Themen reichen als Hinweis, Vergleich oder Link; die meisten betreffen fremde Tools.

| #   | Status | Thema                                      | Was der Kurs zeigt                                                                               | Stand Atelier                                                       | Wohin                       | Aufwand | Transkripte            |
| --- | ------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------- | ------- | ---------------------- |
| C1  | Offen  | Story UI (Southleft)                       | Prompt → Story in Storybook, Compositions, Voice Canvas, Self-Healing.                           | 0 Treffer.                                                          | `storybook`, Hinweis        | S       | 032, 051, 061, 186–194 |
| C2  | Offen  | Company Docs MCP                           | Doku aus Figma → Mintlify für Menschen, Vektor-DB für Maschinen.                                 | Eigener Weg (Storybook-Manifest-MCP) wird nicht dagegen abgegrenzt. | `mcp`, ein Absatz           | S       | 042, 148, 260–267      |
| C3  | Offen  | Claude Design aus der Praxis               | "Branded Fork" statt eigener Komponenten, ~45 min, ~82 $; Gap-Analyse per Claude Code.           | Governance-Rahmen vorhanden, Erfahrungswerte fehlen.                | `claude-design`             | S       | 070, 079, 157          |
| C4  | Offen  | Prototyping-Tools im Vergleich             | Make, Bolt, v0, Lovable, Claude Design auf einem DS, A bis D-.                                   | Nur Claude Design.                                                  | Exkurs Schulung             | M       | 137–166                |
| C5  | Offen  | Regelwerk für Kompositionen                | YAML-Regeln für Journeys ("letzter Checkout-Schritt = Erfolg"), Skill lädt nur relevante Regeln. | Nur `antiPatterns` pro Komponente.                                  | `patterns`                  | L       | 094                    |
| C6  | Offen  | Agenten über Templates und Recipes steuern | Page-Templates, Recipes, Starter-Stacks als Leitplanken.                                         | `patterns` existiert, nicht auf Agenten ausgerichtet.               | `patterns`                  | M       | 049, 070, 182          |
| C7  | Offen  | Seiten aus DS-Komponenten in Figma bauen   | Agent komponiert eine Seite nur aus DS-Instanzen.                                                | Nur Komponentenebene.                                               | `figma`                     | M       | 106, 113, 128          |
| C8  | Offen  | Wartungsrezepte für große Bibliotheken     | Detached Instances, Styles → Variables, Massen-Edits.                                            | Teilweise im Skill.                                                 | `figma-workspace-architect` | S       | 095                    |
| C9  | Offen  | Layer-Benennung für KI begründen           | Buttons eindeutig benennen, Junk-Frames entfernen, px vs rem.                                    | Konventionen vorhanden, KI-Begründung fehlt.                        | `figma`                     | S       | 009, 106               |
| C10 | Offen  | Theme Orchestrator                         | Dark Mode oder Rebrand über Figma, Storybook, Native per Skill + Skripten + WCAG-Audit.          | Light/Dark-Tokens vorhanden.                                        | `tokens`                    | L       | 255, 257               |
| C11 | Offen  | Projekt-SPEC und Phasen-Regelwerk          | SPEC mit Zielen, Nicht-Zielen, Erfolgskriterien, Gate draft → approved; Voll- und Quick-Modus.   | Contracts pro Komponente, `AGENTS.md`.                              | `claude-md`                 | M       | 048, 058, 182          |
| C12 | Offen  | Lückenanalyse gegen andere DS              | Eigenes DS mit Material, Carbon, Polaris vergleichen, Lücken als Backlog.                        | `uianatomy`-MCP könnte das, nicht so gelehrt.                       | `mcp`, uianatomy-Abschnitt  | S       | 119                    |

## Außerhalb des Scopes

Neun Themenblöcke gehören nicht in Atelier, weil sie Produkt-Teams, Organisation oder Zukunftsvisionen betreffen. Sie stehen vorbelegt auf Gestrichen; wer einen Block zurückholen will, setzt ihn auf Offen.

| #   | Status     | Themenblock                                 | Inhalte                                                                                                                                                   | Warum nicht Atelier                                                                                      | Transkripte                       |
| --- | ---------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------- |
| X1  | Gestrichen | DS- und Produkt-Inspektion als Vollprogramm | 10 Stationen /100, `garage.md`, Arbeitsauftrag, Issues doppelt in Produkt- und DS-Repo                                                                    | Atelier lehrt den Loop für eine Komponente; der Selbstcheck A1 nimmt den Kern mit.                       | 067, 076, 077, 270                |
| X2  | Gestrichen | Legacy-Adoption                             | Vier Arten von Produktarbeit, Adoptionsplan in Wellen, Shell → Header/Footer → Templates                                                                  | Braucht ein Konsumenten-Produkt, das Atelier nicht hat.                                                  | 014, 245–253                      |
| X3  | Gestrichen | Adoption messen und Feedback-Schleifen      | Reporter-Beacons, Komponenten ohne Nutzung, Steel Curtain auf Produktseite, `learning.json`                                                               | Setzt Konsumenten und Telemetrie voraus.                                                                 | 101, 115, 252–256, 270            |
| X4  | Gestrichen | Repo-Governance                             | Branch Protection, Issue-Templates, CONTRIBUTING, Governance-Diagramm in FigJam                                                                           | Generisches Engineering, kein Design-to-Code-Thema.                                                      | 244–250                           |
| X5  | Gestrichen | KI + DS in der Organisation                 | Verkaufen, Pilot, Rollout, Budget, Sandbox-Experimente                                                                                                    | Change-Management, eigenes Format.                                                                       | 016, 029, 040, 050, 060           |
| X6  | Gestrichen | Zukunft der UI                              | Generative UI, A2UI, Hyper-Personalisierung, Echtzeit-/Sprach-UI, multimodale Ketten                                                                      | Visionen ohne Verifikations-Loop.                                                                        | 008, 028, 049, 069, 100, 107      |
| X7  | Gestrichen | Grundlagen und Haltung                      | KI-Prinzipien, Ethik, Geschichte, DS-Definition und ROI                                                                                                   | Höchstens eine Einstiegsfolie.                                                                           | 011, 036, 045, 064, 065, 074      |
| X8  | Gestrichen | Git und Tooling für Einsteiger              | Git, GitHub, gh CLI, IDE-Landschaft, API-Keys allgemein, Diktat                                                                                           | Atelier setzt Entwicklungsgrundlagen voraus; nur relevant, falls Designer ohne Git-Erfahrung teilnehmen. | 012–212 (Kap. 2)                  |
| X9  | Gestrichen | Einzeltools ohne Bezug                      | Design Systems Assistant, ChatGPT-Connector, Jev/TypeSafe, Fractal/Twig, Declarative Shadow DOM, Plugin-Console-Loop, Component Adapter, Motion-Variables | Fremde Stacks oder Plugin-Entwicklung.                                                                   | 021, 033, 053, 072, 079, 115, 243 |

## Grenzen und Quellen

"Fehlt" heißt: kein Treffer bei Suche mit deutschen und englischen Synonymen in `docs/src`, `AGENTS.md`, `plan/`, `workshop/`, `schulung-2tage-agenda.md` und den Skills. Ein anders benanntes Thema kann trotzdem durchgerutscht sein.

- Verifiziert per Stichprobe: 0 Treffer für Story UI, FigmaLint, Context Engineer, Style Dictionary, Check Engine, Branch Protection, Code-only Props, LLM-as-Judge, Product Work, Generative UI/A2UI.
- Viele Punkte stehen in Skill-Referenzen, nur nicht auf Lehrseiten. Für die Schulung zählt das als Lücke, für die Fähigkeiten des Repos nicht.
- Die Priorisierung ist eine Einschätzung nach dem Maßstab oben, keine Messung.
- Nicht abgeglichen: der separate Kurs `atomic-design-transcripts`.

Quelle: 271 Transkripte des Kurses "AI & Design Systems" (Kapitel 0–7 plus Bonus- und Jam-Sessions). Vollständige Tabellen mit Belegpfaden: die übrigen Dateien in diesem Ordner (`README.md`).
