# Figma-Übungen: der Pink-Test und der Linter

Gebraucht in Tag 1 Block 03 und Tag 2 Block 01. Die Desktop Bridge muss verbunden sein.
Alles hier passiert in Deinem vorbereiteten Duplikat der Figma-Datei, nie im Original.

## Der Pink-Test (Tag 1 Block 03)

Der Pink-Test beantwortet eine Frage: Welche Farben eines Masters sind an eine Variable
gebunden, und welche sind aufgemalt? Er setzt jede Farbvariable in einem eigenen Modus auf
ein einziges grelles Pink. Was danach nicht pink ist, ist nicht gebunden. Von Hand sind das
über hundert Variablen, deshalb macht es der Agent. **Diese Karte schreibt in Dein
Duplikat**: Sie legt einen Modus und einen Test-Frame an. Die Karte der Mikroübung entfernt
den Modus wieder. Nichts davon wird in Figma von Hand bearbeitet: Der Agent schreibt, Du
schaust und entscheidest. Die Prompts schreibst Du selbst; `prompt-rubrik.md` listet die
sechs Prüfungen, an denen Du sie misst.

### Karte: der Pink-Test

**Ziel.** Ein Screenshot der AtlButton-Varianten im Modus „Pink Test“ und ein Satz von Dir,
welche Füllung ihre eigene Farbe behalten hat: „Diese Füllung ist nicht an eine Variable
gebunden“.

**Material.**

- Der Master AtlButton (Inputs/AtlButton auf der Seite Components) in Deinem Duplikat.
- Die Collection Library Tokens, die Seite Workshop-Templates für den Test-Frame.
- figma-console-mcp, `figma_take_screenshot`.

**Rahmen.**

- Sicherheitsregel: Der Agent arbeitet nur in Deinem Duplikat der Figma-Datei, nie im Original.
- Der Modus heißt „Pink Test“ und setzt jede Farbvariable auf `#ff00c8`. Der Test-Frame liegt auf der Seite Workshop-Templates.

**Fertig, wenn** Du den Screenshot gesehen hast, bevor Du die Antwort gelesen hast, und die
Füllung, die ihre Farbe behalten hat, in einem Satz benennen kannst.

**Kür.**

- Lass den Test an einem zweiten Master Deiner Wahl (zum Beispiel AtlBadge) laufen und
  vergleiche die Zahl der ungebundenen Stellen.
- Schreib auf, welche Variable die ungebundene Füllung hätte tragen sollen, und prüfe es
  an den Geschwister-Varianten.
- Lass den Agenten die ungebundenen Stellen als nummerierte Liste mit Ebenenpfad ausgeben.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Sieh Dir den Screenshot an, bevor Du die Antwort liest. Was hat seine eigene Farbe behalten?

### Karte: Mikroübung 1, die Bindung reparieren

**Ziel.** Die Variante, die nicht pink wurde, ist an einer Kopie an dieselbe Variable
gebunden wie ihre Geschwister-Varianten, der Pink-Test an der Kopie ist sauber, und der
Modus Pink Test ist wieder gelöscht.

**Material.** Der Test-Frame aus dem Pink-Test, der Master AtlButton (nur lesen), die
Section des Test-Frames.

**Rahmen.**

- Sicherheitsregel: gearbeitet wird an einer Kopie des Masters, nicht am Master selbst und nicht im Original der Datei.
- Am Ende ist der Modus Pink Test wieder gelöscht.

**Fertig, wenn** der Pink-Test an der Kopie keine ungebundene Füllung mehr zeigt, der Master
unverändert ist und der Modus gelöscht ist.

**Kür.**

- Prüfe, ob in der Kopie noch ein Rand, ein Radius oder ein Abstand ungebunden ist, und lass
  ihn binden.
- Vergleiche Kopie und Master in einem Screenshot und beschreib den Unterschied in einem
  Satz.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Wenn Du die Mikroübung nicht mehr schaffst, räum mit einer Zeile auf: Der Agent soll den
Modus Pink Test wieder löschen.

Wenn Dein Figma-Plan keinen weiteren Variablenmodus erlaubt, kann der Agent keinen anlegen:
Sieh stattdessen dem Durchlauf des Trainers zu und lass die Variante ohne den Modus
reparieren. Der Agent soll sie von AtlButton in eine neue Section auf der Seite
Workshop-Templates kopieren, die Füllung an die Variable ihrer Geschwister-Varianten binden
und einen Screenshot zeigen. Nenne ihm dafür die Variante, die ihre eigene Farbe behalten
hat.

### Karte: Mikroübung 2, eine Variante und ein Auto Layout

Die beiden anderen Aufgaben der Mikroübung liegen auf derselben Kopie.

**Ziel.** Die Kopie hat einen zweiten Wert auf ihrer Variantenachse, und zwei Instanzen der
Kopie stehen in einem Auto-Layout-Frame, dessen Abstand an eine Spacing-Variable gebunden
ist.

**Material.** Die Kopie aus der Mikroübung 1, die Section des Test-Frames, die
Spacing-Variablen aus Library Tokens, `figma_take_screenshot`.

**Rahmen.**

- Sicherheitsregel: nur an der Kopie in Deinem Duplikat, nie am Master und nie im Original.
- Der neue Wert der Variantenachse heißt `ghost`.

**Fertig, wenn** die Property `variant` zwei Werte hat, der Abstand an eine Variable
gebunden ist und Du im Design-Panel gelesen hast, welches der Werte (Richtung, Abstand,
Padding) eine Variable trägt.

**Kür.**

- Gib der Ghost-Variante einen eigenen Hover-Zustand und prüfe im Screenshot, dass er sich
  vom Default unterscheidet.
- Ändere den Abstand noch einmal auf den nächsten Wert der Skala und beschreib, was sich im
  Frame verschiebt.
- Benenne „ghost“ nach Deinem Geschmack um (zum Beispiel „quiet“) und lass den Agenten jede
  Erwähnung des alten Namens nachziehen.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Sieh Dir jeden Screenshot an, bevor Du die Antwort liest. Nach dem ersten: Die Property
`variant` hat jetzt zwei Werte (der Agent listet vielleicht auch `size` und `state` mit je
einem Wert auf). Kannst Du das Label der Ghost-Variante lesen? „Ohne Füllung“ ist alles, was
der Auftrag verlangt hat, und ein Agent tut, was verlangt wurde: Wenn das Label fehlt, sag,
was Du siehst und was Du stattdessen willst. Würde der Code „ghost“ so übernehmen, oder
würdest Du es anders nennen? Sag dem Agenten den Namen, den Du willst. Nach dem zweiten:
Wähle den neuen Frame in Figma aus und lies Richtung, Abstand und Padding im Design-Panel.
Welches davon trägt eine Variable, und was hat sich bewegt, als der Abstand sich änderte?

## Der Linter (Tag 1 Block 03 und Tag 2 Block 01)

An Tag 1 am Master, den der Trainer nennt, an Tag 2 an Deinem eigenen Component Set, bevor
Du das Übergabedokument entwerfen lässt. Dieser Lauf liest nur: In der Datei wird nichts geändert.

### Karte: der Figma-Linter, drei Regeln

**Ziel.** Eine Liste der Befunde (Ebene, Regel, Meldung), in der Du jede Zeile als **echt**
oder **Fehlalarm** eingeordnet hast.

**Material.**

- `figma_lint_design`, `figma_get_selection`.
- Der Node: An Tag 1 der Master, den der Trainer nennt (lies seine ID in Deinem Duplikat ab,
  nimm nicht an, dass es die ID vom Beamer ist). An Tag 2 Dein eigenes Component Set.
- Wähle den Node in Figma aus, während Claude Code schon läuft, und sag „der Node, den ich
  ausgewählt habe“: Der Agent liest die ID mit `figma_get_selection`. Eine Auswahl von vor
  dem Start der Sitzung wird nicht gesehen: Meldet der Agent, dass nichts ausgewählt ist, klick
  das Set noch einmal an.

**Rahmen.**

- Nur die Regeln `hardcoded-color`, `default-name` und `detached-component`.
- Scope-Guard: Der Agent ändert nichts in der Datei.

**Fertig, wenn** jede Zeile eingeordnet ist. An Tag 2 hast Du zuerst die echten Befunde
behoben und die Fehlalarme notiert.

**Kür.**

- Schreib zu jedem Fehlalarm in einem Satz, warum das Werkzeug ihn meldet.
- Such eine Abweichung in Deinem Set, die keine der drei Regeln fangen kann (ein Abstand oder
  ein Radius), und zeige sie im Screenshot.
- Lass den Agenten die Befunde nach Regel gruppieren und zähle, welche Regel am meisten
  meldet.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Ein Befund ist etwas zum Einordnen, kein Urteil. Die drei Regeln fangen rohe Farben, Ebenen
mit Standardnamen und gelöste Instanzen. Sie sehen nicht, ob das Design stimmt, und nicht
Abstände und Radien.

**Tag 2, Dein eigenes Set.** Rechne mit `default-name`-Befunden an `Vector`-Ebenen in
Icon-Instanzen. Diese Ebenen gehören zum Icon der Bibliothek, nicht zu Dir: Fehlalarm,
notieren und weitergehen. Eine Liste ohne eigenen Befund beweist kein sauberes Set. Drei
Regeln sind gelaufen. Abstände, Radien und Struktur hat niemand geprüft.

### Karte: der Figma-Linter, alle Regeln (Tag 1, zweiter Lauf)

Drei Regeln, drei echte Befunde: Einer sauberen Liste glaubt man leicht. Jetzt derselbe
Master ohne Filter.

**Ziel.** Eine nach Regel gruppierte Liste, in der Du für jede Gruppe entschieden hast, ob
sie echt, ein Fehlalarm oder Ansichtssache ist.

**Material.** `figma_lint_design` auf demselben Node wie im Lauf davor, Dein Duplikat in
Figma, um Beispielebenen zu öffnen.

**Rahmen.**

- Alle Regeln, ohne Filter.
- Scope-Guard: Der Agent ändert nichts in der Datei.

**Fertig, wenn** Du von jeder Gruppe die Beispielebene in Figma geöffnet und gesehen hast,
ob die Ebene überhaupt sichtbar ist, und die Gruppe eingeordnet hast.

**Kür.**

- Schätze vor dem Öffnen, welche Gruppe echt ist, und vergleiche mit Deiner Einordnung
  danach.
- Such die Gruppe mit den meisten „critical“-Befunden und prüfe, ob einer davon für einen
  Nutzer je sichtbar ist.
- Schreib auf, welche zwei Regeln Du in Deinem eigenen Projekt immer einschalten würdest.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Die Liste ist um ein Vielfaches länger, und das meiste ist als „critical“ markiert. Bevor Du
eine Gruppe einordnest, öffne ihre Beispielebene in Figma: Ist die Ebene überhaupt sichtbar?
Welche Gruppe ist echt, welche ein Fehlalarm, und welche ist Ansichtssache? Ein Werkzeug,
das nach Regeln meldet, weiß nicht, welche Ebenen ein Nutzer je sieht. Darum ist ein Befund
etwas zum Einordnen.
