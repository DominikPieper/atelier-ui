# Tag 1, Block 05: ein Screen aus Storybook, gegen die Uhr

Gebraucht in Tag 1, Block 05. Du baust einen Screen „Team directory“ aus Komponenten, die es
in `{{PKG}}` schon gibt. Über diese Komponenten weißt Du nur, was der MCP-Server `{{MCP}}`
Dir sagt. Schritte gibt Dir niemand: ein Brief, vier Regeln, eine Uhr und Abschluss-Checks.
Rechne damit, dass der Screen früh fertig aussieht. In der zweiten Hälfte der Übung findest
Du heraus, wogegen „fertig“ nie geprüft wurde.

## Der Brief

Ein Screen „Team directory“:

- Eine Überschrift "Team directory".
- Eine Toolbar: ein Suchfeld mit dem Label "Search people", ein Select mit dem Label "Role"
  (All roles, Engineer, Designer, Manager) und ein primärer Button "Invite member".
- Eine Tabelle der Mitglieder: Name, Email, Role, Status. Status ist ein Badge: active ist
  success, invited ist warning, suspended ist danger.
- Die Spalte Name lässt sich sortieren, aufsteigend und absteigend, mit einem Klick auf den
  Spaltenkopf.
- Pagination unter der Tabelle, 5 Zeilen pro Seite.
- Jede Zeile hat die Aktion „Rolle ändern“ in einem Menü (Engineer, Designer, Manager). Die
  neue Rolle steht sofort in der Zeile und zählt für den Rollenfilter.
- Ein Klick auf eine Zeile öffnet eine Detailansicht als Drawer mit Name, E-Mail, Rolle und
  Status. Schließt Du den Drawer, liegt der Fokus wieder auf der Zeile.
- Jede Zeile hat eine Checkbox. Der Button „Entfernen“ löscht die gewählten Mitglieder aus
  der Liste und ist deaktiviert, solange nichts gewählt ist.
- Die Suche grenzt nach Name oder E-Mail ein, der Rollen-Select nach Rolle, beide zusammen.
  Ein Filterwechsel geht zurück auf Seite 1. Ohne Treffer zeigt die Tabelle ihren eigenen
  Leerzustand, und der bietet die Aktion „Filter zurücksetzen“.
- Daten: ein fest einprogrammiertes Array mit 12 Mitgliedern in der Komponente. Kein HTTP.

Beteiligte Komponenten: AtlInput (Suche), AtlSelect (Rollenfilter), AtlButton `primary`
(Invite member), AtlTable mit sortierbarem Spaltenkopf, AtlBadge (eins pro Status),
AtlPagination, AtlMenu (Rolle ändern), AtlDrawer (Detailansicht), AtlCheckbox (Auswahl).

## Die vier Regeln

1. **Erst ansehen, dann schreiben.** Der Agent ruft `docs-list` auf, dann `docs-show` für
   jede Komponente, bevor die erste Code-Zeile steht.
2. **Jede Prop hat eine Quelle.** Eine Prop, ein Input, ein Slot oder ein Event in Deinem
   Code muss in der Ausgabe von `docs-show` stehen (die Code-Beispiele zählen mit) oder in
   `docs-show-story`. Nicht dokumentiert heißt nicht benutzt, und der Agent sagt das. Die
   eine Ausnahme: Die Namen der Import-Klassen und der Paketname stammen aus den
   Typ-Exports des installierten Pakets, und die Belege sagen das.
3. **Kein selbstgebauter Zwilling.** Wo die Bibliothek eine Komponente hat, benutzt Du sie.
   Ein `div` mit Rahmen ist keine Card, ein von Hand gestyltes `span` ist kein Badge.
4. **Keine rohen Farben.** Jede Farbe und jeder Abstand ist ein `var(--ui-*)`-Token, in einer
   einfachen `.css`-Datei. Das ist eine Regel, die Du einhältst, kein Check, der sie
   erzwingt: Die Checks unten fangen nur einen Teil davon ab.

## Die Karten

Den Prompt schreibst Du selbst, in Deinen Worten. Die Karten sagen Dir, was am Ende da sein
muss, womit der Agent arbeitet und was Dein Prompt an Regeln tragen muss. `prompt-rubrik.md`
listet die sechs Prüfungen, an denen Du ihn misst. Der Agent kann beim ersten Durchgang alles
richtig machen; das ist der schwierigere Fall, denn ein grünes Ergebnis, das niemand
angesehen hat, ist trotzdem nur eine Behauptung. Was Du danach prüfst, ist die Übung.

**Checkpoint:** Bevor eine Datei geschrieben wird, hat der Agent Dir die Komponentenliste
und die `docs-show`-Aufrufe dahinter gezeigt. Hat er das übersprungen, stoppe ihn und lass
ihn bei Regel 1 neu anfangen.

### Karte: den Screen bauen

**Ziel.** Der Screen „Team directory“ aus dem Brief läuft in der App, ersetzt die
Settings-Seite (oder die Willkommensseite, falls Du Block 02 nicht gemacht hast) und verhält sich, wie der Brief es sagt:
Suche, Filter, Sortierung, Seiten, Rolle ändern, Drawer, Mehrfachauswahl und Leerzustand.

**Material.**

- Der Brief und die vier Regeln oben.
- Der MCP-Server `{{MCP}}` mit `docs-list`, `docs-show` und `docs-show-story`. `docs-show`
  gibt nur für manche Stories den vollen Code aus und listet die übrigen nur mit Namen
  (Sortable, Selectable, Empty State): Wer eine davon braucht, ruft `docs-show-story` mit ihrer ID auf.
- Die Zieldatei {{FILE}}, die Style-Datei {{CSS}}.
- Einbinden heißt: {{MOUNT}}.

**Rahmen.**

- Nur Komponenten aus `{{PKG}}`, und die vier Regeln des Briefs gelten.
- Styles nur als `var(--ui-*)`-Tokens in der separaten `.css`-Datei.

**Fertig, wenn** der Screen läuft und sich verhält, wie der Brief es sagt, Du für jede
zufällig gewählte Prop die Passage in `docs-show` zeigen kannst (oder die Prop entfernt
wurde) und Du drei Zeilen der Liste „nicht geprüft“ des Agenten mit eigenen Augen geprüft
hast.

**Kür.**

- Ergänze eine Spalte oder einen Filter, den der Brief nicht nennt, aber nur mit
  dokumentierten Props (zum Beispiel einen Status-Filter), und prüfe, dass der Leerzustand
  weiter greift.
- Schreib zum Brief eine Zeile „Bewusst draußen“ (zum Beispiel Einladen speichern oder
  Rollen dauerhaft ändern) und prüfe, dass der Agent sie nicht still gebaut hat.
- Teste die Tastatur: Tab durch Toolbar, Menü, Tabelle und Pagination, öffne und schließe den
  Drawer, und notiere, wo der Fokus hängt.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

{{LINTNOTE}}

### Karte: die Checks laufen lassen

Beginne, wenn die Bauzeit endet (16:30 auf der Uhr, egal in welchem Zustand der Screen ist).

**Ziel.** Alle Checks laufen, jeder Exit-Code ist bekannt, und jeder rote ist behoben oder
benannt.

**Material.** {{CHECKS}}.

**Rahmen.**

- Ein Check gilt erst, wenn Du seinen Exit-Code gesehen hast, nicht das Wort „grün“.

**Fertig, wenn** jeder Check mit Exit-Code 0 endet und Du die Liste der Änderungen gelesen
hast.

**Kür.**

- Führe einen der Checks selbst im Terminal aus und vergleiche den Exit-Code mit dem
  Bericht.
- Frag den Agenten, was diese Checks nicht abfangen, und prüfe seine Antwort an einem
  Beispiel.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

### Karte: die Belege

Beginne nach den Checks. Sie fangen weder einen erfundenen Namen noch ein selbstgebautes
Element ab, deshalb kommen als Nächstes die Belege.

**Ziel.** Zu jeder Prop, jedem Input, jedem Slot und jedem Event im Code steht die Passage in
`docs-show`, aus der sie stammt, oder sie ist entfernt.

**Material.** Der geschriebene Screen, `docs-show` für jede benutzte Komponente über
`{{MCP}}`.

**Rahmen.**

- Import-Namen und Paketname stammen aus den Typ-Exports des installierten Pakets, nicht aus `docs-show`. Das ist die einzige Ausnahme.

**Fertig, wenn** keine Zeile NICHT DOKUMENTIERT trägt, die nicht begründet ist, und Du zwei
Passagen selbst in der Ausgabe von `docs-show` gefunden hast.

**Kür.**

- Such im Code eine Prop, die der Agent nicht gelistet hat, und prüfe, ob sie dokumentiert
  ist.
- Prüfe auch die Import-Namen und den Paketnamen: Sie stammen aus den Typ-Exports des
  installierten Pakets, nicht aus `docs-show`. Steht das in den Belegen?

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

### Karte: was niemand angesehen hat

Beginne nach den Belegen. Die Checks sind grün und jede Prop hat eine Quelle; beides sagt
nicht, dass jemand den Screen hat funktionieren sehen.

**Ziel.** Eine Liste „nicht geprüft“ mit einer Zeile pro Punkt, dazu drei Zeilen, die Du
selbst geprüft hast, mit dem Ergebnis: gilt, gilt nicht, oder der Brief sagt dazu nichts.

**Material.** Der Screen, `npm start`, die Liste des Agenten.

**Rahmen.**

- Scope-Guard: Der Agent führt nichts aus und ändert nichts.

**Fertig, wenn** Du drei Zeilen selbst geprüft und zu jeder aufgeschrieben hast, was Du
gefunden hast.

**Kür.**

- Prüfe fünf statt drei Zeilen.
- Schreib die Zeile auf, die der Agent nicht genannt hat und die Du beim Benutzen gefunden
  hast.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Such Dir drei Zeilen aus und prüfe sie selbst: `npm start`, dann benutze den Screen wie ein
Nutzer. Tippe eine Suche ein, die nichts trifft. Kombiniere Suche und Rolle. Geh auf die
letzte Seite, ändere dann einen Filter. Sortiere und blättere weiter. Ändere eine Rolle,
während der Rollenfilter gesetzt ist. Öffne den Drawer per Tastatur und schließ ihn wieder.
Wähle Zeilen auf Seite 1, wechsle die Seite und drück „Entfernen“. Klicke auf „Invite member“.

### Karte: früh fertig, eine Story für den Screen

Für die Bauzeit, wenn Dein Screen vor 16:30 läuft. Ein Screen ohne Story ist ein Screen, den
morgen nichts mehr prüft.

**Ziel.** Eine Story für den Screen „Team directory“, die grün läuft.

**Material.** Der Screen, `npm run check:stories`, das Muster der Stories aus Block 04.

**Rahmen.**

- Die `play`-Funktion prüft Verhalten (Filter, Sortierung, Pagination, Leerzustand), das Du sonst von Hand durchklickst.

**Fertig, wenn** `npm run check:stories` mit 0 endet und Du in der Story zeigen kannst, was
sie prüft und was sie Dir weiter überlässt.

**Kür.**

- Schreib eine zweite Story für den Leerzustand.
- Mach die Story absichtlich rot (falsche Erwartung) und lies den Fehler, bevor Du
  reparierst.
- Notiere eine Verhaltenszeile aus dem Brief, die die Story noch nicht beweist.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Lies dann die Story: Was prüft sie, das Du sonst von Hand durchklicken würdest, und was
überlässt sie weiterhin Dir?

## Wenn der Agent danebenliegt

Drei typische Fälle und was Du tust. Formuliere jeweils einen kurzen eigenen Prompt, ein
Befund pro Runde:

- **Er schreibt, ohne `docs-list` aufzurufen.** Stopp. Er soll `docs-list` auf `{{MCP}}`
  aufrufen, Dir die IDs der Komponenten nennen, dann `docs-show` für jede aufrufen und
  Dir zu jeder Prop sagen, wo sie in der Ausgabe steht.
- **Er benutzt einen Input, den die Docs nicht listen.** Er soll Dir die genaue Zeile aus
  `docs-show` oder `docs-show-story` zeigen. Gibt es keine, entfernt er den Input und sagt
  Dir, was er stattdessen tut.
- **Er baut etwas von Hand, was die Bibliothek hat.** Er soll mit `docs-list` prüfen, ob es
  dafür eine Komponente gibt. Wenn ja, ersetzt er es durch diese und nutzt nur dokumentierte
  Props.

## Der Zeitrahmen (95 Minuten)

| Minuten | Was passiert                                                                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5       | Der Brief und die vier Regeln, dazu ein Live-`docs-show` auf AtlTable vom Trainer. Die Uhr startet.                                                                         |
| 15      | Bauen. Der Trainer hält sich zurück.                                                                                                                                        |
| 30      | Bauen geht weiter. Der Trainer geht durch den Raum; ein Hinweis ist eine Frage zu einer `docs-show`-Zeile. Früh fertig: den Screen wie ein Nutzer benutzen, dann die Story. |
| 15      | Checks, Belege, dann die Liste „nicht geprüft“; drei ihrer Zeilen von Hand prüfen.                                                                                          |
| 25      | Zwei Freiwillige zeigen ihre Belege und ihre Liste. Welche Zeile hast Du geprüft, und was hast Du gefunden? Woher kamen die Import-Namen?                                   |
| 5       | Abschlussfrage.                                                                                                                                                             |

Die Bauzeit endet um 16:30 auf der Uhr. Wenn Du festhängst, melde die fünf Dinge aus
{{STUCK_REF}} oder sieh in `rescue.md` nach.
