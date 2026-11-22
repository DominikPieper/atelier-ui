# Figma-Prompts: der Pink-Test und der Linter

Gebraucht in Tag 1 Block 03 und Tag 2 Block 01. Die Desktop Bridge muss verbunden sein.
Alles hier passiert in Deinem vorbereiteten Duplikat der Figma-Datei, nie im Original.

## Der Pink-Test (Tag 1 Block 03)

Der Pink-Test beantwortet eine Frage: Welche Farben eines Masters sind an eine Variable
gebunden, und welche sind aufgemalt? Er setzt jede Farbvariable in einem eigenen Modus auf
ein einziges grelles Pink. Was danach nicht pink ist, ist nicht gebunden. Von Hand sind das
über hundert Variablen, deshalb macht es der Agent. **Dieser Prompt schreibt in Dein
Duplikat**: Er legt einen Modus und einen Test-Frame an. Der zweite Prompt, in der
Mikroübung, entfernt den Modus wieder.

```text
Mach den Pink-Test am Master AtlButton (Inputs/AtlButton auf der Seite
Components): Lege in der Collection Library Tokens einen dritten Modus
"Pink Test" an, setze in diesem Modus jede Farbvariable auf #ff00c8, stelle
auf der Seite Workshop-Templates einen Test-Frame mit je einer Instanz jeder
AtlButton-Variante auf und setze den Frame auf den Modus Pink Test. Zeig mir
einen Screenshot und sag mir, was nicht pink geworden ist.
```

Sieh Dir den Screenshot an, bevor Du die Antwort liest. Was hat seine eigene Farbe behalten?
Sag es in einem Satz: „Diese Füllung ist nicht an eine Variable gebunden“.

Für die Mikroübung am Ende des Blocks, die Reparatur an einer Kopie:

```text
Repariere diese Bindung an einer Kopie des Masters, nicht am Master selbst:
Kopiere die Variante, die nicht pink geworden ist, in die Section des
Test-Frames, binde ihre Füllung an die Variable, die ihre Geschwister-Varianten
benutzen, und zeig mir den Pink-Test an der Kopie. Lösche danach den Modus
Pink Test wieder.
```

Die beiden anderen Aufgaben der Mikroübung liegen auf derselben Kopie. Nichts davon wird in
Figma von Hand bearbeitet: Der Agent schreibt, Du schaust und entscheidest.

```text
Zwei weitere Dinge an derselben Kopie, mit einem Screenshot nach jedem. Erstens:
Gib der Kopie einen weiteren Wert auf ihrer Variantenachse: eine zweite Variante
"ghost" neben der ersten, in einem eigenen Component Set, derselbe Button ohne
Füllung. Nenne mir die Property und beide Werte. Zweitens: Stelle zwei Instanzen
der Kopie in einen neuen Frame mit Auto Layout in der Section des Test-Frames,
den Abstand an eine Spacing-Variable gebunden. Ändere dann den Abstand auf den
nächsten Wert der Skala und sag mir, was sich bewegt hat.
```

Sieh Dir jeden Screenshot an, bevor Du die Antwort liest. Nach dem ersten: Die Property
`variant` hat jetzt zwei Werte (der Agent listet vielleicht auch `size` und `state` mit je
einem Wert auf). Kannst Du das Label der Ghost-Variante lesen? „Ohne Füllung“ ist alles, was
der Prompt verlangt hat, und ein Agent tut, was verlangt wurde: Wenn das Label fehlt, sag,
was Du siehst und was Du stattdessen willst. Würde der Code „ghost“ so übernehmen, oder
würdest Du es anders nennen? Sag dem Agenten den Namen, den Du willst. Nach dem zweiten:
Wähle den neuen Frame in Figma aus und lies Richtung, Abstand und Padding im Design-Panel.
Welches davon trägt eine Variable, und was hat sich bewegt, als der Abstand sich änderte?

Wenn Du die Mikroübung nicht mehr schaffst, räum mit einer Zeile auf: „Lösche den Modus
Pink Test wieder.“

Wenn Dein Figma-Plan keinen weiteren Variablenmodus erlaubt, kann der Agent keinen anlegen:
Sieh stattdessen dem Durchlauf des Trainers zu und bitte dann um die Reparatur ohne den
Modus: „Kopiere die Variante <die, die ihre eigene Farbe behalten hat> von AtlButton in eine
neue Section auf der Seite Workshop-Templates, binde ihre Füllung an die Variable, die ihre
Geschwister-Varianten benutzen, und zeig mir einen Screenshot.“

## Der Linter (Tag 1 Block 03 und Tag 2 Block 01)

An Tag 1 am Master, den der Trainer nennt, an Tag 2 an Deinem eigenen Component Set, bevor
Du das Übergabedokument schreibst. Dieser Lauf liest nur: In der Datei wird nichts geändert.

```text
Führe figma_lint_design auf dem Node <NODE> (<MASTER-NAME>) aus, nur mit den Regeln
hardcoded-color, default-name und detached-component. Gib die Befunde als Liste
zurück: Ebene, Regel, Meldung. Ändere nichts in der Datei.
```

`<NODE>`: An Tag 1 der Master, den der Trainer nennt (lies seine ID in Deinem Duplikat ab,
nimm nicht an, dass es die ID vom Beamer ist). An Tag 2 Dein eigenes Component Set: Wähle es
in Figma aus, während Claude Code schon läuft, und sag „der Node, den ich ausgewählt habe“
(der Agent liest die ID mit `figma_get_selection`). Eine Auswahl von vor dem Start der
Sitzung wird nicht gesehen: Meldet der Agent, dass nichts ausgewählt ist, klick das Set
noch einmal an.

Ordne jede Zeile des Ergebnisses ein: **echt** oder **Fehlalarm**. Ein Befund ist etwas zum
Einordnen, kein Urteil. Die drei Regeln fangen rohe Farben, Ebenen mit Standardnamen und
gelöste Instanzen. Sie sehen nicht, ob das Design stimmt, und nicht Abstände und Radien. An
Tag 2 behebst Du zuerst die echten Befunde und notierst die Fehlalarme.

**Tag 1, ein zweiter Lauf: alle Regeln.** Drei Regeln, drei echte Befunde: Einer sauberen
Liste glaubt man leicht. Jetzt derselbe Master ohne Filter:

```text
Führe figma_lint_design auf dem Node <NODE> (<MASTER-NAME>) noch einmal aus, diesmal
mit allen Regeln, ohne Filter. Gruppiere die Befunde nach Regel: Regel, Schweregrad,
Anzahl und eine Beispielebene mit ihrem Pfad im Master. Ändere nichts in der Datei.
```

Die Liste ist um ein Vielfaches länger, und das meiste ist als „critical“ markiert. Bevor Du
eine Gruppe einordnest, öffne ihre Beispielebene in Figma: Ist die Ebene überhaupt sichtbar?
Welche Gruppe ist echt, welche ein Fehlalarm, und welche ist Ansichtssache? Ein Werkzeug,
das nach Regeln meldet, weiß nicht, welche Ebenen ein Nutzer je sieht. Darum ist ein Befund
etwas zum Einordnen.

**Tag 2, Dein eigenes Set.** Rechne mit `default-name`-Befunden an `Vector`-Ebenen in
Icon-Instanzen. Diese Ebenen gehören zum Icon der Bibliothek, nicht zu Dir: Fehlalarm,
notieren und weitergehen. Eine Liste ohne eigenen Befund beweist kein sauberes Set. Drei
Regeln sind gelaufen. Abstände, Radien und Struktur hat niemand geprüft.
