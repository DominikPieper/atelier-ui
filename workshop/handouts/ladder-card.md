# Fünf Werkzeuge: Der Agent prüft seine Arbeit selbst

Jedes Werkzeug sieht etwas anderes. Was eines nicht sieht, prüfst Du selbst, oder die nächste Stufe fängt es.

| Stufe | Werkzeug                                      | Fängt                                                                                         | Sieht nicht                                                                                                |
| ----- | --------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 0     | Figma-Linter                                  | feste Farben, Standardnamen, gelöste Instanzen                                                | ob der Entwurf richtig ist; Abstand und Radius                                                             |
| 1     | Compiler, strict (`npm run build`)            | falsche Werte für Inputs, ein Binding auf einen Input, den es nicht gibt                      | erfundene Props als statisches Attribut (`shadow="lg"`), ein erfundenes Event                              |
| 2     | ESLint (`npm run lint`)                       | Bild ohne `alt`, klickbares `div`, nicht fokussierbar                                         | ein rohes `<button>`, wo es eine Bibliothekskomponente gibt; ob der alt-Text etwas sagt (`alt=""` besteht) |
| 3     | Stylelint (`npm run check:stylelint`)         | Rohfarben in `.css`-Dateien, am Token vorbei                                                  | Inline-`style=`, `styles:`-Arrays, benannte Farben, `oklch()`                                              |
| 4     | Story-Tests mit axe (`npm run check:stories`) | Zustände, die nicht rendern, eine fehlschlagende `play`-Funktion, Barrierefreiheit in Stories | alles ohne Story; Dark Mode; Tastaturwege, die keine `play`-Funktion geht                                  |

**Absichtlich kaputt machen. Das Werkzeug meldet es. Der Agent repariert.**

Der Prompt, der jede Stufe antreibt:

> Führe `<Befehl>` aus. Melde jeden Exit-Code. Ist einer nicht 0, lies die Ausgabe (das ganze Log, wenn die Zusammenfassung keinen Fehlertext hat), repariere und führe ihn erneut aus.

Drei Dinge zum Mitnehmen:

1. **Grün heißt nicht richtig.** Lint verlangt `alt`, der Agent schreibt `alt=""`, Lint ist grün, und ein Bild mit Aussage bleibt für Screenreader unsichtbar.
2. **Jede Zeile hat einen blinden Fleck.** Was ein Werkzeug nicht sieht, prüfst Du selbst, oder die nächste Stufe.
3. **Keines der fünf fängt einen erfundenen Namen oder ein von Hand gebautes Element.** Dafür braucht jede Eigenschaft eine `docs-show`-Quelle in der Belegtabelle.
