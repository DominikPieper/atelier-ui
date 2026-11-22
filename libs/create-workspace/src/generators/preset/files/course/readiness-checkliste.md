# Readiness-Checkliste: Ist der Master bereit für einen Agenten?

Gebraucht in Tag 1 Block 03, nach dem Pink-Test und dem Linter. Du füllst sie einmal aus,
für einen Master der Figma-Datei (zum Beispiel AtlButton), und sie ist die Vorlage für Deine
eigene Datei. Hier ist nichts zu prompten: Die Zeilen prüfst Du, indem Du den Master
ansiehst.

Die Frage hinter jeder Zeile: Wo müsste ein Agent an diesem Master raten?

Der Pink-Test beantwortet die Zeile zu den Bindungen, der Linter die zu den Ebenennamen. Die
übrigen Zeilen siehst Du nur, wenn Du hinsiehst: im Design-Panel, in der Ebenenliste, in der
Beschreibung des Masters und bei den Variantenachsen. Der Linter mit 0 Befunden beantwortet
keine dieser Zeilen.

Master geprüft: ______________________________

## Zeilen für einen Master

Hake ab, was zutrifft. Was nicht zutrifft, schreibst Du mit der Ebene daneben.

- [ ] **Bindungen.** Farbe, Abstand und Radius sind an Variablen gebunden (der Pink-Test
      zeigt es für Farben; Abstände und Radien liest Du im Design-Panel).
- [ ] **Auto Layout.** Jeder Frame mit Kindern nutzt Auto Layout (in der Ebenenliste
      erkennbar am Auto-Layout-Symbol).
- [ ] **Scopes.** Die Variablen haben einen Scope und stehen nicht auf „alle Scopes“
      (Variable öffnen, Scope ansehen).
- [ ] **Code-Name.** Zu jeder Variablen ist ein Code-Name auffindbar (Code-Syntax der
      Variablen).
- [ ] **Zweck.** Jede Variable sagt in ihrer Beschreibung, wofür sie da ist.
- [ ] **Ebenennamen.** Im Baum des Masters stehen keine Standardnamen wie „Frame 12“ oder
      „Rectangle 3“ (der Linter zeigt es, die Ebenenliste bestätigt es).
- [ ] **Gleiche Namen.** Gleiche Ebenen heißen in allen Varianten gleich.
- [ ] **Beschreibung.** Der Master hat eine strukturierte Beschreibung (Zweck, Verwendung,
      Barrierefreiheit), keine leere.
- [ ] **Varianten und Zustände.** Die Varianten und Zustände sind vollständig und auf der
      richtigen Achse gezeichnet: Ein Zustand wie „disabled“ ist ein Wert einer Achse und
      keine eigene Komponente.
- [ ] **Inhalt.** Entscheidungen zum Inhalt (Text, Icon ja oder nein) sind als Properties
      festgehalten, oder es steht ein Grund daneben.
- [ ] **Barrierefreiheit.** Der Barrierefreiheits-Audit lief, und Du hast gelesen, wie er
      die Komponente eingeordnet hat, nicht nur den Score.

Am Ende: Welche Zeile würde einen Agenten am ehesten zum Raten bringen? Die schreibst Du auf
und behebst sie zuerst.

## Für Deine eigene Datei

Zu Hause, einmal pro System, nicht pro Master. Hake ab, was zutrifft.

**Vollständig**

- [ ] Jede Komponente, die Ihr ausliefert, gibt es als Master.
- [ ] Farbe, Abstand und Schrift sind auf beiden Seiten benannte Tokens.

**Belastbar**

- [ ] Farbpaare erreichen den Kontrast, und Komponenten bestehen eine automatische
      Prüfung.

**Synchron**

- [ ] Jeder Master gehört zu einer Code-Komponente mit demselben Namen und denselben Werten.
- [ ] Eine gerenderte Komponente sieht aus wie ihr Master.
- [ ] Die Dokumentation der Komponenten entsteht aus dem Code.

**Erweiterbar**

- [ ] Es gibt einen schriftlichen Weg, das System zu ändern.
- [ ] Ihr wisst, wer was nutzt, und Rückmeldungen kommen an.

**Für Agenten lesbar**

- [ ] Jede Komponente hat im Code Zweck, Verwendung und einen Hinweis zur Barrierefreiheit,
      maschinenlesbar.
- [ ] Ein Agent findet genaue Props und Varianten, ohne den Quelltext zu lesen.
