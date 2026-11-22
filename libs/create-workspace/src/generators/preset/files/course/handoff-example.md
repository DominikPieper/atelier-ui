# Übergabedokument: ein ausgefülltes Beispiel

Verwendet in Tag 2, Block 01 (Du schreibst Dein eigenes) und als Eingabe jedes Prompts an
Tag 2. Das hier ist das Dokument, ausgefüllt für den Toast-Brief (`briefs/toast.md`), in
{{FRAMEWORK}}. Es ist eine Checkliste, kein Formular: Sein Wert liegt darin, dass Du den Umfang
entscheidest und das Verhalten in eigenen Worten aufschreibst, bevor es Code gibt.

Zwei Lücken kann nur Du füllen: Deine Draft-URL mit Node-ID und die Zeit bis zum automatischen
Schließen (der Brief sagt „konfigurierbar“ und überlässt Dir die Zahl).

Jede Zeile ist etwas, wogegen der Diff gehalten werden kann: Eine Variante, die nicht in der
Zeile „Im Umfang“ steht, ist ein Befund, und eine Verhaltenszeile ohne play-Funktion ebenso.

Der Name ist vergeben: `@atelier-ui/{{FRAMEWORK_LC}}` hat schon einen eigenen Toast (in
Angular wird er als `AtlToast` exportiert) mit einer anderen API. Dieses Dokument beschreibt
den, den Du baust. Wenn der Agent fragt, welchen Du meinst, sag es, und lass ihn nicht den der
Bibliothek importieren.

---

# Übergabedokument: AtlToast · {{FRAMEWORK}}

**Quelle.** Duplikat der Atelier-Datei in meinen Drafts, <Draft-URL>, Node
`<Node-ID meiner Kopie>` (kopiert aus dem Starter-Frame `Toast / Starter`, Node
`703:341`). Seite: meine Kopie des Toast-Frames.

**Maßgebliche Quelle.** Der Brief, `briefs/toast.md`, ist die Quelle dafür, was die
Komponente ist.

**Wiederverwenden oder neu.** Neue Komponente. Das Statussymbol nutzt AtlIcon wieder. Sie ist
kein Alert (inline, bleibt stehen) und kein Dialog (blockierend).

**Im Umfang.** variant = success | danger; states = open | closing.
`dismissible` und `hasIcon` als Booleans, wenn die Zeit reicht.
Hover und focus-visible sind CSS, keine Varianten.

**Bewusst draußen.** Die Varianten info und warning; die sechs Positionswerte (nur eine
Ecke); Stapeln; der Fortschrittsindikator. Jedes davon steht in der Figma-Beschreibung des
Masters, nicht stillschweigend weggelassen.

**Token-Bindungen.** Container: Füllung `--ui-color-surface-raised`, Rand
`--ui-color-border`, Radius `--ui-radius-md`, Padding und Abstand aus der
`--ui-spacing-*`-Leiter. success: `--ui-color-success-bg` und
`--ui-color-success-text`. danger: `--ui-color-danger-bg` und
`--ui-color-danger-text`. Schließen-Button: `--ui-color-text-muted`.
Erhöhung: `--ui-shadow-lg`, nur CSS. Figma hat keine Schatten-Variable, deshalb sagt das
die Figma-Beschreibung.

**Bewusste Abweichungen.** Was der Code absichtlich anders macht als das Design, und warum.
Hover und focus-visible sind CSS, keine Varianten oder Properties.
Die Erhöhung ist `--ui-shadow-lg` nur in CSS, weil Figma keine Schatten-Variable hat, an
die sich binden ließe.

**Verhalten.** Jede Zeile wird zum Titel einer play-Funktion.

- Schließt automatisch nach N Sekunden (ich wähle N und schreibe es hier auf: ___).
- Pausiert bei pointer-enter und bei focus-in; läuft weiter, startet nicht neu, wenn beides draußen ist.
- Escape schließt den Toast, solange der Fokus in ihm liegt.
- success meldet höflich (role="status"); danger meldet bestimmt (role="alert").
- Der Schließen-Button hat genau einen zugänglichen Namen, aus aria-label oder verstecktem Text, nie aus beidem.

**Barrierefreiheit.** success und danger unterscheiden sich ohne Farbe (Symbol und Text).
Das Symbol ist aria-hidden. Die Aktion, falls vorhanden, ist ein echter Button. Ein
kritischer Fehler wird nie als Toast gezeigt.

**Zieldateien.** Die Komponente, ihr Unit-Test und ihre Story-Datei (eine Story
pro Variantenwert und Boolean-Zustand, eine play-Funktion pro Verhaltenszeile oben).

**Abnahme.** Unit-Tests und Lint enden mit Exit-Code 0. check:stories grün (jede Story
rendert, axe sauber). docs-show beschreibt die Komponente: eine Beschreibung und eine Zeile
pro Property, und nichts, was ein Agent, der nur diesen Text liest, raten müsste.
figma_check_design_parity auf meinem Node ausgeführt, jede gemeldete Abweichung
eingeordnet: Code, Figma, absichtlich so (dann steht sie unter Bewusste Abweichungen)
oder Werkzeug-Artefakt.
