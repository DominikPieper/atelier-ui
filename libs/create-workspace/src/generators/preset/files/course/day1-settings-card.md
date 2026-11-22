# Tag 1, Block 02: die Settings Card

Gebraucht in Tag 1, Block 02. Der Figma-Frame „Settings / Card“ wird eine
{{FRAMEWORK}}-Komponente, gebaut aus `@atelier-ui/{{FRAMEWORK_LC}}`. Die Bridge muss
verbunden sein (siehe `rescue.md`). Wähle den Frame in Figma aus, während Claude Code schon
läuft: Eine Auswahl, die vor dem Start der Session getroffen wurde, sieht der Agent nicht.
Meldet der Agent, dass nichts ausgewählt ist, klicke den Frame noch einmal an.

Die Prompts schreibst Du selbst. Die Karten sagen Dir, was am Ende da sein muss, womit der
Agent arbeitet und welche Regeln Dein Prompt tragen muss. `prompt-rubrik.md` listet die sechs
Prüfungen, an denen Du ihn misst.

## Die Komponente generieren

### Karte: Settings Card generieren

**Ziel.** Eine {{FRAMEWORK}}-Komponente „Settings Card“, die aus Bibliothekskomponenten und
Tokens besteht, nicht aus eigenen Bausteinen, und deren Token-Zuordnung Du nachprüfen kannst.

**Material.**

- Der ausgewählte Frame „Settings / Card“ in Figma, gelesen mit
  `figma_get_component_for_development` (figma-console-mcp): `boundVariables` und die
  visuelle Referenz.
- Der MCP-Server `{{MCP}}` mit `docs-list` und `docs-show` für AtlCard, AtlInput, AtlToggle
  und AtlButton.

**Rahmen.**

- Gebaut wird aus Bibliothekskomponenten und `--ui-*`-Tokens: keine festen px-Werte, kein Hex, keine Tailwind-Klassen.
- Eine Prop, die `docs-show` nicht kennt, gibt es nicht.

**Fertig, wenn** die Komponente existiert, jede Prop eine `docs-show`-Quelle hat und die
Liste „Variable, Token“ des Agenten vollständig ist (oder offene Zuordnungen benennt).

**Kür.**

- Lass eine zweite, kompakte Variante der Card bauen, die nur Abstände ändert, und prüfe,
  dass sie dieselben Tokens nutzt.
- Ergänze einen Fehlerzustand des Eingabefelds aus den dokumentierten Props von AtlInput.
- Schalte in der Story auf Dark und notiere, was nicht mitwandert.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Der Figma-Variablenname und die CSS Custom Property sind ähnlich, nicht identisch:
`border-width/default` ist `--ui-border-width`. Ein Property-Name, den der Agent aus einem
Figma-Namen abgeleitet hat, ist geraten, bis er nachgeschlagen wurde.

## Sichtbar machen

Der Agent speichert eine Komponente; auf den Bildschirm bringt er sie nur, wenn Du es sagst.
Solange die Card nicht eingebunden ist, gibt es nichts, was Du mit Figma vergleichen kannst.

### Karte: Card in die App einbinden

**Ziel.** Die Settings Card erscheint in der App, und Du hast sie mit `npm start` selbst im
Browser gesehen.

**Material.** Die generierte Komponente, die Datei, in der die App ihre Startseite
zusammensetzt, `npm start`.

**Rahmen.**

- Eine Änderung pro Prompt: nur einbinden, die Komponente bleibt unberührt.

**Fertig, wenn** `npm start` die Card anzeigt und Du sie selbst gesehen hast.

**Kür.**

- Zeig die Card in zwei Breiten (Fenster schmal ziehen) und notiere, was sich verändert.
- Lass den Agenten die Einbindung wieder entfernen und neu machen, und vergleiche die
  beiden Diffs.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

## Wenn der erste Entwurf bei den Tokens noch abweicht

Modelle, die Muster nachahmen, fallen manchmal auf einen festen px- oder Hex-Wert zurück,
auch wenn man es ihnen verboten hat. Eine kurze Korrektur reicht statt eines kompletten
neuen Prompts.

### Karte: Token-Korrektur

**Ziel.** Kein Inline-Style und kein CSS-Wert der Card ist ein fester Wert: alles ist ein
`var(--ui-*)`.

**Material.** Die Dateien der Card, die kanonische Card-Dokumentation über `docs-show` für
AtlCard: Ihre Überschrift nutzt `var(--ui-font-size-lg)` und `var(--ui-color-text)`, Padding
und Gap der Card selbst sind `var(--ui-spacing-6)` und `var(--ui-spacing-4)`.

**Rahmen.**

- Jeder Wert der Card ist eine `--ui-*` Custom Property: kein festes px, kein Hex, keine Tailwind-Klasse.
- Der Agent fasst nur die Card an.

**Fertig, wenn** keine Zeile der Card mehr einen festen Wert enthält und der Agent jede
Änderung benannt hat.

**Kür.**

- Such mit `grep` selbst nach `#`, `px` und `rgb` in den Dateien der Card und vergleiche mit
  der Liste des Agenten.
- Lass den Agenten für zwei Token begründen, warum er genau dieses gewählt hat, und prüfe die
  Begründung am Figma-Frame.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Ein Font-Weight wie `600` in einer `.css`-Datei fällt ebenfalls bei `npm run check:stylelint`
durch; das Token ist `var(--ui-font-weight-semibold)`.

## Der Agent prüft sich selbst (11:00 bis 11:10)

{{LADDER}}

## Der Vergleich mit Figma

Heute vergleichst Du nach Augenmaß; die Schritte stehen in `parity-prompt.md`. Mach das nicht
an einer Komponente, bei der Lint oder Build fehlschlägt. Das Parity-Werkzeug kommt an Tag 2.
