# Tag 1, Block 04: die Docs, die der Agent liest, und eine Story, die scheitern kann

Gebraucht in Tag 1, Block 04. Drei Karten: Du fragst den MCP-Server `{{MCP}}`, was eine
Bibliothekskomponente kann, Du schreibst eine Story mit einer `play`-Funktion, siehst sie
einmal rot und dann grün, und Du lässt Dir die Story-Datei erklären. Storybook muss laufen
(`npm run storybook`, Port 6006), bevor Claude Code startet, sonst ist `storybook-local`
nicht verbunden (siehe `rescue.md`). Die Prompts schreibst Du selbst; `prompt-rubrik.md`
sagt, woran Du sie prüfst.

Der Block ist geschafft, wenn `docs-show` auf Deinem Platz aufgerufen wurde und eine Story mit
einer `play`-Funktion einmal rot war und jetzt grün ist.

## Teil 1: die Docs befragen (14:40 bis 15:00)

### Karte: AtlButton aus den Docs

**Ziel.** Du hast die Props von AtlButton mit allen erlaubten Werten aus den Docs und eine
Antwort auf eine Frage, die die Docs nicht beantworten können, mit der Stelle, an der der
Agent nachgesehen hat.

**Material.** Der MCP-Server `{{MCP}}` mit `docs-list` und `docs-show` für die AtlButton-ID.

**Rahmen.**

- Was `docs-show` nicht dokumentiert, gilt als nicht vorhanden. Geraten wird nicht.

**Fertig, wenn** der Agent die Props mit ihren Werten aufgelistet hat und auf die
`shadow`-Frage ein schlichtes „Nein“ mit der Fundstelle sagt.

**Kür.**

- Frag nach einer zweiten Prop, die es nicht gibt (zum Beispiel einer `tooltip`-Prop), und
  prüfe, ob die Antwort wieder bei den Docs bleibt.
- Lass die Variantenwerte von AtlButton auflisten und prüfe zwei davon in der Story-Liste.
- Frag, welche Props von AtlButton Zustände steuern, und welche nur das Aussehen.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Die Antwort, die Du willst, ist ein schlichtes „Nein“, mit der Stelle, an der der Agent
nachgesehen hat. Eine Antwort, die anfängt zu erklären, wie man trotzdem einen Schatten
hinzufügen könnte, hat die Docs verlassen.

## Teil 2: eine Story mit `play`, erst rot, dann grün (15:00 bis 15:25)

Der Workspace hat eine Vorlagen-Story, die Datei `atl-button.stories` in
`workshop-{{FRAMEWORK_LC}}/src/`. Ihre Story `Primary` klickt den Button und prüft, dass
sich der Text daneben ändert.

### Karte: eine Story mit `play`, erst rot, dann grün

**Ziel.** Eine neue Story für die Variante Outline mit einem Klick, deren `play`-Funktion
Du einmal rot (mit einer absichtlich falschen Erwartung) und dann wieder grün gesehen hast.

**Material.**

- Die Datei `atl-button.stories` unter `workshop-{{FRAMEWORK_LC}}/src/` mit der Story
  `Primary` als Muster.
- `storybook-local`: `get-storybook-story-instructions` und `test-run`.
- Das Interactions-Panel von Storybook.

**Rahmen.**

- Die Story folgt dem Muster von `Primary`.
- Rot mit Absicht: Die `play`-Funktion scheitert einmal an einer falschen Erwartung (`never`), und repariert wird erst, nachdem Du das Rot gelesen hast.

**Fertig, wenn** Du den roten und den grünen Lauf gesehen hast, im Ergebnis des Agenten und
im Interactions-Panel, und sagen kannst, welche Zeile den gesuchten Text nennt.

**Kür.**

- Schreib eine zweite Story für einen Zustand, den `Primary` nicht abdeckt (zum Beispiel
  disabled), mit einer `play`-Funktion, die beweist, dass der Klick nichts bewirkt.
- Lass die `play`-Funktion mit der Tastatur statt mit der Maus auslösen und prüfe, ob sie
  grün bleibt.
- Mach die neue Story noch auf eine zweite Art rot (falsche Rolle statt falscher Text) und
  lies, wie sich die Fehlermeldung unterscheidet.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Die Datei hat schon eine Story `Outline`, ohne Klick. Welchen Namen hat der Agent der neuen
gegeben, und hat er gesagt, warum?

Beim ersten Lauf wird sie sehr wahrscheinlich grün sein. Eine `play`-Funktion, die noch nie
gescheitert ist, hat noch nichts bewiesen, deshalb machst Du sie kaputt.

Lies den Fehler in der Antwort des Agenten und im Interactions-Panel von Storybook: Es ist
dasselbe Rot. Welche Zeile nennt den Text, den die `play`-Funktion gesucht hat, und wo zeigt
die Ausgabe den Text, der wirklich auf der Seite steht?

## Teil 3: lesen, was geschrieben wurde

### Karte: die Story-Datei lesen

**Ziel.** Du kannst in der bearbeiteten Datei `meta`, eine Story, `args` und `play`
zeigen und sagen, woher der Text `clicked` kommt.

**Material.** Die Story-Datei aus Teil 2, der Agent als Erklärer.

**Rahmen.**

- Die Erklärung bezieht sich auf die Datei, die der Agent bearbeitet hat, nicht auf Storybook im Allgemeinen.

**Fertig, wenn** Du jeden der fünf Begriffe in Deiner Datei mit dem Finger zeigen kannst.

**Kür.**

- Lass den Agenten eine Zeile der Datei absichtlich falsch erklären, indem Du ihm eine
  falsche Behauptung vorlegst („`args` steuert die `play`-Funktion“), und prüfe, ob er
  widerspricht.
- Schreib in eigenen Worten einen Satz, was `play` von einem Unit-Test unterscheidet.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Zwei Fragen an Dich, nicht an den Agenten:

- Sieh Dir die Story-Liste an, die `docs-show` in Teil 1 ausgegeben hat, und Deine
  Story-Datei. Sie passen nicht zusammen: `docs-show` listet Stories, die Deine Datei nicht
  hat, und kennt die nicht, die Du gerade geschrieben hast. Aus welchem Storybook kommt jede
  der beiden Antworten? (`{{MCP}}` antwortet für die Bibliothek, wie sie veröffentlicht
  wurde; `storybook-local` antwortet für das, was auf Deinem Rechner läuft.)
- Der Agent hat „grün“ gesagt. Hast Du die Story laufen sehen, oder hast Du einen Satz
  gelesen?

Ist `storybook-local` nicht verbunden, starte Storybook, führe dann `/mcp` aus und verbinde
neu. Das Interactions-Panel im Browser zeigt in der Zwischenzeit dasselbe Ergebnis.
