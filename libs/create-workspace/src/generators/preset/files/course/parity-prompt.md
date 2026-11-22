# Parity-Prompt

Tag 1 Block 02 vergleicht die Settings Card mit ihrem Figma-Frame nach Augenmaß. Tag 2
Block 04 führt `figma_check_design_parity` an Deiner eigenen Komponente aus, dafür muss die
Figma Desktop Bridge verbunden sein.

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
3. Gib die Code-Abweichungen an den Agenten zurück:

```text
Die Settings Card weicht in diesen Punkten von ihrem Figma-Frame ab:
<Deine Liste>. Behebe nur diese. Ändere sonst nichts.
```

4. Vergleiche nach der Korrektur noch einmal, Punkt für Punkt. „Alles behoben“ ist der Satz
   des Agenten, der Frame neben der Card ist die Prüfung. Eine Abweichung, die noch da ist,
   geht mit dem genauen Wert aus Figma zurück (welche Seite, wie viele Pixel, welcher
   Token).

Eine Abweichung, die zu keinem Etikett passt (jemand hat sie absichtlich so gewählt), wird
geparkt: „weder Code noch Figma, wir benennen sie an Tag 2“, und wird im Code nicht
„behoben“.

Das Werkzeug, das einen Teil dieses Vergleichs automatisiert, kommt an Tag 2. Es vergleicht,
was man ihm gibt, deshalb bleibt das Auge die erste Prüfung.

## Tag 2 Block 04: Deine eigene Komponente

Die Node-ID kommt aus Deinem Übergabedokument.

```text
Führe figma_check_design_parity auf dem Node <NODE AUS DEM ÜBERGABEDOKUMENT> gegen meine
Komponente <Komponentenname> aus. Ordne jede Abweichung einer von vier Gruppen zu: **Code**
(der Code soll sich ändern), **Figma** (der Master soll sich ändern), **absichtlich so**
(nur wenn der Abschnitt „Bewusste Abweichungen“ des Übergabedokuments sie nennt) oder
**Werkzeug-Artefakt** (das Werkzeug hat zwei Dinge verglichen, die nicht dasselbe sind, es
gibt also nichts zu beheben; sag, was es verglichen hat). Gib zu jeder den Grund in einer
Zeile an. Liste danach auf, was das Werkzeug gar nicht verglichen hat. Behebe noch nichts.
```

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
