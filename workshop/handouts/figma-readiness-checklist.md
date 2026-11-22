# Ist Deine Figma-Datei bereit?

Im Raum, einmal: Teil A für den Frame „Settings / Seite“ (Seite Workshop-Templates), den Du gerade gelintet hast. An Deiner eigenen Datei: Hausaufgabe. Hake ab, was zutrifft. Teil A pro Master oder Frame, Teil B einmal pro System.

Die Frage hinter jeder Zeile: Wo müsste ein Agent hier raten? Was nicht zutrifft, schreibst Du mit der Ebene daneben.

Frame / Master / Datei geprüft: ______________________________

## Teil A: ein Frame oder Master

- [ ] Farbe, Abstand und Radius sind an Variablen gebunden
- [ ] Jeder Frame mit Kindern nutzt Auto Layout
- [ ] Variablen haben einen Scope und stehen nicht auf „alle Scopes“
- [ ] Zu jeder Variablen ist ein Code-Name auffindbar
- [ ] Jede Variable sagt in ihrer Beschreibung, wofür sie da ist
- [ ] Keine Standardnamen wie „Frame 12“ im Baum
- [ ] Gleiche Ebenen heißen in allen Varianten gleich
- [ ] Der Master hat eine strukturierte Beschreibung (Zweck, Verwendung, Barrierefreiheit)
- [ ] Varianten und Zustände sind vollständig und auf der richtigen Achse gezeichnet
- [ ] Entscheidungen zum Inhalt sind als Properties festgehalten, oder es steht ein Grund daneben
- [ ] Der Barrierefreiheits-Audit lief, und Du hast gelesen, wie er die Komponente eingeordnet hat

## Teil B: das System

### Vollständig

- [ ] Jede Komponente, die Ihr ausliefert, gibt es als Master
- [ ] Farbe, Abstand und Schrift sind auf beiden Seiten benannte Tokens

### Belastbar

- [ ] Farbpaare erreichen den Kontrast, und Komponenten bestehen eine automatische Prüfung

### Synchron

- [ ] Jeder Master gehört zu einer Code-Komponente mit demselben Namen und denselben Werten
- [ ] Eine gerenderte Komponente sieht aus wie ihr Master
- [ ] Die Dokumentation der Komponenten entsteht aus dem Code

### Erweiterbar

- [ ] Es gibt einen schriftlichen Weg, das System zu ändern
- [ ] Ihr wisst, wer was nutzt, und Rückmeldungen kommen an

### Für Agenten lesbar

- [ ] Jede Komponente hat im Code Zweck, Verwendung und einen Hinweis zur Barrierefreiheit, maschinenlesbar
- [ ] Ein Agent findet genaue Props und Varianten, ohne den Quelltext zu lesen

## Der Prüf-Prompt

Für Teil A, mit figma-console-mcp an Deiner Datei. Starte zuerst den Agenten, wähle dann den Frame aus: Eine Auswahl von vor dem Start sieht er nicht.

> Führe figma_lint_design auf dem Node aus, den ich ausgewählt habe, nur mit den Regeln hardcoded-color, default-name und detached-component. Gib die Befunde als Liste zurück: Ebene, Regel, Meldung. Ändere nichts in der Datei.

Ordne jeden Befund ein: echt oder Fehlalarm. Die drei Regeln sehen rohe Farben, Standardnamen und gelöste Instanzen, sonst nichts auf dieser Seite.

Der Befund, den ich zuerst behebe: ______________________________
