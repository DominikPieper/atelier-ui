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
- Pagination unter der Tabelle, 5 Zeilen pro Seite.
- Die Suche grenzt nach Name oder E-Mail ein, der Rollen-Select nach Rolle, beide zusammen.
  Ein Filterwechsel geht zurück auf Seite 1. Ohne Treffer zeigt die Tabelle ihren eigenen
  Leerzustand.
- Daten: ein fest einprogrammiertes Array mit 12 Mitgliedern in der Komponente. Kein HTTP.

Beteiligte Komponenten: AtlInput (Suche), AtlSelect (Rollenfilter), AtlButton `primary`
(Invite member), AtlTable, AtlBadge (eins pro Status), AtlPagination.

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

**Fertig, wenn** der Screen läuft und sich verhält, wie der Brief es sagt, Du für jede
zufällig gewählte Prop die Passage in `docs-show` zeigen kannst (oder die Prop entfernt
wurde) und Du drei Zeilen der Liste „nicht geprüft“ des Agenten mit eigenen Augen geprüft
hast.

## Der Start-Prompt

Füge das in Claude Code ein. Es ist nur ein Anfang. Der Agent kann beim ersten Durchgang
alles richtig machen; das ist der schwierigere Fall, denn ein grünes Ergebnis, das niemand
angesehen hat, ist trotzdem nur eine Behauptung. Was Du danach prüfst, ist die Übung.

**Checkpoint:** Bevor eine Datei geschrieben wird, hat der Agent Dir die Komponentenliste
und die `docs-show`-Aufrufe dahinter gezeigt. Hat er das übersprungen, stoppe ihn und lass
ihn bei Regel 1 neu anfangen.

```text
Baue einen Screen "Team directory" nur mit Komponenten aus {{PKG}}.

Bevor Du Code schreibst:
1. Rufe docs-list auf dem {{MCP}} MCP auf, dann docs-show für jede
   Komponente, die Du benutzen willst. Nenne mir zuerst die Liste.
2. Eine Prop, ein Input, ein Slot oder ein Event darf nur benutzt werden, wenn es in der
   Ausgabe von docs-show steht (die Code-Beispiele zählen mit) oder in docs-show-story.
   Ist etwas, das Du willst, nicht dokumentiert, benutze es nicht. Sag es mir.
3. docs-show gibt nur für manche Stories den vollen Code aus und listet die übrigen nur
   mit Namen. Brauchst Du eine davon (Sortable, Empty State), rufe docs-show-story mit
   ihrer ID auf. Rate nicht, was eine Story tut, nur anhand ihres Namens.

Der Screen:
- Eine Überschrift "Team directory".
- Eine Toolbar: ein Suchfeld mit dem Label "Search people", ein Select mit dem Label
  "Role" (All roles, Engineer, Designer, Manager) und ein primärer Button
  "Invite member".
- Eine Tabelle der Mitglieder: Name, Email, Role, Status. Status ist ein Badge:
  active ist success, invited ist warning, suspended ist danger.
- Pagination unter der Tabelle, 5 Zeilen pro Seite.
- Die Suche grenzt nach Name oder E-Mail ein, der Rollen-Select nach Rolle,
  beide zusammen. Ein Filterwechsel geht zurück auf Seite 1. Ohne Treffer
  zeigt die Tabelle ihren eigenen Leerzustand.
- Daten: ein fest einprogrammiertes Array mit 12 Mitgliedern in der Komponente. Kein HTTP.

Regeln:
- Kein selbstgebautes Element, wo die Bibliothek eine Komponente hat. Einfache
  Layout-Elemente (div, h1) sind in Ordnung.
- Styles kommen in {{CSS}} (eine separate .css-Datei), nur
  var(--ui-*)-Tokens für Farbe und Abstand: kein Hex, rgb, hsl und keine benannten
  Farben, keine Pixelwerte für Abstände.
- Speichere den Screen als {{FILE}}. Binde ihn dann ein, sodass die
  App ihn statt der Nx-Willkommensseite zeigt: {{MOUNT}}.

Wenn Du fertig bist, liste jede verwendete Bibliothekskomponente mit der docs-list-ID auf,
aus der sie stammt, und jede Prop mit der docs-show-Zeile, aus der sie stammt.
```

{{LINTNOTE}}

## Der Checks-Prompt

Füge das ein, wenn die Bauzeit endet (16:30 auf der Uhr, egal in welchem Zustand der Screen
ist).

```text
{{CHECKS}}
```

Repariert der Agent die Formatierung von Hand, sag ihm: „`npm run format` ist die Reparatur
für `check:format` und für sonst nichts.“

## Der Belege-Prompt

Füge das nach den Checks ein. Diese Checks fangen weder einen erfundenen Namen noch ein
selbstgebautes Element ab, deshalb kommen als Nächstes die Belege.

```text
Du hast die Komponenten und Props aufgelistet, die Du benutzt hast. Prüfe Dich jetzt
gegen die Docs, nicht gegen das Gedächtnis: Rufe docs-show für jede Komponente noch
einmal auf und gib für jede Prop, jeden Input, jeden Slot und jedes Event in dem Code,
den Du geschrieben hast, eine Zeile aus: den Namen und die Passage in docs-show, in der
er steht, oder NICHT DOKUMENTIERT. Entferne alles, was mit NICHT DOKUMENTIERT markiert
ist, oder sag mir, warum Du es behalten hast.
```

## Was niemand angesehen hat

Füge das nach den Belegen ein. Die Checks sind grün und jede Prop hat eine Quelle; beides
sagt nicht, dass jemand den Screen hat funktionieren sehen.

```text
Liste auf, was Du an diesem Screen nicht geprüft hast: jede Aussage, die Du aus dem
Lesen von Code oder Docs gemacht hast, ohne das Ergebnis auszuführen oder zu sehen.
Eine Zeile pro Punkt, mit dem Hinweis, wie ich es selbst in unter einer Minute prüfen
kann. Führe nichts aus und ändere nichts.
```

Such Dir drei Zeilen aus und prüfe sie selbst: `npm start`, dann benutze den Screen wie ein
Nutzer. Tippe eine Suche ein, die nichts trifft. Kombiniere Suche und Rolle. Geh auf die
letzte Seite, ändere dann einen Filter. Klicke auf „Invite member“. Schreib zu jeder der drei
Zeilen auf, was Du gefunden hast: gilt, gilt nicht, oder der Brief sagt dazu nichts.

## Früh fertig: eine Story für den Screen

Für die Bauzeit, wenn Dein Screen vor 16:30 läuft. Ein Screen ohne Story ist ein Screen, den
morgen nichts mehr prüft.

```text
Schreibe eine Story für den Screen "Team directory", führe dann npm run check:stories
aus und nenne mir den Exit-Code. Ist er nicht 0, lies die Ausgabe, repariere und führe es
erneut aus.
```

Lies dann die Story: Was prüft sie, das Du sonst von Hand durchklicken würdest, und was
überlässt sie weiterhin Dir?

## Wenn der Agent danebenliegt

Fängt er an zu schreiben, ohne `docs-list` aufzurufen:

```text
Stopp. Schreibe noch keinen weiteren Code. Rufe docs-list auf {{MCP}} auf und nenne mir
die IDs der Komponenten, die Du benutzen wirst. Rufe dann docs-show für jede auf und sag
mir zu jeder Prop, die Du benutzen willst, wo sie in der Ausgabe steht.
```

Benutzt er einen Input, den die Docs nicht listen:

```text
Du hast <INPUT> an <ELEMENT> benutzt. Zeig mir die genaue Zeile aus der Ausgabe von
docs-show oder docs-show-story, aus der er stammt. Gibt es keine, entferne ihn und sag
mir, was Du stattdessen tust.
```

Baut er etwas von Hand, das die Bibliothek hat:

```text
<ELEMENT> ist selbstgebaut. Rufe docs-list auf und prüfe, ob die Bibliothek eine
Komponente dafür hat. Wenn ja, ersetze es durch diese Komponente und nutze nur
dokumentierte Props.
```

## Der Zeitrahmen (95 Minuten)

| Minuten | Was passiert                                                                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5       | Der Brief und die vier Regeln, dazu ein Live-`docs-show` auf AtlTable vom Trainer. Die Uhr startet.                                                                         |
| 15      | Bauen. Der Trainer hält sich zurück.                                                                                                                                        |
| 30      | Bauen geht weiter. Der Trainer geht durch den Raum; ein Hinweis ist eine Frage zu einer `docs-show`-Zeile. Früh fertig: den Screen wie ein Nutzer benutzen, dann die Story. |
| 15      | Checks, Belege, dann die Liste „nicht geprüft“; drei ihrer Zeilen von Hand prüfen.                                                                                          |
| 25      | Zwei Freiwillige zeigen ihre Belege und ihre Liste. Welche Zeile hast Du geprüft, und was hast Du gefunden? Woher kamen die Import-Namen?                                   |
| 5       | Abschlussfrage.                                                                                                                                                             |

Die Bauzeit endet um 16:30 auf der Uhr. Wenn Du festhängst, füge die vier Dinge aus
{{STUCK_REF}} ein oder sieh in `rescue.md` nach.
