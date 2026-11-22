# Übergabedokument: ein ausgefülltes Beispiel

Verwendet in Tag 2, Block 01 (der Agent entwirft, Du entscheidest), Block 02 (gebaut wird
daraus), Block 03 (Stimmt es noch?) und Block 04 (das Dokument wird aufgelöst). Das hier ist
das Dokument, ausgefüllt für den Toast-Brief (`briefs/toast.md`), in {{FRAMEWORK}}.

**Wofür es da ist.** Das Übergabedokument ist ein kurzer Auftrag, der nur wenige Stunden lebt.
Es trägt Entscheidungen über Sessions und `/clear` hinweg, gibt Block 03 und der Parity einen
festen Bezugspunkt und lässt eine zweite Person zustimmen, bevor Code entsteht. Der Agent
entwirft es, Du entscheidest, am Ende löst es sich auf.

**Was nicht hineingehört.** Nur, was weder Figma noch der Code trägt. Keine Variantenlisten,
keine Token-Bindungen, keine Größen, keine Props, keine Zieldateien: Das alles steht im
Master und im Code, und eine zweite Kopie davon ist nach der ersten Änderung veraltet. Ein
Dokument, das mit dem Master driftet, ist schlimmer als keins.

**Wie es endet.** Jede Verhaltenszeile ist am Ende eine `play`-Funktion. „Bewusst draußen“
wandert in die Figma-Beschreibung des Masters und in die JSDoc der Komponente, „Bewusste
Abweichungen“ in die Story-Parameter oder in die PR-Beschreibung. Danach wird die Datei
gelöscht (Block 04, „Das Übergabedokument auflösen“).

Zwei Lücken kann nur Du füllen: Deine Draft-URL mit Node-ID und die Zeit bis zum automatischen
Schließen (der Brief sagt „konfigurierbar“ und überlässt Dir die Zahl).

Der Name ist vergeben: `@atelier-ui/{{FRAMEWORK_LC}}` hat schon einen eigenen Toast (in
Angular wird er als `AtlToast` exportiert) mit einer anderen API. Dieses Dokument beschreibt
den, den Du baust. Wenn der Agent fragt, welchen Du meinst, sag es, und lass ihn nicht den der
Bibliothek importieren.

---

# Übergabedokument: AtlToast · {{FRAMEWORK}}

## Quelle

Duplikat der Atelier-Datei in meinen Drafts, <Draft-URL>, Node `<Node-ID meiner Kopie>`
(kopiert aus dem Starter-Frame `Toast / Starter`, Node `703:341`).

## Umfang

**Im Umfang.** Eine neue Komponente (kein Alert, der inline stehen bleibt, und kein Dialog,
der blockiert). Das Statussymbol nutzt AtlIcon wieder. Die Varianten `success` und `danger`,
die Zustände `open` und `closing`; `dismissible` und `hasIcon`, wenn die Zeit reicht.

**Bewusst draußen.** Die Varianten info und warning; die sechs Positionswerte (nur eine
Ecke); Stapeln; der Fortschrittsindikator.

## Verhalten

Jede Zeile wird zu genau einer `play`-Funktion.

- Schließt automatisch nach N Sekunden (ich wähle N und schreibe es hier auf: ___).
- Pausiert bei pointer-enter und bei focus-in; läuft weiter, startet nicht neu, wenn beides draußen ist.
- Escape schließt den Toast, solange der Fokus in ihm liegt.
- success meldet höflich (role="status"); danger meldet bestimmt (role="alert").
- Der Schließen-Button hat genau einen zugänglichen Namen, aus aria-label oder verstecktem Text, nie aus beidem.

## Bewusste Abweichungen

- Hover und focus-visible sind CSS, keine Varianten oder Properties im Master. Grund: Es
  sind Zustände des Browsers, keine Entscheidungen des Designs.
- Die Erhöhung ist `--ui-shadow-lg` nur in CSS. Grund: Figma hat keine Schatten-Variable, an
  die sich binden ließe.
