### Karte: Lint und Build, der saubere Lauf

**Ziel.** Du hast die Exit-Codes von `npm run lint` und `npm run build` gesehen, beide 0.

**Material.** Die Settings-Seite aus diesem Block, `npm run lint`, `npm run build`.

**Rahmen.**

- Geglaubt wird der Exit-Code, den Du gesehen hast, nicht der Satz „grün“.

**Fertig, wenn** beide Befehle mit Exit-Code 0 enden und Du die Codes in der Antwort des
Agenten gesehen hast.

**Kür.**

- Führe beide Befehle selbst im Terminal aus und vergleiche die Exit-Codes mit dem, was der
  Agent gemeldet hat.
- Frag den Agenten, was `npm run lint` in {{FRAMEWORK}} nicht prüft, und prüfe seine Antwort
  an einer Stelle selbst.
- Lass den Agenten benennen, welche Datei der Build zuletzt geschrieben hat, und sieh nach.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Hat der Agent beide Befehle schon beim Erzeugen ausgeführt, ist dieser Lauf sofort grün. Das
ist kein verschwendeter Schritt: Bisher hattest Du das Wort des Agenten, jetzt hast Du die
Exit-Codes.

Die Übungen dieser Stufe, die mit Absicht etwas kaputt machen, setzen Angular-Template-Syntax
ein und wurden nur mit Angular geprüft. Sie gehören deshalb nicht zum Kursmaterial für
{{FRAMEWORK}}. Wenn Zeit dafür ist, sieh Dir die Demo des Trainers an.
