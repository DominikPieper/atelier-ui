# Prompts Tag 2

Verwendet in Tag 2, Block 00 (die Definition-of-Done-Übung), Block 01 (baue Dein Component Set
über den Agenten, mach es maschinenlesbar, dann die API-Regeln), Block 02 (Generierung mit
Plan-Modus, `docs-show` an Deiner eigenen Komponente, dann Beides ansehen), Block 03 (was rot
war, stimmt das Übergabedokument noch, Rot mit Absicht) und Block 04 (Barrierefreiheit und der
Dark-Check). Der Parity-Prompt aus Block 04 steht in `parity-prompt.md`. Ab Block 02 ist Dein
Übergabedokument die Eingabe für alle diese Prompts (ein Beispiel steht in
`handoff-example.md`).

## Block 00: die Definition-of-Done-Übung (5 Minuten)

Der Workspace enthält eine Regel, die der Agent in jeder Session liest: `CLAUDE.md`, Abschnitt
„Definition of Done“. Der Agent führt aus, was die Liste nennt. Ein Check, der nicht in der
Liste steht, ist ein Check, den niemand verlangt hat. Der Trainer zeigt das einmal am
Beamer: eine Zeile löschen, `/clear`, noch einmal fragen, und der Check ist weg.

Dein Teil:

1. Frage: „Welche Befehle nennt die Definition of Done dieses Workspace? Liste sie nur
   auf.“ Die Antwort nennt sechs.
2. Schreib die eine Zeile auf, die Dein eigenes Team dieser Liste hinzufügen würde, in
   derselben Form: der Befehl, ein Gedankenstrich, was er beweist. Denk an das, was Eure
   Reviews immer wieder von Hand finden.
3. Vergleiche mit Deinem Nachbarn: Nennt die Zeile einen Befehl, der bei einem Fehler mit
   einem Exit-Code ungleich 0 endet, oder einen Wunsch („der Code ist sauber“)? Nur der
   Befehl ist eine Regel, die ein Agent ausführen kann.

## Block 01: baue Dein Component Set über den Agenten

Nichts in diesem Block wird von Hand in Figma gezeichnet oder bearbeitet. Der Agent baut und
ändert das Set. Du wählst den Brief, siehst hin, vergleichst mit dem Brief und entscheidest.

```text
Lies course/briefs/<Dein Brief>.md und course/briefs/README.md. Kopiere in meiner
Figma-Datei auf der Seite Workshop-Templates den Starter-Frame, den der Brief
nennt, und baue aus der Kopie mein Component Set, im Umfang des Briefs für den
90-Minuten-Block. Nutze den Skill figma-workspace-architect. Binde jede Füllung,
jeden Rand, jeden Radius, jedes Padding und jeden Abstand an eine Variable aus
Library Tokens, nutze Auto Layout in jedem Frame mit Kindern, füge die Component
Properties hinzu, die der Umfang nennt, und schreibe die Beschreibung des Masters:
was nicht im Umfang ist und die Barrierefreiheitspflichten (volle Komponente).
Lege es in eine eigene Section neben den Startern und fasse den Starter selbst
nicht an. Prüfe es danach im Dark Mode, mach einen Screenshot, schalte zurück auf
Light und nenne mir die Node-ID des Component Sets und alles, was Du nicht binden
konntest.
```

Wähle dann das Set aus, das der Agent gebaut hat: Jeder weitere Prompt arbeitet auf Deiner
Auswahl. Eine Auswahl, die vor dem Start der Session getroffen wurde, sieht der Agent nicht.
Meldet er, dass nichts ausgewählt ist, klick das Set noch einmal an.

Sieh hin, bevor Du etwas verlangst. Leg den Brief neben den Screenshot: Ist jede Variante
und jeder Zustand da, den die Umfangszeile nennt? Wirkt das Set neben dem Starter wie ein
Mitglied derselben Bibliothek? Was hättest Du anders gebaut? Jede gewünschte Änderung ist
ein Prompt:

```text
Im Component Set, das ich in Figma ausgewählt habe: <was Du siehst> soll <was Du
willst> sein. Ändere nur das, lass jeden Wert an eine Variable gebunden und zeig
mir einen Screenshot.
```

Eine Änderung pro Prompt, damit der Screenshot zeigt, was genau diese Änderung bewirkt hat.
Zwei oder drei Runden sind normal. Das Set gehört Dir, wenn Du sagen kannst, warum jeder Teil
so ist, wie er ist.

## Block 01: mach Dein Component Set maschinenlesbar

Das Set sieht richtig aus. Ist es noch gebunden? Bei einer Änderung auf Zuruf rutscht ein
Rohwert hinein. Mit ausgewähltem Set:

```text
Lies course/briefs/<Dein Brief>.md und course/briefs/README.md. Mein Component
Set ist der Node, den ich in Figma ausgewählt habe. Zeichne es nicht neu und
ändere nicht, wie es aussieht. Nutze den Skill figma-workspace-architect und
mach es maschinenlesbar: Binde jede Füllung, jeden Rand, jeden Radius, jedes
Padding und jeden Abstand an eine Variable aus Library Tokens, setze Auto Layout
auf jeden Frame mit Kindern, füge die Component Properties hinzu, die der Umfang
des Briefs nennt, und schreibe die Beschreibung des Masters: was nicht im Umfang
ist und die Barrierefreiheitspflichten (volle Komponente). Prüfe es danach im
Dark Mode, mach einen Screenshot, schalte zurück auf Light und nenne mir alles,
was Du geändert hast, und alles, was Du nicht binden konntest.
```

Lies beide Listen, bevor Du weitermachst. Eine kurze Liste „geändert“ ist ein Ergebnis, kein
verschwendeter Lauf: Der Bau hat gehalten. Ein Wert ohne Variable (ein Abstand von 7, wo die
Skala 4 und 8 kennt) entscheidest Du: Sag dem Agenten, er soll ihn auf die Skala legen, oder
behalte ihn und schreib ihn ins Übergabedokument. Vergleiche dann den Screenshot mit dem
vorherigen: Ist es noch dasselbe Set?

Als Nächstes läuft der Figma-Linter über Dein eigenes Set: Der Prompt steht in
`figma-linter-prompt.md`.

## Block 01: die API-Regeln, bevor Du einen Prop-Namen schreibst

Das Übergabedokument legt die Namen und Werte fest, die der Code tragen wird. Deshalb werden
sie zuerst geprüft. Vier Regeln für eine API, die ein Agent ohne Raten benutzen kann:

1. **Vorhersagbare Namen.** Dieselbe Sache heißt wie im Rest der Bibliothek (`variant`,
   `size`, `disabled`), nicht anders.
2. **Literale Unions.** Die erlaubten Werte sind eine kurze Liste (`'success' | 'danger'`),
   kein freier Text und keine Zahl, die etwas bedeutet.
3. **Komposition statt Konfiguration.** Ein Bereich, der alles aufnehmen kann, ist ein Slot,
   kein wachsender Haufen Boolean-Properties.
4. **Keine versteckten Defaults.** Jeder Default ist in der API sichtbar. Nichts hängt von
   einem Wert ab, der nirgends aufgeschrieben ist.

```text
Liste jede Property des Component Sets auf, das ich in Figma ausgewählt habe,
mit ihrem Namen und ihren Werten. Prüfe die Liste gegen diese vier Regeln:
vorhersagbare Namen (wie im Rest der Bibliothek), literale Unions (die erlaubten
Werte als Liste, nicht als freier Text), Komposition statt Konfiguration, keine
versteckten Defaults (jeder Default ist in der API sichtbar). Sag zu jeder Regel,
was Du umbenennen oder ändern würdest und warum. Wo mein Brief
(course/briefs/<Dein Brief>.md) einen Namen vorgibt, der eine Regel bricht, sag
es. Benenne noch nichts um.
```

Entscheide jede Zeile selbst: Lass den Agenten jetzt umbenennen, oder behalte den Namen aus
dem Brief und schreib den Grund in den Abschnitt „Bewusste Abweichungen“ Deines Übergabedokuments.

```text
Benenne im Component Set, das ich in Figma ausgewählt habe, <Property oder Wert>
in <neuer Name> um und zieh jede Erwähnung des alten Namens in der Beschreibung
des Sets nach. Ändere nichts sonst, liste danach die Properties mit ihren Werten
noch einmal auf.
```

Eine Umbenennung ändert den Namen, nicht was das Set zeigt: Eine Textebene oder ein Token, das
das alte Wort trägt, behält es. Ob das noch stimmt, entscheidest Du.

Erwarte wenige Umbenennungen: Der Brief legt die meisten Namen fest. Gefunden wird die Stelle,
an der ein vorgegebener Name eine Regel bricht. Das Ergebnis ist die Property-Liste, die Dein
Übergabedokument übernimmt.

## Block 02: die Komponente generieren

**Zuerst Plan-Modus.** Drück vor dem Einfügen Shift+Tab, bis die Statuszeile den Plan-Modus
zeigt, füge den Prompt ein und lies den Plan: Jede Prop darin muss eine Prop Deines
Übergabedokuments sein. Erst dann lass bauen. Eine erfundene Prop ist als Planzeile billiger
zu finden als rote Story.

**Beantworte die Fragen des Plans, bevor Du freigibst.** Ein Plan endet meist mit Ergänzungen,
die das Übergabedokument nicht kennt (ein zusätzlicher Output, eine andere Rolle, ein Default)
und mit ein oder zwei Fragen. Ein schlichtes „bau es“ gibt alles frei. Sag zu jedem Punkt ja
oder nein, in Worten.

Der Prompt ist mit Absicht kurz. Die festen Regeln, die für jede Komponente gelten (Tokens,
Komposition nach Bereichen, ein Name an jedem reinen Icon-Control, Status ohne Farbe sichtbar,
`tags: ['autodocs']`), stehen mit ihren Gründen im Skill `atelier-component` des Workspace.
Der Prompt trägt nur, was für diese Aufgabe gilt.

```text
Generiere die {{FRAMEWORK}}-Implementierung von <Komponentenname> mit Test und
Stories, aus meinem Übergabedokument <Pfad oder eingefügter Text>, nicht allein
aus dem Figma-Bild. Schreibe keine andere Datei, außer dem Designbild, das der
Skill atelier-component verlangt.

Was im Abschnitt „Bewusste Abweichungen“ des Übergabedokuments steht, sind vorgegebene Randbedingungen,
keine Fehler, die Du korrigieren sollst: Wo der Code absichtlich vom Design
abweicht, baue ihn so.

Jeder Prop-Name entspricht eins zu eins den Abschnitten des Übergabedokuments:
Füge keine Prop hinzu und benenne keine um. Folge dem Skill atelier-component
für Tokens, Komposition, Barrierefreiheit und Stories. Wenn eine Anforderung
keine natürliche Entsprechung in dem hat, was Du generierst, frag nach, statt
einen Umweg zu erfinden. Führe zum Schluss die Checks der Definition of Done aus
CLAUDE.md aus (die, die /verify ausführt) und melde jeden Exit-Code.
```

## Block 02, nach der Generierung: `docs-show` an Deiner eigenen Komponente (10 Minuten)

Über den lokalen Storybook-MCP (`storybook-local`), sobald Deine Komponente und ihre Stories
rendern. Es geht darum: Was müsste ein Agent raten, der Deine Komponente benutzt? Die
Beschreibungen sind wahrscheinlich schon da, weil der Agent sie beim Generieren geschrieben
hat. Darum ist die Frage offen gestellt.

```text
Rufe docs-list auf storybook-local auf, dann docs-show für meine Komponente
<Komponentenname>. Lies die Ausgabe als Agent, der diese Komponente nie gesehen
hat und nur diesen Text kennt. Liste alles auf, was er raten müsste oder falsch
machen würde: eine fehlende Beschreibung, ein Code-Beispiel, das so nicht
funktionieren würde, einen Wert, dessen Wirkung nicht beschrieben ist, Verhalten,
das nirgends dokumentiert ist. Ändere noch nichts.
```

Lies die Liste, bevor Du sie zurückgibst. Welche Zeilen sind eine Lücke in der Dokumentation,
welche eine Lücke in der Komponente? Schließe dann die erste Sorte:

```text
Schließe die Dokumentationslücken dort, wo sie entstehen: JSDoc für eine
fehlende oder falsche Beschreibung, die Story für ein Beispiel, das so nicht
funktionieren würde. Ändere nicht das Verhalten der Komponente. Rufe docs-show
noch einmal auf und zeig mir, was sich geändert hat.
```

Ohne den MCP geht dieselbe Abfrage über die CLI:

```text
npx storybook tools --config-dir workshop-{{FRAMEWORK_LC}}/.storybook --json docs show --input '{"id":"<id>"}'
```

## Block 02: Beides ansehen (10 Minuten, kein Prompt)

Die Checks sind grün. Angesehen hat noch niemand etwas. Stell Storybook neben Dein Figma
Component Set und geh jede Variante und jeden Zustand durch, die Du gebaut hast, einzeln.
Das ist mit Absicht Handarbeit: Es ist der einzige Schritt, der findet, was ein grüner Check
nicht misst.

1. Dieselbe Variante, derselbe Zustand, nebeneinander: Abstände, Radius, Farbe, Textgröße, Icon.
2. Drück einmal Tab. Ist der Fokusring da, und hält er Abstand zum Inhalt?
3. Vergleiche die Breite. Hat die Komponente die Größe, die das Design vorgibt, oder nimmt
   sie die Breite dessen, was sie umgibt?
4. Wenn Dein Design einen Schatten oder einen dünnen Rand hat: Siehst Du ihn in der Story?

Schreib jede Abweichung als Liste auf, eine Zeile pro Abweichung: wo, was das Design zeigt,
was die Story zeigt. Nicht einordnen und nicht beheben: Block 04 ordnet die Liste ein (eine
gewollte Abweichung, ein Fehler im Code oder eine Lücke im Design). Eine leere Liste nach zwei
Minuten heißt, dass Du eine Variante angesehen hast.

Committe dann (`git add -A && git commit -m "day 2 block 02: green"`) und **lass diese Claude
Code Session über die Mittagspause offen**: Block 03 startet in ihr.

## Block 03: grün heißt noch nicht richtig

Block 02 endete höchstwahrscheinlich grün. Das sagt, dass die Checks am Ende bestanden haben,
nicht wie es dazu kam. Drei Prompts, in dieser Reihenfolge. Dein Commit vom Ende von Block 02
ist der Stand, auf den Du zurückgehst. Wenn `git status` noch Änderungen zeigt, committe
jetzt: `git add -A && git commit -m "day 2 block 02: green"`.

### Was unterwegs rot war

In derselben Session, die die Komponente generiert hat (nach `/clear` muss der Agent die
Spuren in den Dateien suchen und findet weniger). Wenn die Session geschlossen wurde, starte
Claude Code im Workspace-Ordner mit `claude --continue`: Das setzt die letzte Session dort
fort.

```text
Sieh auf diese Session zurück. Führe nichts aus und ändere nichts. Liste jeden
Check auf, der beim Bau von <Komponentenname> irgendwann rot war (Format,
stylelint, Lint, Build, Unit-Test, Story): den ersten Fehler, was Du geändert
hast, damit er grün wurde, und ob diese Änderung die Ursache behoben oder den
Check umgangen hat. Umgehen heißt: ein Disable-Kommentar, eine geänderte Regel
oder Konfiguration, ein umbenanntes Ding, eine gelockerte oder entfernte
Assertion, ein übersprungener Test. Markiere jede Zeile mit „behoben“ oder
„umgangen“. Wenn Du die Session nicht mehr hast, sag das und such stattdessen in
den Dateien nach den Spuren.
```

Die Liste ist der Bericht des Agenten über sich selbst. Halte zwei Befehle dagegen, in einem
zweiten Terminal im Workspace-Ordner:

```shell
git show --stat HEAD
git grep -nE "eslint-disable|stylelint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck|\.skip\(|\.only\(|(^|[^e])xit\(|xdescribe\(" -- workshop-{{FRAMEWORK_LC}}/src
```

Der erste zeigt jede Datei, die der Commit aus Block 02 angefasst hat (wenn Du gerade eben ein
zweites Mal committet hast, liegt dieser Commit einen zurück: `git show --stat HEAD~1`). Eine
Datei außerhalb von `workshop-{{FRAMEWORK_LC}}/src` und `course/`, vor allem eine
Konfiguration (`eslint.config.mjs`, `stylelint.config.mjs`, eine `tsconfig`, eine
`project.json`), ist eine geänderte Regel. Der zweite findet Disable-Kommentare und
übersprungene Tests. Steht jeder Treffer auf der Liste des Agenten? Keiner der beiden Befehle
findet einen umbenannten Selektor oder eine entfernte Assertion: Dafür hast Du nur die Liste
und Dein eigenes Lesen des Diffs.

Lies zuerst die Zeilen „umgangen“, prüfe dann die Zeilen „behoben“: Hättest Du sie genauso
markiert? Entscheide für jede Zeile, wo die Korrektur hingehört. Ein Disable-Kommentar
schaltet eine Zeile stumm. Eine Regel, die für diesen Workspace falsch ist, wird in ihrer
Konfiguration geändert, und das ist eine Entscheidung für einen Menschen, nicht für den
Agenten. Eine entfernte Assertion ist ein Verhalten, das niemand mehr prüft: Bring sie
zurück oder sag, warum sie weg ist. Überarbeite dann einmal: entweder den Prompt oder eine
Zeile in `CLAUDE.md`, die den Umweg verhindert hätte, und sag warum.

### Stimmt das Übergabedokument noch?

Der Agent hat beim Bauen Dinge gelernt, die das Dokument nicht kannte. Zwei Prompts und eine
Entscheidung von Dir dazwischen. Zuerst die Liste, sonst nichts:

```text
Lies mein Übergabedokument <Pfad> neben dem Code, den Du für <Komponentenname>
findest. Ändere keinen Code und ändere das Dokument noch nicht. Liste jede Zeile
des Dokuments auf, die für das Gebaute nicht mehr stimmt: ein Token, das nicht
existiert, eine Annahme über eine Bibliothekskomponente, die sich als falsch
herausstellte, eine Variante oder ein Zustand, die hinzugekommen oder entfallen
sind. Nummeriere die Liste. Sag zu jeder Zeile, was der Code stattdessen tut und
ob Du das Dokument oder den Code korrigieren würdest.
```

Entscheide jede Nummer selbst: Ist das Dokument falsch oder der Code? Ein Dokument, das an
alles angepasst wird, was gebaut wurde, ist keine Spezifikation mehr. Wo der Code falsch ist,
bleibt die Zeile stehen und die Korrektur ist eine Reparatur am Code, eine Änderung nach der
anderen. Wo das Dokument falsch ist, gib nur diese Nummern zurück:

```text
Korrigiere das Übergabedokument für die Nummern <Nummern> Deiner Liste, und nur
für diese: Beschreibe, was gebaut wurde, und markiere jede korrigierte Zeile mit
„(nach der Generierung korrigiert)“. Ändere keinen Code.
```

### Rot mit Absicht

Jetzt die Schleife, nach der der Block benannt ist, an einer Änderung, die Du wählst. Nimm
eine Variante oder einen Zustand aus der Zeile „Bewusst draußen“ Deines Übergabedokuments.
Die Story kommt zuerst, damit Du das Rot selbst siehst.

Committe, bevor Du anfängst (`git add -A && git commit -m "day 2 block 03: corrected"`). Das
korrigierte Übergabedokument und Deine Überarbeitung sind dann vor dem Zurücksetzen weiter
unten sicher.

```text
Meine Komponente ist <Komponentenname>, ihr Übergabedokument ist <Pfad>. Eine
Sache rückt aus „Bewusst draußen“ in den Umfang: <die Variante oder der Zustand>.
Nimm sie zuerst ins Übergabedokument auf. Schreibe dann nur ihre Story mit einer
play-Funktion, die sie beweist, und fasse die Komponente noch nicht an. Führe
diese Story aus (test-run über storybook-local, oder npm run check:stories, wenn
Storybook nicht läuft) und zeig mir den ersten Fehler genau so, wie das Werkzeug
ihn meldet. Behebe nichts.
```

Lies den Fehler, bevor Du weitermachst. Was hat die `play`-Funktion erwartet, und wer hat
diese Erwartung gewählt: Du, das Übergabedokument oder der Agent?

```text
Repariere jetzt von diesem Fehler aus: eine Änderung, an der richtigen Stelle,
führe die Story dann noch einmal aus und melde das Ergebnis. Wenn sie nach zwei
Versuchen noch rot ist, hör auf und sag mir, was Du für die Ursache hältst.
```

Nach zwei gescheiterten Reparaturen gibt es keinen dritten Flicken. Geh zurück auf Deinen
letzten Commit. Das verwirft alles seitdem, im ganzen Workspace: die Reparaturen und mit ihnen
die neue Story und die Zeile, die Du ins Übergabedokument geschrieben hast. Sieh zuerst nach,
was verschwinden würde:

```shell
git status --short
git clean -nd -- workshop-{{FRAMEWORK_LC}}/src
```

Setz dann zurück, tippe `/clear`, damit die gescheiterten Reparaturen nicht mehr im Kontext
des Agenten liegen, füge den ersten Prompt dieses Abschnitts noch einmal ein und diagnostiziere
von der fehlschlagenden Story aus, nicht von den Flicken:

```shell
git reset --hard HEAD && git clean -fd -- workshop-{{FRAMEWORK_LC}}/src
```

Wenn es grün ist, frag, was noch offen ist: „Was hat diese Änderung offen gelassen? Behebe es
nicht, liste es auf.“ Typische Antworten: Die Story-Controls bieten den neuen Wert nicht an,
Lint und Build liefen nicht noch einmal, dem Figma-Master fehlt diese Variante. Committe, wenn
die Stories grün sind.

## Block 04: der Barrierefreiheits-Check

Drei Schritte, in dieser Reihenfolge. Die Desktop Bridge muss laufen: Bestätige zuerst, dass
`figma_get_status` `setup.valid: true` meldet. Behebe nur die Pflichten, die im gewählten
Brief (`briefs/`) mit **(dieser Block)** markiert sind, für die Variante und den Zustand, die
Du tatsächlich gebaut hast.

```text
Führe den Barrierefreiheits-Check für <Komponentenname> der Reihe nach aus und
melde das Ergebnis jedes Schritts, bevor Du zum nächsten gehst:

1. figma_audit_component_accessibility gegen den Figma-Node (die Desktop Bridge
   muss laufen: Bestätige zuerst, dass figma_get_status setup.valid: true meldet).
   Melde den Score, wie das Werkzeug die Komponente klassifiziert hat und welche
   Checks es deshalb übersprungen hat.
2. Öffne die Story in Storybook und lies das A11y-Panel (axe-core): Liste jede
   Verletzung auf, nicht nur die Anzahl.

Behebe nur die Pflichten, die in Abschnitt 4 des Briefs mit (dieser Block)
markiert sind, der unter diesem Prompt eingefügt ist, für die Variante und den
Zustand, die Du tatsächlich gebaut hast. Lass (volle Komponente)-Punkte als
schriftliche Notiz in der Figma-Beschreibung des Masters stehen, nicht als Code,
von dem Du behauptest, er bestehe einen Check, gegen den er nie geprüft wurde.
```

Schritt 1 kann 100 von 100 liefern und trotzdem wenig geprüft haben: Ein Set, das das Werkzeug
als „presentational“ klassifiziert, überspringt die Checks für Fokusindikator und Zielgröße.
Lies die Klassifizierung, nicht nur den Score.

**Schritt 3 machst Du selbst, von Hand.** Öffne die Story im Browser und leg die Maus weg:
Tab, Shift+Tab, Enter, Leertaste, Escape. Landet der Fokus, wo Du ihn erwartest, siehst Du
ihn, funktioniert die Aktivierung, funktioniert das Schließen? Der Agent kann das skripten,
aber dann gibst Du fünf lange Skripte frei und hast den Fokusring trotzdem nicht gesehen.

**Miss die Zielgröße, wenn Dein Brief eine nennt.** Eine Mindestgröße (24 × 24 px bei einem
Entfernen- oder Schließen-Button) misst keiner der Schritte oben: Das Figma-Audit überspringt
sie bei einem Set, das es „presentational“ nennt, axe prüft sie nicht, und die Parity
vergleicht die äußere Box des ganzen Sets. Im Browser: Rechtsklick auf das Control,
Untersuchen, wähle im Elements-Panel den `<button>` selbst aus (der Klick landet oft auf dem
Icon darin) und lies die Größe seiner Box ab. In Figma: Wähle den Frame des Controls aus und
lies B und H im Design-Panel ab. Beide mindestens 24 × 24, sonst ist es ein Befund.

## Block 04: der Dark-Check

```text
Stelle die Theme-Auswahl in der Storybook-Toolbar auf Dark (addon-themes, sie setzt
`data-theme="dark"`; die Backgrounds-Auswahl färbt nur die Canvas um und schaltet
nichts um) und sieh Dir <Komponentenname> in den Varianten und Zuständen an, die
Du gebaut hast. Bestätige zwei Dinge und melde jedes:

1. Jede Farbe wird weiterhin über eine `--ui-*`-Custom-Property aufgelöst, keine
   ist fest eincodiert, sodass die für `[data-theme="dark"]` deklarierten
   Dark-Werte greifen. Eine fest eincodierte Farbe ist im Light Mode unsichtbar
   und im Dark Mode falsch.
2. Kein Control hat bei Hover oder Press ein `transform` bekommen: Der Zustand
   ist ein Wechsel von Farb- oder Rand-Token, kein Schrumpfen und kein Anheben.
```

Schalte dann selbst die Toolbar um und sieh hin. Der Agent liest das Stylesheet. Du siehst, ob
der Text noch lesbar ist.

{{STUCK}}
