# Aufgabenkarten Tag 2

Verwendet in Tag 2, Block 00 (die Definition-of-Done-Übung), Block 01 (baue Dein Component Set
über den Agenten, mach es maschinenlesbar, dann die API-Regeln und der Entwurf Deines
Übergabedokuments), Block 02 (Generierung mit
Plan-Modus, `docs-show` an Deiner eigenen Komponente, dann Beides ansehen), Block 03 (was rot
war, stimmt das Übergabedokument noch, Rot mit Absicht) und Block 04 (Barrierefreiheit, der
Dark-Check und das Auflösen des Übergabedokuments). Die Karte für die Parity aus Block 04 steht in `parity-prompt.md`, die für den
Linter in `figma-linter-prompt.md`. Ab Block 02 ist Dein Übergabedokument der feste Bezugspunkt für
diese Karten (ein Beispiel steht in `handoff-example.md`).

Die Prompts schreibst Du selbst, in Deinen Worten. Jede Karte nennt das Ziel, das Material und
den Rahmen, den Dein Prompt tragen muss. `prompt-rubrik.md` listet die sechs Prüfungen, an
denen Du jeden Prompt misst.

## Block 00: die Definition-of-Done-Übung (5 Minuten)

Der Workspace enthält eine Regel, die der Agent in jeder Session liest: `CLAUDE.md`, Abschnitt
„Definition of Done“. Der Agent führt aus, was die Liste nennt. Ein Check, der nicht in der
Liste steht, ist ein Check, den niemand verlangt hat. Der Trainer zeigt das einmal am
Beamer: eine Zeile löschen, `/clear`, noch einmal fragen, und der Check ist weg.

### Karte: die Definition of Done des Workspace

**Ziel.** Du kennst die Befehle, die die Definition of Done Deines Workspace nennt, hast
eine Zeile aufgeschrieben, die Dein eigenes Team der Liste hinzufügen würde, und weißt, dass
`/verify` jede Zeile dieser Liste ausführt, auch eine hinzugefügte.

**Material.** `CLAUDE.md`, Abschnitt „Definition of Done“, der Agent als Leser, Dein Nachbar.

**Rahmen.**

- Die Zeile für Dein Team hat dieselbe Form wie die Liste: der Befehl, ein Gedankenstrich, was er beweist.

**Fertig, wenn** Du die Liste des Agenten (sechs Befehle) neben der Datei geprüft hast, Deine
Zeile in `CLAUDE.md` eingetragen ist, `/verify` sie mit ausführt (`/verify` liest die Liste
aus `CLAUDE.md`; fehlt Deine Zeile im Lauf, steht sie nicht im Abschnitt „Definition of Done“) und
Du Deine Zeile mit Deinem Nachbarn verglichen hast: Nennt sie einen Befehl, der bei einem Fehler
mit einem Exit-Code ungleich 0 endet, oder einen Wunsch („der Code ist sauber“)? Nur der
Befehl ist eine Regel, die ein Agent ausführen kann.

**Kür.**

- Schreib eine zweite Zeile für einen Befund, den kein Befehl fängt, und überlege, wie ein
  Befehl dafür aussähe.
- Lösche in einer Kopie von `CLAUDE.md` eine Zeile, öffne eine neue Session und frag noch
  einmal: Was fehlt in der Antwort?
- Prüfe, ob jeder der sechs Befehle im Workspace wirklich existiert.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

## Block 01: baue Dein Component Set über den Agenten

Nichts in diesem Block wird von Hand in Figma gezeichnet oder bearbeitet. Der Agent baut und
ändert das Set. Du wählst den Brief, siehst hin, vergleichst mit dem Brief und entscheidest.
Der Agent schreibt in Deine Figma-Datei, deshalb gilt für jede Karte dieses Blocks:
gearbeitet wird nur in Deinem Duplikat, nie im Original.

### Karte: das Component Set über den Agenten bauen

**Ziel.** Ein Component Set in einer eigenen Section neben den Startern, im Umfang des Briefs
für den 90-Minuten-Block, mit gebundenen Werten, Auto Layout, Component Properties und
Beschreibung, dazu die Node-ID und die Liste dessen, was nicht gebunden werden konnte.

**Material.**

- Dein Brief `course/briefs/<Dein Brief>.md` und `course/briefs/README.md`.
- Der Starter-Frame, den der Brief nennt, auf der Seite Workshop-Templates Deines Duplikats.
- Der Skill `figma-workspace-architect`, die Variablen aus Library Tokens.
- figma-console-mcp, `figma_take_screenshot`.

**Rahmen.**

- Sicherheitsregel: nur im eigenen Duplikat. Der Starter bleibt unberührt, der Agent baut aus einer Kopie.
- Jeder Wert ist an eine Variable aus Library Tokens gebunden. Was sich nicht binden lässt, endet als Liste, nicht als Rohwert ohne Hinweis.

**Fertig, wenn** das Set steht, Du den Brief neben den Screenshot gelegt hast (ist jede
Variante und jeder Zustand da, den die Umfangszeile nennt?) und Du die Node-ID und die Liste
der ungebundenen Werte hast.

**Kür.**

- Lass den Agenten zusätzlich eine Variante bauen, die im Umfang als „Bewusst draußen“ steht,
  und prüfe, ob er sie als Abweichung kennzeichnet.
- Lass einen Screenshot im Dark-Modus machen und prüfe, welcher Zustand am schwächsten lesbar ist.
- Frag, welche Werte der Agent gerne an eine Variable gebunden hätte, die es nicht gibt.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Wähle dann das Set aus, das der Agent gebaut hat: Jede weitere Karte arbeitet auf Deiner
Auswahl. Eine Auswahl, die vor dem Start der Session getroffen wurde, sieht der Agent nicht.
Meldet er, dass nichts ausgewählt ist, klick das Set noch einmal an.

### Karte: das Set per Zuruf steuern

Sieh hin, bevor Du etwas verlangst. Leg den Brief neben den Screenshot: Ist jede Variante
und jeder Zustand da, den die Umfangszeile nennt? Wirkt das Set neben dem Starter wie ein
Mitglied derselben Bibliothek? Was hättest Du anders gebaut?

**Ziel.** Zwei oder drei gezielte Änderungen am Set, nach jeder ein Screenshot, und ein Set,
bei dem Du sagen kannst, warum jeder Teil so ist, wie er ist.

**Material.** Das ausgewählte Component Set, `figma_take_screenshot`, Dein Brief.

**Rahmen.**

- Sicherheitsregel: nur im eigenen Duplikat, nie im Original.
- Ein Befund pro Runde: pro Prompt eine Änderung, damit der Screenshot zeigt, was genau diese Änderung bewirkt hat.
- Jeder Wert bleibt an eine Variable gebunden.

**Fertig, wenn** zwei oder drei Runden gelaufen sind, jeder Screenshot geprüft ist und kein
Wert ohne Variable dazugekommen ist.

**Kür.**

- Lass den Agenten einen Rohwert, den Du entdeckt hast, auf die Skala legen.
- Wünsche eine Änderung, die gegen den Brief läuft, und prüfe, ob der Agent widerspricht.
- Vergleiche den ersten und den letzten Screenshot und schreib in einem Satz, was Du anders
  gemacht hättest.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

## Block 01: mach Dein Component Set maschinenlesbar

Das Set sieht richtig aus. Ist es noch gebunden? Bei einer Änderung auf Zuruf rutscht ein
Rohwert hinein.

### Karte: das Set maschinenlesbar machen

**Ziel.** Das ausgewählte Set ist vollständig gebunden und beschrieben, ohne dass sich sein
Aussehen geändert hat, und Du hast die Listen „geändert“ und „nicht gebunden“ gelesen.

**Material.** Das ausgewählte Set, Dein Brief und `course/briefs/README.md`, der Skill
`figma-workspace-architect`, `figma_take_screenshot`.

**Rahmen.**

- Sicherheitsregel: nur im eigenen Duplikat, nie im Original.
- Scope-Guard: Der Agent zeichnet nichts neu und ändert nicht, wie das Set aussieht.

**Fertig, wenn** beide Listen gelesen sind, jeder Wert ohne Variable von Dir entschieden ist
und der neue Screenshot mit dem vorherigen übereinstimmt.

**Kür.**

- Such selbst im Design-Panel einen Wert, den der Agent als gebunden gemeldet hat, und prüfe
  die Bindung.
- Lass die Beschreibung des Masters von einem frischen Agenten (`/clear`) lesen und frag, was
  er daraus über die Barrierefreiheit weiß.
- Notiere zwei Werte, die Du bewusst nicht gebunden hast, als Kandidaten für „Bewusste Abweichungen“.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Lies beide Listen, bevor Du weitermachst. Eine kurze Liste „geändert“ ist ein Ergebnis, kein
verschwendeter Lauf: Der Bau hat gehalten. Ein Wert ohne Variable (ein Abstand von 7, wo die
Skala 4 und 8 kennt) entscheidest Du: Sag dem Agenten, er soll ihn auf die Skala legen, oder
behalte ihn und notiere ihn als Kandidaten für „Bewusste Abweichungen“. Vergleiche dann den Screenshot mit dem
vorherigen: Ist es noch dasselbe Set?

Als Nächstes läuft der Figma-Linter über Dein eigenes Set: Die Karte steht in
`figma-linter-prompt.md`. Kommt er mit 0 Befunden zurück, ist das Set damit nicht sauber: Der
Linter prüft nur seine Regeln. Öffne den Master und sieh nach, was sie nicht sehen.

## Block 01: die API-Regeln, bevor Du einen Prop-Namen schreibst

Der Master legt die Namen und Werte fest, die der Code tragen wird. Deshalb werden sie
zuerst geprüft, noch vor dem Übergabedokument. Vier Regeln für eine API, die ein Agent ohne Raten benutzen kann:

1. **Vorhersagbare Namen.** Dieselbe Sache heißt wie im Rest der Bibliothek (`variant`,
   `size`, `disabled`), nicht anders.
2. **Literale Unions.** Die erlaubten Werte sind eine kurze Liste (`'success' | 'danger'`),
   kein freier Text und keine Zahl, die etwas bedeutet.
3. **Komposition statt Konfiguration.** Ein Bereich, der alles aufnehmen kann, ist ein Slot,
   kein wachsender Haufen Boolean-Properties.
4. **Keine versteckten Defaults.** Jeder Default ist in der API sichtbar. Nichts hängt von
   einem Wert ab, der nirgends aufgeschrieben ist.

### Karte: die Property-Liste gegen die API-Regeln prüfen

**Ziel.** Die Property-Liste Deines Component Sets mit Namen und Werten, zu jeder der vier
Regeln eine Aussage, was umbenannt oder geändert würde und warum, und die Stellen, an denen
Dein Brief eine Regel bricht. Umbenannt ist noch nichts.

**Material.**

- Das Component Set, das Du in Figma ausgewählt hast, nur lesen.
- Dein Brief `course/briefs/<Dein Brief>.md`.
- Die vier Regeln oben.

**Rahmen.**

- Scope-Guard: Er benennt noch nichts um und ändert nichts in Figma.

**Fertig, wenn** Du die Liste gelesen und jede Zeile selbst entschieden hast: umbenennen oder
den Namen aus dem Brief behalten und den Grund als Kandidaten für „Bewusste Abweichungen“
notieren.

**Kür.**

- Prüfe jede Regel an einer Komponente der Bibliothek über `docs-show` und schreib auf, wo
  die Bibliothek dieselbe Regel einhält oder bricht.
- Formuliere für jede Regel einen eigenen Satz in Deinen Worten, den Dein Team übernehmen
  könnte.
- Such im Brief den Wert, der nach einer literalen Union aussieht und trotzdem freier Text ist.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Entscheide jede Zeile selbst: Lass den Agenten jetzt umbenennen, oder behalte den Namen aus
dem Brief und notiere den Grund als Kandidaten für „Bewusste Abweichungen“.

### Karte: Properties umbenennen

**Ziel.** Die Property oder der Wert, den Du umbenennen willst, heißt im Set neu, die
Beschreibung des Sets trägt den neuen Namen, und Du hast die Property-Liste noch einmal
gesehen.

**Material.** Das ausgewählte Component Set, die Liste aus der Karte davor,
`figma_take_screenshot`.

**Rahmen.**

- Sicherheitsregel: nur im eigenen Duplikat, nie im Original.
- Ein Befund pro Runde: eine Umbenennung pro Prompt.

**Fertig, wenn** die neue Property-Liste stimmt und Du geprüft hast, ob eine Textebene oder
ein Token das alte Wort noch trägt.

**Kür.**

- Such mit der Ebenensuche in Figma nach dem alten Namen und lass Reste beseitigen.
- Benenne einen Wert um, den der Brief vorgibt, und notiere den Grund als Kandidaten für
  „Bewusste Abweichungen“.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Eine Umbenennung ändert den Namen, nicht was das Set zeigt: Eine Textebene oder ein Token, das
das alte Wort trägt, behält es. Ob das noch stimmt, entscheidest Du.

Erwarte wenige Umbenennungen: Der Brief legt die meisten Namen fest. Gefunden wird die Stelle,
an der ein vorgegebener Name eine Regel bricht. Das Ergebnis ist die Property-Liste, die im Master
steht und die der Code übernimmt.

### Karte: das Übergabedokument entwerfen lassen und entscheiden

Das Set steht und ist gebunden. Was Figma und Code nicht tragen, steht noch nirgends: was
Du bewusst nicht baust, wie sich die Komponente verhält und wo sie vom Design abweicht. Das zu
entscheiden ist die Denkarbeit dieses Blocks. Der Agent entwirft die Datei, Du entscheidest.

**Ziel.** Eine Datei `handoff/<Name>.md` mit den vier Abschnitten **Quelle**, **Umfang**,
**Verhalten** und **Bewusste Abweichungen**: Die Quelle hat der Agent aus Deinem Set
gefüllt, die drei anderen hast Du entschieden und in eigenen Worten geschrieben.

**Material.**

- Das ausgewählte Component Set, nur lesen.
- `handoff-example.md` als Muster für Form und Länge, nicht als Text zum Abschreiben.
- Der Skill `atelier-component`.
- Dein Brief `course/briefs/<Dein Brief>.md`.

**Rahmen.**

- Der Agent füllt nur **Quelle** und darf Kandidaten nennen, die er im Set sieht. **Umfang**,
  **Verhalten** und **Bewusste Abweichungen** bleiben leer, bis Du sie füllst.
- Gebaut wird noch nichts: Der Agent legt die Datei an, zeigt sie und hört auf.

**Fertig, wenn** Du jede Zeile unter Umfang, Verhalten und Bewusste Abweichungen selbst
geschrieben oder bewusst aus einem Kandidaten übernommen hast, jede Verhaltenszeile ein
einzelnes Verhalten beschreibt (eine Zeile, eine spätere `play`-Funktion) und keine
Variantenliste, kein Token und keine Prop im Dokument steht.

**Kür.**

- Gib das Dokument einer Kollegin oder einem Kollegen und frag, welche Zeile sie oder er
  anders bauen würde.
- Streich eine Zeile aus **Verhalten**, die der Master schon trägt, und begründe in einem
  Satz, warum sie nicht ins Dokument gehört.
- Lass einen frischen Agenten (`/clear`) nur das Dokument lesen und frag, was er bauen
  würde. Wo rät er?

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Die Kandidaten des Agenten sind Vorschläge. Umfang ist eine Entscheidung gegen etwas: Was
lässt Du weg, und steht das im Master? Eine Verhaltenszeile, die Du nicht in einem Satz
sagen kannst, ist noch keine Entscheidung. Eine Abweichung ohne Grund ist ein Fehler, der
noch nicht gefunden wurde.

## Block 02: die Komponente generieren

**Zuerst Plan-Modus.** Drück vor dem Absenden Shift+Tab, bis die Statuszeile den Plan-Modus
zeigt, schick den Prompt ab und lies den Plan: Jede Prop darin muss eine Property Deines
Masters sein, jede Verhaltenszeile eine Zeile Deines Übergabedokuments. Erst dann lass bauen. Eine erfundene Prop ist als Planzeile billiger
zu finden als rote Story.

**Beantworte die Fragen des Plans, bevor Du freigibst.** Ein Plan endet meist mit Ergänzungen,
die weder Master noch Übergabedokument kennen (ein zusätzlicher Output, eine andere Rolle, ein Default)
und mit ein oder zwei Fragen. Ein schlichtes „bau es“ gibt alles frei. Sag zu jedem Punkt ja
oder nein, in Worten.

Der Prompt trägt nur, was für diese Aufgabe gilt. Die festen Regeln, die für jede Komponente
gelten (Tokens, Komposition nach Bereichen, ein Name an jedem reinen Icon-Control, Status ohne
Farbe sichtbar, `tags: ['autodocs']`), stehen mit ihren Gründen im Skill `atelier-component`
des Workspace.

### Karte: die Komponente aus dem Übergabedokument generieren

**Ziel.** Die {{FRAMEWORK}}-Implementierung Deiner Komponente mit Test und Stories, deren
Prop-Namen eins zu eins aus dem Master stammen und die für jede Zeile unter **Verhalten**
genau eine `play`-Funktion hat, mit gemeldeten Exit-Codes der Definition of Done.

**Material.**

- Dein Übergabedokument (Pfad oder eingefügter Text), Beispiel: `handoff-example.md`.
- Der Skill `atelier-component`, `CLAUDE.md` mit der Definition of Done (die Checks, die
  `/verify` ausführt).
- Der Plan-Modus (Shift+Tab).

**Rahmen.**

- Gebaut wird aus dem Übergabedokument: eine `play`-Funktion pro Zeile unter **Verhalten**.
- Was unter **Bewusste Abweichungen** steht, ist vorgegeben und kein Fehler.
- Plan zuerst: Du liest und beantwortest den Plan, bevor gebaut wird.

**Fertig, wenn** der Plan nur Properties Deines Masters enthielt, die Komponente samt Test
und Stories existiert, jede Verhaltenszeile eine eigene `play`-Funktion hat und jeder
Exit-Code der Definition of Done gemeldet und 0 ist.

**Kür.**

- Schick den Plan einmal absichtlich mit einer Prop zurück, die im Master fehlt,
  und prüfe, ob der Agent sie ablehnt oder still aufnimmt.
- Ergänze eine Story für einen Fehler- oder Leerzustand und prüfe, dass sie im Umfang des
  Übergabedokuments gedeckt ist (sonst gehört sie nach „Bewusst draußen“).
- Prüfe mit Tab die Tastaturbedienung der generierten Komponente in Storybook.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

## Block 02, nach der Generierung: `docs-show` an Deiner eigenen Komponente (10 Minuten)

Über den lokalen Storybook-MCP (`storybook-local`), sobald Deine Komponente und ihre Stories
rendern. Es geht darum: Was müsste ein Agent raten, der Deine Komponente benutzt? Die
Beschreibungen sind wahrscheinlich schon da, weil der Agent sie beim Generieren geschrieben
hat. Darum stellst Du die Frage offen.

### Karte: was ein Agent an Deiner Komponente raten müsste

**Ziel.** Eine Liste der Lücken, die ein Agent hätte, der Deine Komponente nur aus `docs-show`
kennt, und danach die Dokumentationslücken geschlossen, ohne das Verhalten zu ändern.

**Material.** `storybook-local` mit `docs-list` und `docs-show` für Deine Komponente, die
JSDoc und die Stories der Komponente. Ohne den MCP geht dieselbe Abfrage über die CLI:

```shell
npx storybook tools --config-dir workshop-{{FRAMEWORK_LC}}/.storybook --json docs show --input '{"id":"<id>"}'
```

**Rahmen.**

- Scope-Guard: Die erste Runde ändert nichts. Die Behebung ist ein eigener Prompt.
- Das Verhalten der Komponente bleibt unverändert.

**Fertig, wenn** Du jede Zeile der Liste als Lücke in der Dokumentation oder Lücke in der
Komponente eingeordnet und die erste Sorte geschlossen hast, und `docs-show` die Änderung
zeigt.

**Kür.**

- Setz die Lücken der zweiten Sorte (Lücke in der Komponente) als Zeile in „Bewusst draußen“
  oder als Notiz für die Reviews.
- Lass einen frischen Agenten (`/clear`) allein aus `docs-show` ein Beispiel mit Deiner
  Komponente schreiben und sieh, wo er danebenliegt.
- Frag, welche Props ein neuer Nutzer am ehesten verwechselt, und prüfe die Antwort in der
  Dokumentation.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Lies die Liste, bevor Du sie zurückgibst. Welche Zeilen sind eine Lücke in der Dokumentation,
welche eine Lücke in der Komponente?

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
was die Story zeigt. Die Schrift gehört nicht dazu: Storybook lädt Instrument Sans nicht,
Überschriften erscheinen in einer Ersatzschrift, und das ist kein Fehler Deiner Komponente. Nicht einordnen und nicht beheben: Block 04 ordnet die Liste ein (eine
gewollte Abweichung, ein Fehler im Code oder eine Lücke im Design). Eine leere Liste nach zwei
Minuten heißt, dass Du eine Variante angesehen hast.

Committe dann (`git add -A && git commit -m "day 2 block 02: green"`) und **lass diese Claude
Code Session über die Mittagspause offen**: Block 03 startet in ihr.

## Block 03: grün heißt noch nicht richtig

Block 02 endete höchstwahrscheinlich grün. Das sagt, dass die Checks am Ende bestanden haben,
nicht wie es dazu kam. Drei Karten, in dieser Reihenfolge. Dein Commit vom Ende von Block 02
ist der Stand, auf den Du zurückgehst. Wenn `git status` noch Änderungen zeigt, committe
jetzt: `git add -A && git commit -m "day 2 block 02: green"`.

### Was unterwegs rot war

In derselben Session, die die Komponente generiert hat (nach `/clear` muss der Agent die
Spuren in den Dateien suchen und findet weniger). Wenn die Session geschlossen wurde, starte
Claude Code im Workspace-Ordner mit `claude --continue`: Das setzt die letzte Session dort
fort.

#### Karte: was unterwegs rot war

**Ziel.** Eine Liste jedes Checks, der beim Bau Deiner Komponente irgendwann rot war, jede
Zeile als „behoben“ oder „umgangen“ markiert und von Dir gegen den Diff geprüft.

**Material.**

- Die Session, die die Komponente generiert hat (oder die Dateien, wenn sie weg ist).
- Zwei Befehle in einem zweiten Terminal im Workspace-Ordner:

```shell
git show --stat HEAD
git grep -nE "eslint-disable|stylelint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck|\.skip\(|\.only\(|(^|[^e])xit\(|xdescribe\(" -- workshop-{{FRAMEWORK_LC}}/src
```

**Rahmen.**

- Scope-Guard: Der Agent führt nichts aus und ändert nichts.
- Umgehen heißt: ein Disable-Kommentar, eine geänderte Regel oder Konfiguration, ein umbenanntes Ding, eine gelockerte oder entfernte Assertion, ein übersprungener Test.

**Fertig, wenn** Du die Zeilen „umgangen“ zuerst gelesen, danach die Zeilen „behoben“
geprüft hast und für jede Zeile weißt, wo die Korrektur hingehört.

**Kür.**

- Lass den Agenten die Liste noch einmal aus dem Diff statt aus dem Gedächtnis erstellen und
  vergleiche beide Listen.
- Schreib die eine Zeile für `CLAUDE.md` oder den Skill auf, die den Umweg am ehesten
  verhindert hätte, mit ihrem Grund.
- Such mit `git log -p` eine Änderung, die keiner der beiden Befehle findet (ein umbenannter
  Selektor, eine entfernte Assertion).

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Die Liste ist der Bericht des Agenten über sich selbst. Halte die zwei Befehle dagegen.

Der erste zeigt jede Datei, die der Commit aus Block 02 angefasst hat (wenn Du gerade eben ein
zweites Mal committet hast, liegt dieser Commit einen zurück: `git show --stat HEAD~1`). Eine
Datei außerhalb von `workshop-{{FRAMEWORK_LC}}/src` und `course/`, vor allem eine
Konfiguration (`eslint.config.mjs`, `stylelint.config.mjs`, eine `tsconfig`, eine
`project.json`), ist eine geänderte Regel. Der zweite findet Disable-Kommentare und
übersprungene Tests. Steht jeder Treffer auf der Liste des Agenten? Keiner der beiden Befehle
findet einen umbenannten Selektor oder eine entfernte Assertion: Dafür hast Du nur die Liste
und Dein eigenes Lesen des Diffs.

Entscheide für jede Zeile, wo die Korrektur hingehört. Ein Disable-Kommentar schaltet eine
Zeile stumm. Eine Regel, die für diesen Workspace falsch ist, wird in ihrer Konfiguration
geändert, und das ist eine Entscheidung für einen Menschen, nicht für den Agenten. Eine
entfernte Assertion ist ein Verhalten, das niemand mehr prüft: Bring sie zurück oder sag,
warum sie weg ist. Überarbeite dann einmal: entweder Deinen Prompt oder eine Zeile in
`CLAUDE.md`, die den Umweg verhindert hätte, und sag warum.

### Stimmt das Übergabedokument noch?

Der Agent hat beim Bauen Dinge gelernt, die das Dokument nicht kannte. Zwei Karten und eine
Entscheidung von Dir dazwischen.

#### Karte: Übergabedokument gegen Code, die Liste

**Ziel.** Eine nummerierte Liste jeder Zeile des Übergabedokuments, die für das Gebaute nicht
mehr stimmt, mit der Empfehlung des Agenten, ob Dokument oder Code zu korrigieren ist.

**Material.** Dein Übergabedokument, der Code Deiner Komponente.

**Rahmen.**

- Scope-Guard: Er ändert weder Code noch Dokument, er listet nur.

**Fertig, wenn** Du jede Nummer selbst entschieden hast: Dokument falsch oder Code falsch.

**Kür.**

- Such eine Zeile, die der Agent nicht gelistet hat, und prüfe, ob sie stimmt.
- Entscheide eine Nummer gegen die Empfehlung des Agenten und schreib in einem Satz, warum.
- Prüfe, ob die Zeile „Bewusst draußen“ noch zum Code passt.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Ein Dokument, das an alles angepasst wird, was gebaut wurde, ist keine Spezifikation mehr.
Wo der Code falsch ist, bleibt die Zeile stehen und die Korrektur ist eine Reparatur am Code,
eine Änderung nach der anderen. Wo das Dokument falsch ist, gehen nur diese Nummern in die
nächste Karte.

#### Karte: Übergabedokument korrigieren

**Ziel.** Das Dokument beschreibt für die Nummern, die Du als „Dokument falsch“ entschieden
hast, was gebaut wurde, jede korrigierte Zeile ist gekennzeichnet, der Code ist unberührt.

**Material.** Die Liste mit Deinen Entscheidungen, das Übergabedokument.

**Rahmen.**

- Scope-Guard: Nur die Nummern, die Du nennst, und nur im Dokument. Kein Code.
- Jede korrigierte Zeile endet auf „(nach der Generierung korrigiert)“.

**Fertig, wenn** `git diff` am Dokument nur die genannten Zeilen zeigt, alle mit der
Kennzeichnung, und am Code nichts.

**Kür.**

- Prüfe im Diff, ob eine Zeile außerhalb Deiner Nummern angefasst wurde, und lass sie
  zurücknehmen.
- Lass das Dokument von einem frischen Agenten (`/clear`) gegen den Code lesen und sieh, ob
  die Liste jetzt leer ist.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

### Rot mit Absicht

Jetzt die Schleife, nach der der Block benannt ist, an einer Änderung, die Du wählst. Nimm
eine Variante oder einen Zustand aus der Zeile „Bewusst draußen“ Deines Übergabedokuments.
Die Story kommt zuerst, damit Du das Rot selbst siehst.

Committe, bevor Du anfängst (`git add -A && git commit -m "day 2 block 03: corrected"`). Das
korrigierte Übergabedokument und Deine Überarbeitung sind dann vor dem Zurücksetzen weiter
unten sicher.

#### Karte: Rot mit Absicht

**Ziel.** Eine Variante oder ein Zustand aus „Bewusst draußen“ ist im Übergabedokument im
Umfang, hat dort eine Verhaltenszeile, hat eine Story mit `play`-Funktion, die Du erst rot und dann grün gesehen hast, und
die Reparatur war eine Änderung an der richtigen Stelle.

**Material.**

- Dein Übergabedokument, Deine Komponente, `test-run` über `storybook-local` (oder
  `npm run check:stories`, wenn Storybook nicht läuft).
- Dein Commit vom Anfang dieses Abschnitts.

**Rahmen.**

- Die Story kommt zuerst: Du siehst das Rot, bevor etwas repariert wird.
- Nach zwei gescheiterten Reparaturen gibt es keinen dritten Flicken (siehe Zurücksetzen unten).

**Fertig, wenn** Du das Rot gesehen und gelesen hast (was hat die `play`-Funktion erwartet,
und wer hat diese Erwartung gewählt: Du, das Übergabedokument oder der Agent?), die Story grün
ist, Du die Liste der offenen Punkte gelesen hast und committet hast. Typische offene Punkte:
Die Story-Controls bieten den neuen Wert nicht an, Lint und Build liefen nicht noch einmal,
dem Figma-Master fehlt diese Variante.

**Kür.**

- Wähle eine zweite Sache aus „Bewusst draußen“ und lass die Schleife noch einmal laufen.
- Nimm bewusst eine schwere Änderung mit Verhalten (zum Beispiel das Stapeln mehrerer
  Instanzen oder einen Zustand mit Zeitablauf) und rechne damit, dass die erste Reparatur
  nicht reicht: Scheitern zwei, gehst Du den Weg „Zurücksetzen“ unten.
- Lass den Agenten bei einem offenen Punkt eine Zeile in den Abschnitt „Bewusst draußen“ oder
  in die Dokumentation schreiben.
- Führe nach der Reparatur Lint und Build aus und melde die Exit-Codes.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Nach zwei gescheiterten Reparaturen: Geh zurück auf Deinen letzten Commit. Das verwirft alles
seitdem, im ganzen Workspace: die Reparaturen und mit ihnen die neue Story und die Zeile, die
Du ins Übergabedokument geschrieben hast. Sieh zuerst nach, was verschwinden würde:

```shell
git status --short
git clean -nd -- workshop-{{FRAMEWORK_LC}}/src
```

Setz dann zurück, tippe `/clear`, damit die gescheiterten Reparaturen nicht mehr im Kontext
des Agenten liegen, starte Runde 1 noch einmal und diagnostiziere von der fehlschlagenden Story
aus, nicht von den Flicken:

```shell
git reset --hard HEAD && git clean -fd -- workshop-{{FRAMEWORK_LC}}/src
```

Committe, wenn die Stories grün sind.

## Block 04: der Barrierefreiheits-Check

Drei Schritte, in dieser Reihenfolge. Die Desktop Bridge muss laufen: Bestätige zuerst, dass
`figma_get_status` `setup.valid: true` meldet.

### Karte: Barrierefreiheit prüfen

**Ziel.** Das Ergebnis von Figma-Audit und axe, die Pflichten, die der Brief mit **(dieser
Block)** markiert, behoben, die übrigen als Notiz im Master, und Deine eigene Tastaturprobe.

**Material.**

- `figma_audit_component_accessibility` gegen den Figma-Node (nur lesen),
  `figma_get_status`.
- Die Story in Storybook mit dem A11y-Panel (axe-core).
- Der gewählte Brief in `briefs/`, Abschnitt 4: Pflichten mit **(dieser Block)** und
  **(volle Komponente)**.

**Rahmen.**

- Behoben werden nur die Pflichten, die der Brief mit **(dieser Block)** markiert, für die Variante und den Zustand, die Du gebaut hast.
- Punkte mit **(volle Komponente)** bleiben als schriftliche Notiz in der Figma-Beschreibung des Masters, nicht als Code.

**Fertig, wenn** Du die Klassifizierung gelesen hast (nicht nur den Score), jede axe-Verletzung
behoben oder begründet ist und Du die Tastaturprobe und die Zielgröße selbst gemacht hast.

**Kür.**

- Prüfe eine Pflicht aus „(volle Komponente)“ trotzdem an der gebauten Variante und notiere
  das Ergebnis in der Beschreibung.
- Prüfe den Fokusring in Dark.
- Schreib für jede übersprungene Prüfung auf, wie Du sie von Hand ersetzen würdest.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Der Figma-Audit kann 100 von 100 liefern und trotzdem wenig geprüft haben: Ein Set, das das
Werkzeug als „presentational“ klassifiziert, überspringt die Checks für Fokusindikator und
Zielgröße. Lies die Klassifizierung, nicht nur den Score.

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

### Karte: der Dark-Check

**Ziel.** Du hast Deine Komponente in Dark gesehen, und zwei Aussagen sind belegt: Jede Farbe
löst über eine `--ui-*`-Custom-Property auf, und kein Control hat bei Hover oder Press ein
`transform`.

**Material.** Die Theme-Auswahl in der Storybook-Toolbar (addon-themes, setzt
`data-theme="dark"`; die Backgrounds-Auswahl färbt nur die Canvas um und schaltet nichts um),
die Stylesheets der Komponente, die Varianten und Zustände, die Du gebaut hast.

**Rahmen.**

- Die Dark-Werte stehen unter `[data-theme="dark"]`. Hover und Press wechseln ein Farb- oder Rand-Token, nie ein `transform`.

**Fertig, wenn** beide Aussagen mit Fundstelle gemeldet sind und Du die Toolbar selbst
umgeschaltet und hingesehen hast: Der Agent liest das Stylesheet, Du siehst, ob der Text noch
lesbar ist.

**Kür.**

- Such mit `grep` nach `#`, `rgb` und `transform` im Stylesheet und vergleiche mit der
  Meldung des Agenten.
- Prüfe den Kontrast des Textes in einer Variante nach Augenmaß und notiere den schwächsten
  Zustand.
- Prüfe, ob der Fokusring in Dark sichtbar bleibt.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

## Block 04: das Übergabedokument auflösen

Das Übergabedokument war ein Auftrag. Der Auftrag ist erledigt, und was er enthielt, muss
jetzt dort stehen, wo es nicht veraltet: im Test, im Master, im Code.

### Karte: das Übergabedokument auflösen

**Ziel.** Jede Zeile des Dokuments steht an einem dauerhaften Ort, und die Datei
`handoff/<Name>.md` ist gelöscht (oder ihr Text ist zur PR-Beschreibung geworden).

**Material.**

- Das Übergabedokument und die Komponente mit ihren Stories.
- Das Component Set in Figma, die JSDoc der Komponente, die Story-Parameter.
- figma-console-mcp, mit dem der Agent die Beschreibung des Masters schreibt.

**Rahmen.**

- Sicherheitsregel: Figma wird nur in Deinem Duplikat geändert, nie im Original, und nur
  durch den Agenten.
- Gelöscht wird erst, wenn keine Zeile mehr nur im Dokument steht.

**Fertig, wenn** jede Zeile **Verhalten** eine `play`-Funktion hat (Du hast es gezählt),
„Bewusst draußen“ in der Figma-Beschreibung des Masters und in der JSDoc der Komponente steht,
jede **Bewusste Abweichung** mit ihrem Grund in den Story-Parametern oder in der
PR-Beschreibung steht und die Datei weg ist: Im Dokument ist nichts mehr übrig, was nicht
an einem dauerhaften Ort steht.

**Kür.**

- Lass einen frischen Agenten (`/clear`) nur die Komponente und `docs-show` lesen und frag,
  was er über die Grenzen der Komponente weiß. Stimmt es mit dem Dokument überein?
- Such eine Zeile, die Du nirgends dauerhaft unterbringen kannst, und entscheide, ob sie
  überflüssig war oder ob dem Master etwas fehlt.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und im Abschnitt „Wenn Du festhängst“ am
Ende dieser Datei.

Zähl die `play`-Funktionen gegen die Verhaltenszeilen, bevor Du etwas löschst. Eine Zeile
ohne `play` ist ein Versprechen, das niemand prüft. Wenn die PR-Beschreibung die Abweichungen
trägt, ist der Text des Dokuments ihr Rohstoff, und das Löschen der Datei kostet nichts.

{{STUCK}}
