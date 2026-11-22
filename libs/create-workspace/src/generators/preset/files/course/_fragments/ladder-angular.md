Diese Stufe nutzt die Angular-Template-Regeln, die `npm run lint` in diesem Workspace
ausführt, an der Settings-Seite, die Du gerade erzeugt hast. Du machst den Lauf erst sauber,
dann mit Absicht kaputt: Das Werkzeug sagt es, und der Agent repariert.

### Karte: Lint und Build, erst sauber, dann mit Absicht rot

**Ziel.** Du hast die Exit-Codes von `npm run lint` und `npm run build` gesehen, danach
zwei absichtlich eingebaute Fehler an der Settings-Seite von lint gemeldet bekommen, sie
reparieren lassen und wieder entfernt. Am Ende sind beide Befehle grün.

**Material.** Die Settings-Seite aus diesem Block, `npm run lint`, `npm run build`, die
Ausgabe von lint.

**Rahmen.**

- Eingebaut werden genau diese zwei Fehler in die Settings-Seite: ein `<img src="/avatar.png">` ohne `alt` und ein `<div (click)="save()">Save</div>`. Repariert wird erst, nachdem lint sie gemeldet hat.
- Am Ende sind beide Fehler wieder entfernt, und beide Befehle enden mit Exit-Code 0.

**Fertig, wenn** lint beim kaputten Lauf Exit-Code ungleich 0 und die Regel-IDs `alt-text`
(das Bild), `click-events-have-key-events` und `interactive-supports-focus` (das div)
gemeldet hat und beide Befehle nach dem Aufräumen mit 0 enden.

**Kür.**

- Baue einen dritten Fehler ein, den die Atelier-Template-Regeln melden (ein reiner
  Icon-`<button atl-button>` ohne zugänglichen Namen), und lass ihn aus der Ausgabe
  reparieren.
- Frag den Agenten, welche Regel-ID zu welcher Zeile gehört, und prüfe zwei Zuordnungen in
  der Lint-Ausgabe selbst.
- Schreib in einem Satz auf, welchen Fehler lint nicht gefunden hätte, und warum.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Lies jetzt die Reparatur. Was hat der Agent als `alt` geschrieben? Meist erfindet er einen
Namen wie `alt="User avatar"`. Lint ist mit jedem Text grün, auch mit `alt=""`, und das
versteckt das Bild vor dem Screenreader. Stimmt der Name, und wer hat ihn entschieden? Grün
heißt nicht richtig.

Hat der Agent beide Befehle schon beim Erzeugen ausgeführt, ist der saubere Lauf sofort
grün. Das ist kein verschwendeter Schritt: Bisher hattest Du das Wort des Agenten, jetzt
hast Du die Exit-Codes.

Was lint nicht sieht: einen rohen `<button>`, wo es eine Bibliothekskomponente gibt, und
Bedeutung (jeder `alt`-Text besteht, auch der falsche). Hängt der Agent oder meldet „failed“
ohne Fehlertext, tippe `npm run lint` (oder `npm run build`) im Terminal und lies die
Ausgabe selbst.
