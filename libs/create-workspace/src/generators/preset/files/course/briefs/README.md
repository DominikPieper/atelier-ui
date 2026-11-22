# Komponenten-Briefs: Tag 2

Der Hauptweg an Tag 2 ist Deine eigene Idee (nächster Abschnitt). Die Briefs sind der Rückfall, wenn Dir keine einfällt: vier Briefs, einer je Komponente, [`toast.md`](toast.md), [`avatar.md`](avatar.md), [`tagchip.md`](tagchip.md), [`statcard.md`](statcard.md). Jeder Brief legt fest, **was eine fertige Komponente schuldet**: Anatomie, Achsen, Zustände und Barrierefreiheitspflichten. Keiner sagt, wie Du sie zeichnest. Das ist die Übung. Toast und Avatar sind kanonische Komponenten. TagChip und StatCard sind Kompositionen aus kanonischen Komponenten und sagen das in der ersten Zeile.

## Eigene Idee (der Hauptweg)

Baue, worauf Du Lust hast: eine Komponente, die Du selbst brauchst oder bauen willst. Der ganze Tag 2
(Figma-Set, Entscheidungsdatei, Code, Prüfungen) läuft dann an ihr. Bevor Du anfängst, prüfe
sie in einer Minute an vier Punkten:

1. **Zweck in einem Satz.** Kannst Du sagen, wozu die Komponente da ist? Der Satz wird der erste
   Umfang-Eintrag Deiner Entscheidungsdatei.
2. **Zwei Varianten und eine zweite Achse.** Zwei Werte auf einer `variant`-Achse, dazu eine zweite
   Achse mit zwei Werten: ein Zustandspaar oder ein Datenpaar. Dieselbe Umfangsregel wie bei den Briefs
   (siehe unten): ein richtiger Ausschnitt, nicht die volle Matrix.
3. **Nichts, was den Block sprengt.** Kein Daten laden, kein Drag-and-drop, keine gestapelten Overlays.
4. **Kein Name, den die Bibliothek schon benutzt.** Heißt Deine Komponente wie eine der Bibliothek,
   sag dem Agenten, welche Du meinst (siehe „Zwei Briefs teilen einen Namen“ unten).

**Kein Starter-Frame.** Du baust in einer eigenen Section auf der Seite `🛠️ Workshop-Templates`
Deines Duplikats, aus Komponenten der Bibliothek und Variablen der Collection `Library Tokens`.

**Die offene Frage schreibt der Agent.** Jeder Brief trägt eine „Offene Frage“. Bei einer eigenen
Idee gibt es keinen Brief, der sie trägt: Der Agent entwirft die offenen Fragen aus Deinem Zweck-Satz
und Deinem Set, und Du beantwortest sie als Einträge.

**Zwei Minuten.** Fällt Dir nach zwei Minuten nichts ein, nimm einen Brief. Es ist kein Rückschritt:
Die Regeln und die Messlatte unten gelten für beide Wege gleich.

## Gemeinsame Regeln für eigene Idee und Briefs

**Umfang: zwei Varianten und die Zustände, die Dein Brief oder Deine Idee nennt.** Der Figma-Block dauert 90 Minuten, und die Teilnehmenden sind neu in Figma. Jeder Brief nennt, welche zwei Varianten und welche Zustände im Umfang sind und welche bewusst draußen bleiben; bei einer eigenen Idee legst Du das selbst fest und hältst es als Umfang-Eintrag fest. Toast, Avatar und StatCard kreuzen ihre zwei Varianten mit zwei Zuständen. TagChip hat zwei Varianten mit Entfernen-Button und keinen zweiten Zustand. Das Ziel ist nicht die volle Matrix, sondern ein
_richtiger_ Ausschnitt davon. Der Rest der Matrix steht im Brief, damit die Teilnehmenden wissen, was sie zurückgestellt haben, und nicht rätseln, was sie vergessen haben.

**Starte von einem Starter-Frame, nicht von einer leeren Fläche.** Das gilt für die Briefs; bei einer eigenen Idee gibt es keinen Starter (siehe oben). Jeder Brief nennt den Frame auf der Seite
`🛠️ Workshop-Templates`, der mitkommt, wenn Du die Atelier-Datei in Deine eigenen Entwürfe dupliziert hast. Füllungen, Abstände und Radien sind dort gebunden bis auf das, was Du findest: Die Starter tragen absichtlich ein paar ungebundene Werte. Kopiere ihn, benenne ihn um, baue darauf auf.

**Verändere nie die Originaldatei.** Erst `File → Duplicate to your drafts`. Die Variablen der Atelier-Datei gelten pro Datei, Änderungen dort kollidieren global.

**Binde Tokens, tippe keine Werte.** Jede Füllung, jeder Radius, jeder Abstand und jede Lücke läuft über eine Figma-Variable in der Collection `Library Tokens`, also der semantischen Ebene, die die `--ui-*`-Custom-Properties spiegelt. Ein fest eingetragener Wert ist im Figma-Review ein kritischer Befund.

**Elevation ist ein reines CSS-Token.** `Library Tokens` enthält Variablen für Farbe, Abstand, Größe
(`control-height/*` + `row-height/*`), Radius, Typografie, Rahmenbreite und Deckkraft, aber **keinen Schatten**. `--ui-shadow-*` gibt es nur in `tokens.css`. Eine Komponente, deren Design von einem Schlagschatten abhängt (Toast, eine erhöhte StatCard), muss den Schatten im Brief und im Code festhalten, weil Figma ihn nicht binden kann. Halte das fest, statt eine Schatten-Variable zu erfinden.

**Zwei Briefs teilen einen Namen mit der Bibliothek.** `@atelier-ui/{{FRAMEWORK_LC}}` hat bereits einen eigenen Toast (in Angular als
`AtlToast` exportiert) und einen `AtlAvatar`, und was die Briefs für Toast und Avatar verlangen, weicht davon ab (die
Achse im Avatar-Brief heißt `variant`, in der Bibliothek `shape`). Das ist bekannt und gewollt: Du baust Deine eigene Komponente in der Workshop-App und importierst nicht die der Bibliothek.
Wenn ein Agent auf die Kollision hinweist, hat er recht. Sag ihm, welche Du meinst.

**Zustände bekommen eine Figma-Achse, die `variant`-Union im Code nie.** Figma hat genau eine
Primitive für eine Option, die sich gegenseitig ausschließt: eine Component Property vom Typ Variant. Ein Master, der hover, focus, active oder disabled _zeichnen_ muss, kann das nur über eine eigene `state`-Achse, und Ataliers eigene Bibliothek nutzt sie regelmäßig: `AtlButton`,
`AtlInput`, `AtlSelect`, `AtlCheckbox`, `AtlToggle` und zehn weitere tragen heute alle eine `state`-Achse
(Werte wie `default`, `hover`, `focus`, `active`, dazu datennahe wie
`open`, `filled`, `invalid`). **Nie passieren darf, dass diese Achse in den Code-Vertrag gelangt.**
Die Grenze ist die `variant`-Union der _Komponente selbst_: Du deklarierst sie direkt an Deiner eigenen
Komponente, ohne separate Spec-Datei. Sie enthält nur strukturelle
Werte, etwa `AtlButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'`, nie einen Zustand. Im Code bleiben hover/focus/active/disabled CSS-Pseudoklassen und `disabled`-/`aria-*`-Attribute.
Der Master von `AtlButton` markiert die Grenze in seiner Beschreibung ausdrücklich:
Jede andere Property-Zeile lautet „→ maps to AtlButtonSpec.X“, die `state`-Zeile nur
„interaction state“, ohne Pfeil. Auf der Code-Seite liest sie nichts.

Die kanonische Komponente `card` benennt den Fehlerfall, vor dem das schützt
(`variant-explosion-from-states`, Schweregrad minor): Wer eine `state`-Achse mit jeder
anderen Achse kreuzt, vervielfacht die Frames, 3 Varianten × 4 Zustände × 2 Ausrichtungen sind 24+. Es heißt **nicht**,
dass eine `state`-Achse verboten ist. Halte es bei einer Achse und kuratiere sie, statt voll zu kreuzen: Atelier zeichnet 24 der 48 möglichen
`variant`×`size`×`state`-Kombinationen von `AtlButton`, nicht alle. Manche Master lassen die Achse ganz weg und beschreiben
Interaktionszustände in Prosa, nämlich `AtlCard`, `AtlBadge`, `AtlToast` und `AtlAvatar`
(die vier Komponenten hinter den Briefs dieses Workshops). Sie haben keine `state`-Achse, weil ihr
interaktives Angebot, sofern sie überhaupt eins haben, an einem verschachtelten Control hängt,
das schon seine eigene trägt. Beide Wege sind legitim. Entscheidend ist, ob die
Komponente selbst das interaktive Element ist. Strukturelle Unterschiede (Schweregrad, Form,
Elevation) sind immer die `variant` im Code. Alles andere, also eine Figma-`state`-Achse, wenn
Du eine zeichnest, Prosa, wenn nicht, ist eine Property, ein Zustand oder CSS.

**Farbe ist nie das einzige Signal.** Jeder Schweregrad, Status und Zustand, den ein sehender Mensch
erkennen kann, muss auch ohne Farbe verfügbar sein: als Icon, als Wort oder als zugänglicher Name.

## Fertig, wenn

Dieselbe Messlatte für eigene Ideen und alle vier Briefs. Man erreicht sie in zwei Schritten, weil der Brief selbst nur
die Figma-Hälfte der Arbeit ist: Die Punkte 1 bis 4 und 7 lassen sich am Ende von **Tag 2 Block 01**
prüfen (Figma-Design und Entscheidungsdatei). Die Punkte 5, 6 und 8 prüft man an der
Komponente und ihren Stories, die es erst in **Block 02** (Komponente, Stories) und
**Block 04** (Verifizieren) gibt. Die Nummerierung läuft über beide Listen durch, weil die Briefs sie zitieren.

### Fertig nach dem Figma-Block (Tag 2 Block 01)

1. Das Figma Component Set hat ≥ 2 Varianten auf einer `variant`-Achse, benannt genau so, wie die
   Code-Union heißen wird (`variant`, nicht `Variant`; `success`, nicht `Success`), **und** die
   zweite Achse, die die Umfangszeile Deines Briefs (oder Deine eigene Idee) nennt: ein Lebenszyklus-Paar (`open` / `closing`), ein
   Daten-Paar (`image-loaded` / `initials-fallback`) oder ein kuratiertes Interaktions-Paar, gezeichnet
   als `state`-Achse. Ist Deine Komponente nicht selbst das interaktive Element, bekommt sie gar
   keine Interaktionsachse: Schreib diese Zustände stattdessen in die Beschreibung des Masters,
   wie in der Zustandsregel oben, und die abschließende Prüfung liest die Beschreibung.
2. Jede Füllung, jeder Radius, jeder Abstand und jede Lücke ist an eine `Library Tokens`-Variable gebunden.
3. Jeder Frame mit Kindern nutzt Auto Layout.
4. Eine Dark-Mode-Variante rendert korrekt über den `Dark`-Modus der Collection, ohne
   zweite Komponente, ohne fest eingetragenen Wert.

<!-- die Nummerierung folgt der vollständigen Liste 1–8, die die Briefs zitieren -->

7. Die A11y-Pflichten, die im eigenen Abschnitt des Briefs mit **(dieser Block)** markiert sind, sind erfüllt, und
   Fehler mit Schweregrad blocker sind nicht dabei. Pflichten mit **(volle Komponente)** beschreiben die ausgelieferte Komponente für später: Jede hängt von einem Zustand,
   einem Szenario oder einer Property ab, die der Umfangsabschnitt dieser Übung nicht zu bauen verlangt,
   deshalb wertet die abschließende Prüfung sie nicht aus. Schreib sie stattdessen in die Beschreibung des Masters,
   statt sie zu bauen.

### Fertig nach den Code-Blöcken (Tag 2 Block 02 und 04)

5. Die Prop-Namen und -Werte der Komponente stimmen eins zu eins mit den Figma-Property-Namen überein,
   und es gibt je eine Story pro Variantenwert und pro Boolean-Zustand, sodass Storybook
   jede Achse zeigt, die Du gezeichnet hast.
6. Die generierte Story-Datei deklariert `tags: ['autodocs']`. Autodocs ist in keinem der
   drei Storybooks global aktiv (`.storybook/main.ts` setzt `docs: {}`, und keine Preview-Datei
   setzt ein globales Tag), jede bestehende Story meldet sich pro Datei an. Eine generierte Story
   erbt das Tag meist von der Datei, nach der sie gebaut wurde, aber meist ist nicht immer. Fehlt es,
   rendert die Komponente einen Canvas und keinen Docs-Tab, und die abschließende Prüfung schlägt aus einem Grund fehl,
   der nichts mit der Komponente der Teilnehmenden zu tun hat.

<!-- die Nummerierung folgt der vollständigen Liste 1–8, die die Briefs zitieren -->

8. `figma_check_design_parity` auf Deinem eigenen Figma-Node gegen die generierte Komponente
   (braucht die verbundene Bridge) kommt ohne ungeklärte Abweichungen zurück, und
   die Abweichungen, die er meldet, sind verstanden und nicht bloß abwesend. Nutze den Parity-Prompt in `../parity.md`
   (Node-ID aus Deiner Entscheidungsdatei). Claude stellt zusammen, was der Aufruf braucht. Ein Abschnitt,
   der nicht verglichen wird, wird nicht gemeldet, ein stiller Report ist also keine saubere Komponente. Ohne die Bridge gibt es keinen Parity-Aufruf: Ordne die
   Abweichungen stattdessen von Hand ein.

Die gemeinsame Checkliste für das Tagesende ist die Definition of Done in `CLAUDE.md`
(Format, stylelint, Lint, Build, Unit-Tests und `npm run check:stories`, was `/verify`
ausführt) plus der Dark-Mode-Schalter in der Storybook-Toolbar. Diese Messlatte ist die briefspezifische
Teilmenge davon, keine zweite Kopie.

## Bevor Du promptest

Lass den Agenten zuerst eine Entscheidungsdatei für Deine Komponente entwerfen, mit Kopf
(Ticket: der Brief-Pfad, bei einer eigenen Idee `eigene Idee`; Figma), Offenen Fragen und Entscheidungen. Die offenen Fragen beantwortest Du als
Einträge (Umfang, Verhalten, Bewusste Abweichung). Was Figma und Code schon tragen
(Varianten, Tokens, Props), gehört nicht hinein. Ein ausgefülltes Beispiel, gebaut aus dem
Toast-Brief, steht in `../entscheidungen-beispiel.md`.
