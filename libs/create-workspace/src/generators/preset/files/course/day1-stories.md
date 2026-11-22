# Tag 1, Block 04: die Docs, die der Agent liest, und eine Story, die scheitern kann

Gebraucht in Tag 1, Block 04. Zwei Teile: Du fragst den MCP-Server `{{MCP}}`, was eine
Bibliothekskomponente kann, und Du schreibst eine Story mit einer `play`-Funktion, siehst sie
einmal rot und dann grün. Storybook muss laufen (`npm run storybook`, Port 6006), bevor
Claude Code startet, sonst ist `storybook-local` nicht verbunden (siehe `rescue.md`).

**Fertig, wenn** `docs-show` auf Deinem Platz aufgerufen wurde und eine Story mit einer
`play`-Funktion einmal rot war und jetzt grün ist.

## Teil 1: die Docs befragen (14:40 bis 15:00)

```text
Nutze den {{MCP}} MCP. Rufe docs-list auf, dann docs-show für die AtlButton-ID, und
liste ihre Props mit den erlaubten Werten auf. Rate nicht.
```

Frag dann nach etwas, das es nicht gibt:

```text
Hat AtlButton eine `shadow`-Prop? Antworte nur aus docs-show.
```

Die Antwort, die Du willst, ist ein schlichtes „Nein“, mit der Stelle, an der der Agent
nachgesehen hat. Eine Antwort, die anfängt zu erklären, wie man trotzdem einen Schatten
hinzufügen könnte, hat die Docs verlassen.

## Teil 2: eine Story mit `play`, erst rot, dann grün (15:00 bis 15:25)

Der Workspace hat eine Vorlagen-Story, die Datei `atl-button.stories` in
`workshop-{{FRAMEWORK_LC}}/src/`. Ihre Story `Primary` klickt den Button und prüft, dass
sich der Text daneben ändert.

```text
Storybook läuft auf Port 6006. Schreibe eine neue Story in der Datei atl-button.stories
unter workshop-{{FRAMEWORK_LC}}/src/ für die Variante Outline mit einem Klick,
nach dem Muster der Story Primary, mit einer play-Funktion, die das Verhalten prüft.
Rufe get-storybook-story-instructions von storybook-local auf, bevor Du irgendetwas
schreibst. Führe sie dann mit test-run über storybook-local aus und nenne mir das
Ergebnis.
```

Die Datei hat schon eine Story `Outline`, ohne Klick. Welchen Namen hat der Agent der neuen
gegeben, und hat er gesagt, warum?

Beim ersten Lauf wird sie sehr wahrscheinlich grün sein. Eine `play`-Funktion, die noch nie
gescheitert ist, hat noch nichts bewiesen, also mach sie kaputt:

```text
Mach sie jetzt mit Absicht kaputt: Ändere den Text, den die play-Funktion erwartet, auf
`never`. Führe test-run noch einmal aus und zeig mir den Fehler genau so, wie das
Werkzeug ihn meldet. Repariere noch nichts.
```

Lies den Fehler in der Antwort des Agenten und im Interactions-Panel von Storybook: Es ist
dasselbe Rot. Welche Zeile nennt den Text, den die `play`-Funktion gesucht hat, und wo zeigt
die Ausgabe den Text, der wirklich auf der Seite steht?

```text
Repariere sie wieder und zeig mir, dass sie grün ist.
```

## Teil 3: lesen, was geschrieben wurde

```text
Erkläre mir den Aufbau der Story-Datei, die Du gerade bearbeitet hast: Was ist meta, was
ist eine Story, was sind args, was macht play, und woher kommt der Text `clicked`?
```

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
