# Was ein Design-System mitbringen muss

Im Raum, aus dem Kopf: Kreuz pro Zeile für Dein eigenes Design-System ja, teilweise oder nein an. Die letzte Spalte ist für zu Hause, wo Dein System offen ist.

| Zeile          | Die Frage                                                                                                        | So sieht „ja“ aus                                                                                                                                                             | ja / teilweise / nein | Wo prüfen                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------- |
| 1 Beschreiben  | Weiß der Agent, wofür jede Komponente da ist und was jede Eigenschaft tut?                                       | Eine Beschreibung pro Komponente und pro Eigenschaft, Werte vollständig ausgeschrieben, die Import-Zeile im Verwendungsbeispiel; lesbar über den Storybook-MCP (`docs-show`). | [ ] / [ ] / [ ]       | Storybook-Checkliste (Handout)         |
| 2 Einschränken | Lässt die API wenig zu raten?                                                                                    | Literal-Unions statt `string`, eine Variantenachse statt vieler Boolean-Props, Komposition statt Konfiguration, ein Default für jede Eigenschaft.                             | [ ] / [ ] / [ ]       | Deine Props in `docs-show`             |
| 3 Tokens       | Hat jeder Wert einen Namen, in Figma und Code gleich, und schalten die Modi über diese Namen um?                 | Jede Farbe, jeder Abstand, jeder Radius ist ein benanntes Token; der Name ist auf beiden Seiten identisch; Dark Mode schaltet über die Tokens um.                             | [ ] / [ ] / [ ]       | Figma-Checkliste (Handout)             |
| 4 Belegen      | Hat jeder Variantenwert und Zustand eine Story, und laufen die Stories als Tests mit axe?                        | Eine Story pro Variantenwert und Boolean-Zustand; jede Story läuft als Test, Barrierefreiheits-Check eingeschlossen.                                                          | [ ] / [ ] / [ ]       | Storybook-Checkliste (Handout)         |
| 5 Durchsetzen  | Steht jede Regel, die sich erzwingen lässt, in einem Linter oder im Compiler statt in einem Wiki?                | Strict TypeScript, ESLint, Stylelint und ein Figma-Linter tragen die Regeln.                                                                                                  | [ ] / [ ] / [ ]       | Deine Lint- und Compiler-Konfiguration |
| 6 Anleiten     | Hat das Repo eine eigene Regeldatei mit den genauen Prüfbefehlen und einen Skill für die wiederkehrende Aufgabe? | Eine Regeldatei (`CLAUDE.md` oder `AGENTS.md`) mit einer „Definition of Done“, die die Befehle nennt; ein Skill für die wiederkehrende Aufgabe.                               | [ ] / [ ] / [ ]       | Deine Regeldatei                       |
| 7 Messen       | Weißt Du, dass der Agent mit dem Design-System besser ist als ohne?                                              | Derselbe Prompt mit und ohne Kontext ausgeführt, die Ergebnisse verglichen.                                                                                                   | [ ] / [ ] / [ ]       | einmal selbst durchführen              |

**Such Dir die schwächste Zeile aus und schreib Deinen nächsten Schritt dazu.**

Schwächste Zeile: ______________ Mein nächster Schritt: ____________________________________________

Hausaufgabe: Geh die beiden Checklisten (Figma, Storybook) an Deinem eigenen System durch.

Wo der Kurs welche Zeile behandelt hat:

1. Beschreiben: die Docs, die der Agent über `docs-show` liest, und Deine Komponente, gelesen wie vom nächsten Agenten.
2. Einschränken: die API-Regeln, bevor Du einen Prop-Namen schreibst.
3. Tokens: Figma für Code prüfen, der Dark-Check.
4. Belegen: eine Story, die scheitern kann; Erweitere Deine Komponente, Test zuerst.
5. Durchsetzen: die fünf Werkzeuge und `/verify`.
6. Anleiten: die Definition of Done in `CLAUDE.md`, der Skill und die Entscheidungsdatei.
7. Messen: die Guardrail-Demo am ersten Morgen ist die kleinste Form.
