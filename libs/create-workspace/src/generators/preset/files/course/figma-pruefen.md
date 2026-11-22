# Figma-Übungen: der Pink-Test und der Linter

Gebraucht in Tag 1 Block 03 und Tag 2 Block 01. An Tag 1 arbeitest Du an der Settings-Seite aus Block 02: dem Frame „Settings / Seite“ (hell) auf der Seite Workshop-Templates, Section „Tag 1 · Settings-Seite“. Die Desktop Bridge muss verbunden sein.
Alles hier passiert in Deinem vorbereiteten Duplikat der Figma-Datei, nie im Original.

Meldet ein Aufruf `WebSocket not connected`: Warte eine Minute, lass den Agenten
`figma_get_status` mit `probe` aufrufen und dann noch einmal versuchen, und schließe andere
Claude-Code-Sitzungen mit Figma. Der Grund steht in `rescue.md`, Abschnitt „Die Figma-Bridge“.

Am Ende des Blocks füllst Du die Checkliste in `readiness-checkliste.md` für einen Master
aus: Der Pink-Test und der Linter beantworten einen Teil der Zeilen, den Rest siehst Du nur
mit eigenen Augen.

## Der Pink-Test (Tag 1 Block 03)

Der Pink-Test beantwortet eine Frage: Welche Farben eines Entwurfs sind an eine Variable
gebunden, und welche sind aufgemalt? Er setzt jede Farbvariable in einem eigenen Modus auf
ein einziges grelles Pink. Was danach nicht pink ist, ist nicht gebunden. Von Hand sind das
über hundert Variablen, deshalb macht es der Agent. **Diese Karte schreibt in Dein
Duplikat**: Sie legt einen Modus und einen Test-Frame an. Die Karte der Mikroübung entfernt
den Modus wieder. Nichts davon wird in Figma von Hand bearbeitet: Der Agent schreibt, Du
schaust und entscheidest. Die Prompts schreibst Du selbst; `prompt-rubrik.md` listet die
sechs Prüfungen, an denen Du sie misst.

### Karte: der Pink-Test

**Ziel.** Ein Screenshot der Settings-Seite im Modus „Pink Test“ und ein Satz von Dir,
welche Füllung oder welcher Effekt seine eigene Farbe behalten hat: „Das ist nicht an eine
Variable gebunden“. Die Seite besteht aus Instanzen der Bibliothek und eigenen Ebenen; such
die Stelle in den eigenen Ebenen.

**Material.**

- Der Frame „Settings / Seite“ (hell) in Deinem Duplikat, Seite Workshop-Templates, Section „Tag 1 · Settings-Seite“. Der Pink-Test läuft an einer Kopie des Frames, nicht am Frame selbst.
- Die Collection Library Tokens, die Seite Workshop-Templates für den Test-Frame.
- figma-console-mcp, `figma_take_screenshot`.

**Rahmen.**

- Sicherheitsregel: Der Agent arbeitet nur in Deinem Duplikat der Figma-Datei, nie im Original.
- Der Modus heißt „Pink Test“ und setzt jede Farbvariable auf `#ff00c8`. Der Test-Frame (die Kopie der Seite) liegt neben der Section auf der Seite Workshop-Templates.

**Fertig, wenn** Du den Screenshot gesehen hast, bevor Du die Antwort gelesen hast, und jede
Füllung oder jeden Effekt, der seine Farbe behalten hat, mit Ebene und Karte benennen kannst.
Den Master und den Frame „Settings / Seite“ hast Du nicht verändert.

**Kür.**

- Lass den Test an einem Master Deiner Wahl (zum Beispiel AtlBadge) laufen und vergleiche die
  Zahl der ungebundenen Stellen mit der der Seite.
- Schreib auf, welche Variable die ungebundene Füllung hätte tragen sollen, und prüfe es
  an den Geschwister-Varianten.
- Lass den Agenten die ungebundenen Stellen als nummerierte Liste mit Ebenenpfad ausgeben.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Sieh Dir den Screenshot an, bevor Du die Antwort liest. Was hat seine eigene Farbe behalten? Ein Pink-Test zeigt nur Farben: Ein ungebundener Abstand oder eine Schriftgröße bleibt unsichtbar.

### Karte: Mikroübung 1, die Bindung reparieren

**Ziel.** Die Füllung, die der Pink-Test als ungebunden gezeigt hat, ist an einer Kopie der
Seite an dieselbe Variable gebunden wie die gleichen Ebenen daneben (zum Beispiel die
Primärfarbe), der Pink-Test an der Kopie ist sauber, und der Modus Pink Test ist wieder
gelöscht.

**Material.** Der Test-Frame aus dem Pink-Test, der Frame „Settings / Seite“ (nur lesen), die
Seite Workshop-Templates, auf der der Test-Frame liegt (der Pink-Test legt einen Frame an, keine Section).

**Rahmen.**

- Sicherheitsregel: gearbeitet wird an einer Kopie der Seite, nicht am Frame selbst, nicht an einem Master und nicht im Original der Datei.
- Am Ende ist der Modus Pink Test wieder gelöscht.

**Fertig, wenn** der Pink-Test an der Kopie keine ungebundene Füllung mehr zeigt, der Frame
„Settings / Seite“ unverändert ist und der Modus gelöscht ist.

**Kür.**

- Prüfe, ob in der Kopie noch ein Rand, ein Radius oder ein Abstand ungebunden ist, und lass
  ihn binden.
- Vergleiche Kopie und Frame in einem Screenshot und beschreib den Unterschied in einem
  Satz.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Wenn Du die Mikroübung nicht mehr schaffst, räum mit einer Zeile auf: Der Agent soll den
Modus Pink Test wieder löschen.

Wenn Dein Figma-Plan keinen weiteren Variablenmodus erlaubt, kann der Agent keinen anlegen:
Sieh stattdessen dem Durchlauf des Trainers zu und lass die Bindung ohne den Modus
reparieren. Der Agent soll die Seite neben den Test-Frame auf der Seite Workshop-Templates
kopieren, die Füllung, die der Pink-Test als ungebunden gezeigt hat, an die passende Variable
binden und einen Screenshot zeigen. Nenne ihm dafür die Ebene, die ihre eigene Farbe
behalten hat.

### Karte: Mikroübung 2, eine Variante und ein Auto Layout

Die beiden anderen Aufgaben der Mikroübung brauchen eine Komponente mit Varianten: Der Agent kopiert dafür den Master AtlButton (nur lesen) neben die Kopie der Seite.

**Ziel.** Die Kopie hat einen zweiten Wert auf ihrer Variantenachse, und zwei Instanzen der
Kopie stehen in einem Auto-Layout-Frame, dessen Abstand an eine Spacing-Variable gebunden
ist.

**Material.** Eine Kopie des Masters AtlButton, der Platz neben dem Test-Frame, die
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

An Tag 1 an der Settings-Seite (hell), an Tag 2 an Deinem eigenen Component Set, bevor
Du das Übergabedokument entwerfen lässt. Dieser Lauf liest nur: In der Datei wird nichts geändert.

### Karte: der Figma-Linter, drei Regeln

**Ziel.** Eine Liste der Befunde (Ebene, Regel, Meldung), in der Du jede Zeile als **echt**
oder **Fehlalarm** eingeordnet hast.

**Material.**

- `figma_lint_design`, `figma_get_selection`.
- Der Node: An Tag 1 der Frame „Settings / Seite“ (hell) auf der Seite Workshop-Templates (lies seine ID in Deinem Duplikat ab,
  nimm nicht an, dass es die ID vom Beamer ist). An Tag 2 Dein eigenes Component Set.
- Wähle den Node in Figma aus, während Claude Code schon läuft, und sag „das Set, das ich
  ausgewählt habe“ (an Tag 1: „der Frame, den ich ausgewählt habe“): Der Agent liest die ID
  mit `figma_get_selection`. Eine Auswahl von vor
  dem Start der Sitzung wird nicht gesehen: Meldet der Agent, dass nichts ausgewählt ist, klick
  das Set noch einmal an.

**Rahmen.**

- Nur die Regeln `hardcoded-color`, `default-name` und `detached-component`.
- Scope-Guard: Der Agent ändert nichts in der Datei.

**Fertig, wenn** jede Zeile eingeordnet ist und Du zu jeder Zeile, die Du für echt hältst, die
Ebene in Figma geöffnet und angesehen hast. An Tag 1 reicht die Einordnung; an Tag 2 hast Du
zuerst die echten Befunde behoben und die Fehlalarme notiert.

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

**Null Befunde heißen nicht „sauber“.** Der Linter prüft nur seine drei Regeln. Ein Master
ohne Befund kann trotzdem ungebundene Abstände, Radien und Effekte haben, ein falsches Auto
Layout oder eine fehlende Variante. Öffne den Entwurf selbst und sieh Dir das Ergebnis des
Pink-Tests an: Beide zeigen, was die Regeln nicht sehen. Auch das ist ein Ergebnis, das Du
mit einem Satz festhältst („0 Befunde, drei Regeln, sonst nichts geprüft“).

**Tag 2, Dein eigenes Set.** Auch Dein Starter-Frame kann Befunde mitbringen: Ordne sie ein wie jede andere Zeile, bevor Du Dein Set darauf aufbaust. Hat Dein Set Icon-Instanzen, rechne mit `default-name`-Befunden
an `Vector`-Ebenen. Diese Ebenen gehören zum Icon der Bibliothek, nicht zu Dir: Fehlalarm,
notieren und weitergehen. Zeichnest Du Icons als Text-Glyphen, gibt es diese Befunde nicht,
und null Befunde sind das erwartbare Ergebnis. Auch dann gilt: Eine Liste ohne eigenen
Befund beweist kein sauberes Set. Drei Regeln sind gelaufen. Abstände, Radien und Struktur
hat niemand geprüft.

### Karte: der Figma-Linter, alle Regeln (Tag 1, zweiter Lauf)

Drei Regeln, drei echte Befunde: Einer sauberen Liste glaubt man leicht. Jetzt derselbe
Node ohne Filter.

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
