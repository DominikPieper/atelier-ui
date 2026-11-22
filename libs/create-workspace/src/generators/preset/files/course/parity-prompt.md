# Parity: Vergleich mit Figma

Tag 1 Block 02 vergleicht die Settings Card mit ihrem Figma-Frame nach Augenmaß. Tag 2
Block 04 führt `figma_check_design_parity` an Deiner eigenen Komponente aus, dafür muss die
Figma Desktop Bridge verbunden sein. Beide Male liest Figma nur: In der Datei wird nichts
geändert. Die Prompts schreibst Du selbst; `prompt-rubrik.md` listet die sechs Prüfungen, an
denen Du sie misst.

Meldet ein Aufruf `WebSocket not connected`: Warte eine Minute, lass den Agenten
`figma_get_status` mit `probe` aufrufen und dann noch einmal versuchen, und schließe andere
Claude-Code-Sitzungen mit Figma (Grund: `rescue.md`, Abschnitt „Die Figma-Bridge“).

Die Schrift kann abweichen: Die App lädt Instrument Sans nicht, deshalb erscheinen
Überschriften in einer Ersatzschrift, und Gewichte wirken anders als in Figma. Das ist kein
Fehler der Komponente: Zähle den Schriftunterschied nicht als Abweichung.

## Tag 1 Block 02: die Settings Card, nach Augenmaß

Mach es, wenn Lint und Build grün sind: Der Vergleich mit Figma ist der letzte Schritt, der
Urteilskraft braucht, also verschwende ihn nicht an eine Komponente, die bei Lint oder Build
rot ist. Stell die gerenderte Card neben den Frame „Settings / Card“ in Figma (Node
`936:2954` auf der Seite Workshop-Templates der Originaldatei; in Deinem Duplikat sind die
IDs anders).

1. Schreib jede Abweichung auf, die Du sehen kannst: Abstand, Farbe, Schrift, ein fehlendes
   oder zusätzliches Element, ein Zustand. Fünf Minuten, kein Werkzeug.
2. Ordne jede einzeln ein als **Code** (der Code soll sich ändern) oder **Figma** (der Frame
   soll sich ändern). Bei einer langen Liste: ordne die drei größten ein.
3. Gib die Code-Abweichungen an den Agenten zurück (die Karte unten).
4. Vergleiche nach der Korrektur noch einmal, Punkt für Punkt. „Alles behoben“ ist der Satz
   des Agenten, der Frame neben der Card ist die Prüfung. Eine Abweichung, die noch da ist,
   geht mit dem genauen Wert aus Figma zurück (welche Seite, wie viele Pixel, welcher
   Token).

### Karte: Abweichungen der Settings Card zurückgeben

**Ziel.** Jede Code-Abweichung aus Deiner Liste ist behoben, sonst hat sich nichts
geändert, und Du hast Card und Frame danach noch einmal nebeneinander verglichen.

**Material.** Deine eigene Liste der Abweichungen (Schritt 2), der Frame „Settings / Card“,
die gerenderte Card.

**Rahmen.**

- Scope-Guard: Nur die Punkte Deiner Liste, sonst ändert der Agent nichts.
- Figma-Abweichungen und absichtliche Abweichungen gehören nicht in den Prompt.

**Fertig, wenn** Du jeden Punkt der Liste im Vergleich Card gegen Frame abgehakt hast und
keine Abweichung der Kategorie „Code“ mehr offen ist.

**Kür.**

- Drück Tab und notiere, ob der Frame überhaupt einen Fokuszustand zeigt, mit dem Du den
  Fokusring der Card vergleichen könntest.
- Ordne die drei kleinsten Abweichungen ein, die Du zuerst übergangen hast.
- Zeig die Card in einer schmaleren Breite und schreib auf, welche Abweichung dann zusätzlich
  auftaucht.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Eine Abweichung, die zu keinem Etikett passt (jemand hat sie absichtlich so gewählt), wird
geparkt: „weder Code noch Figma, wir benennen sie an Tag 2“, und wird im Code nicht
„behoben“.

Das Werkzeug, das einen Teil dieses Vergleichs automatisiert, kommt an Tag 2. Es vergleicht,
was man ihm gibt, deshalb bleibt das Auge die erste Prüfung.

## Tag 2 Block 04: Deine eigene Komponente

Die Node-ID kommt aus Deinem Übergabedokument.

### Karte: das Parity-Werkzeug an Deiner Komponente

**Ziel.** Ein Parity-Report, dessen Abweichungen Du jeweils einer von vier Gruppen
zugeordnet hast, mit einer Liste, was das Werkzeug gar nicht verglichen hat. Behoben ist noch
nichts.

**Material.**

- `figma_check_design_parity`, die Node-ID aus Deinem Übergabedokument und Deine Komponente.
- Der Abschnitt „Bewusste Abweichungen“ des Übergabedokuments.

**Rahmen.**

- Vier Gruppen: **Code** (der Code soll sich ändern), **Figma** (der Master soll sich ändern), **absichtlich so** (nur wenn der Abschnitt „Bewusste Abweichungen“ sie nennt) oder **Werkzeug-Artefakt** (das Werkzeug hat zwei Dinge verglichen, die nicht dasselbe sind).
- Scope-Guard: Behoben wird noch nichts.

**Fertig, wenn** jede Zeile eine Gruppe und einen Grund hat, Du zwei Zeilen „Werkzeug-Artefakt“
selbst geprüft hast und Du zu jeder Zeile sagen kannst, wem sie gehört.

**Kür.**

- Prüfe alle Zeilen „Werkzeug-Artefakt“ statt zwei und notiere, ob eine davon eine echte
  Abweichung versteckt hat.
- Schreib für jede Zeile „absichtlich so“ auf, ob sie wirklich im Abschnitt „Bewusste
  Abweichungen“ steht, und trage fehlende nach.
- Gib die Zeilen der Gruppe „Code“ mit einer Änderung pro Runde an den Agenten zurück und
  lass den Report erneut laufen.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Rechne mit einer niedrigen Punktzahl und einer kurzen echten Liste. Das Werkzeug markiert
jeden Befund als Code-Änderung, das Einordnen ist die Arbeit. Typische Artefakte: ein
aufgelöster Hex-Wert auf der Figma-Seite gegen einen `var(--ui-*)`-String auf der
Code-Seite, die Bounding Box des ganzen Component Sets gegen ein einzelnes Element, eine
Property, die auf beiden Seiten als fehlend gemeldet wird, weil der Name in Figma ein
`#id`-Suffix trägt. Prüfe zwei der Zeilen „Werkzeug-Artefakt“ selbst, bevor Du ihnen
glaubst: Auch ein Artefakt-Etikett kann eine echte Abweichung verschwinden lassen.

Ein ruhiger Report ist keine saubere Komponente: Was der Aufruf nicht vergleicht, meldet er
nicht. Danach gehört Dir jede Zeile: Code (gib sie an Claude zurück), Figma (eine Notiz für
die Designerin oder den Designer), absichtlich so (sie muss im Abschnitt „Bewusste Abweichungen“
des Übergabedokuments stehen) oder Werkzeug-Artefakt (nichts zu beheben, und Du kannst
sagen, was womit verglichen wurde).

Ohne die Bridge gibt es keinen Parity-Aufruf: Vergleiche nach Augenmaß, wie an Tag 1.
