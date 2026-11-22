Diese Stufe nutzt die Angular-Template-Regeln, die `npm run lint` in diesem Workspace
ausführt. Drei Prompts, der Reihe nach, an der Settings Card, die Du gerade erzeugt hast.
Prompt 1 ist der saubere Lauf. Prompt 2 und 3 machen ihn mit Absicht kaputt, das Werkzeug
sagt es, und der Agent repariert.

**Prompt 1, der saubere Lauf.**

```text
Führe `npm run lint` und `npm run build` aus. Nenne jeden Exit-Code. Ist einer nicht 0, lies
die Ausgabe (das vollständige Log, wenn die Zusammenfassung keinen Fehlertext enthält),
repariere und führe beide erneut aus.
```

Hat der Agent beide schon beim Erzeugen ausgeführt, ist dieser Lauf sofort grün. Das ist kein
verschwendeter Schritt: Bisher hattest Du das Wort des Agenten, jetzt hast Du die Exit-Codes.

**Prompt 2, mit Absicht kaputt machen.** Lass den Agenten noch nichts reparieren.

```text
Füge der Settings Card ein `<img src="/avatar.png">` ohne `alt` und ein
`<div (click)="save()">Save</div>` hinzu. Repariere nichts. Führe `npm run lint` aus, nenne
den Exit-Code und die Regel-IDs, die lint ausgibt.
```

Erwarte einen Exit-Code ungleich 0 und diese Regel-IDs: `alt-text` (das Bild),
`click-events-have-key-events` und `interactive-supports-focus` (das div).

**Prompt 3, aus der Ausgabe reparieren.**

```text
Repariere anhand der lint-Ausgabe. Führe lint und build erneut aus und nenne beide Exit-Codes.
```

Lies jetzt die Reparatur. Was hat der Agent als `alt` geschrieben? Meist erfindet er einen
Namen wie `alt="User avatar"`. Lint ist mit jedem Text grün, auch mit `alt=""`, und das
versteckt das Bild vor dem Screenreader. Stimmt der Name, und wer hat ihn entschieden? Grün
heißt nicht richtig.

**Aufräumen.**

```text
Entferne das Bild und das div wieder, führe beide aus, nenne die Exit-Codes.
```

Was lint nicht sieht: einen rohen `<button>`, wo es eine Bibliothekskomponente gibt, und
Bedeutung (jeder `alt`-Text besteht, auch der falsche). Hängt der Agent oder meldet „failed“
ohne Fehlertext, tippe `npm run lint` (oder `npm run build`) im Terminal und lies die Ausgabe
selbst.
