# A4 – Probelauf des Judge-Prompts an AtlButton (2026-10-09)

Prompt: `JUDGE_PROMPT` aus `docs/src/pages/design-to-code.astro`, wörtlich, Platzhalter gefüllt
(AtlButton, Angular, Node `129:20`). Die Figma-Zeile zeigte auf eine gespeicherte Ausgabe von
`figma_get_component_for_development`, weil Codex kein Figma-MCP hat. Beide Judges bekamen
denselben Text und keine Einschätzung des Orchestrators.

- **Judge A:** Codex (`gpt-5.5`, read-only). Das in `~/.codex/config.toml` gesetzte Modell
  `gpt-5.6-sol` wurde mit dem ChatGPT-Account abgelehnt; nur im Aufruf überschrieben.
- **Judge B:** frischer Claude-Subagent (Sonnet), read-only.

Jeder Befund wurde danach von Hand gegen Code, CSS-Kaskade und Master-JSON geprüft. Nicht im
Browser geprüft.

## Befunde

| #   | Rubrik | Befund                                                                                                                                                            | A   | B   | Geprüft                                                                                                                                                         |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 1      | Danger-Button hat keinen Fokusring: `.atl-button.variant-danger` (0,2,0) steht nach `.atl-button:focus-visible` (0,2,0) und überschreibt `box-shadow`.            | –   | x   | **Echt.** `libs/styles/src/button/atl-button.css:34-37` vs. `:91-96`, keine weitere Fokusregel, kein `@layer`. Master `468:2598` zeichnet den Ring. WCAG 2.4.7. |
| 2   | 1      | Keine Stories für hover, focus, active, obwohl der Master sie zeigt.                                                                                              | x   | x   | **Echt.** `atl-button.stories.ts:50-125`.                                                                                                                       |
| 3   | 1      | Primary active: Master hat Inner Shadow 18 % (`437:1516`), Code nicht.                                                                                            | –   | x   | **Echt** (Abweichung Master/Code; welche Seite recht hat, offen).                                                                                               |
| 4   | 1      | Outline disabled: Master-Overlay hellgrau gefüllt, Code `transparent` (`css:164-166`).                                                                            | –   | x   | **Plausibel.** Overlay `1169:834` ist gefüllt, andere Overlays nutzen eine andere Variable; Absicht unklar.                                                     |
| 5   | 3      | `hasIcon` ist im Master an keine Ebene gebunden.                                                                                                                  | –   | x   | Stimmt, steht aber schon in der Master-Beschreibung (ADR-0058). Kein neuer Befund.                                                                              |
| 6   | 4      | Keine `play`-Funktionen in den Stories (auch React/Vue nicht).                                                                                                    | x   | x   | **Echt.** Verhalten steht nur in `atl-button.spec.ts`.                                                                                                          |
| 7   | 5      | `rgba(0,0,0,0.18)` im Danger-Schatten ist kein Token.                                                                                                             | –   | x   | **Kein Befund.** `atelier/no-raw-color-literal` nimmt `box-shadow` bewusst aus; der Master nutzt denselben Wert.                                                |
| 8   | 6      | `loading` setzt natives `disabled`: Fokus geht verloren, kein `aria-busy`. Die Metadaten widersprechen sich selbst ("remove from tab order" vs. "retains focus"). | x   | x   | **Echt.** `atl-button.ts:46,66`; `button.metadata.ts:41`; React gleich (`atl-button.tsx:49,65`).                                                                |
| 9   | 6      | Code setzt `disabled` und `aria-disabled`; Master-Beschreibung sagt "HTML `disabled` (not aria-disabled)".                                                        | –   | x   | **Echt**, geringe Wirkung (redundant, nicht schädlich).                                                                                                         |
| 10  | 6      | Namens-Warnung läuft nur einmal nach dem ersten Render.                                                                                                           | –   | x   | Stimmt; Judge selbst: "accept as is". Kein Handlungsbedarf.                                                                                                     |

## Auszählung

- **A (Codex):** 3 Befunde, 3 echt. Hat den schwersten Defekt (#1) nicht gefunden.
- **B (Sonnet):** 10 Punkte, 6 echt, 1 plausibel, 3 ohne Handlungsbedarf (#5 bekannt, #7 bewusst
  ausgenommen, #10 vom Judge selbst verworfen). Keine erfundene Belegstelle.
- Vereinigung: 7 echte oder plausible Befunde, davon 3 von beiden gefunden.

## Was das für den Prompt heißt

1. **Zwei Judges lohnen sich.** Der präzisere Judge hat den schwersten Defekt übersehen.
2. **Nach Wirkung sortieren.** Bei B stand der Fokusring-Defekt unter neun anderen Punkten
   gleichrangig. Der Prompt verlangt jetzt die Reihenfolge nach Wirkung auf Nutzende.
3. **Bewusste Ausnahmen der Gates kennen.** #7 entstand, weil der Judge die Lint-Ausnahme nicht
   kannte. Der Prompt sagt jetzt: Was ein Gate bewusst ausnimmt, ist kein Befund.
4. **Metadaten als Quelle.** A fand den Widerspruch in `libs/spec/src/metadata/` von selbst; die
   Quelle steht jetzt in der Liste.
5. Rubrikzeile 1 (States) brachte die wertvollsten Befunde, Zeile 5 (Tokens) nur Rauschen. Eine
   Messung reicht nicht, um Zeile 5 zu streichen.

Komponentendefekte (#1, #3, #4, #6, #8, #9) stehen in `tasks/todo.md`, nicht in diesem Track behoben.
