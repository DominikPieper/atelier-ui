# Tag 1, Block 02: die Settings-Seite

Gebraucht in Tag 1, Block 02. Der Figma-Frame „Settings / Seite“ (Seite Workshop-Templates,
Section „Tag 1 · Settings-Seite“) wird eine {{FRAMEWORK}}-Seitenkomponente, gebaut aus
`@atelier-ui/{{FRAMEWORK_LC}}`. Die Bridge muss verbunden sein (siehe `rescue.md`). Wähle den
Frame in Figma aus, während Claude Code schon läuft: Eine Auswahl, die vor dem Start der
Session getroffen wurde, sieht der Agent nicht. Meldet der Agent, dass nichts ausgewählt ist,
klicke den Frame noch einmal an. Daneben liegt „Settings / Seite · Dark“, derselbe Entwurf im
Dark-Modus; den brauchst Du nur für die Kür.

Die Prompts schreibst Du selbst. Die Karten sagen Dir, was am Ende da sein muss, womit der
Agent arbeitet und welche Regeln Dein Prompt tragen muss. `prompt-rubrik.md` listet die sechs
Prüfungen, an denen Du ihn misst.

## Die Seite generieren

### Karte: Settings-Seite generieren

**Ziel.** Eine {{FRAMEWORK}}-Seitenkomponente „Settings-Seite“, die aus Bibliothekskomponenten
(AtlInput, AtlSelect, AtlToggle, AtlRadio, AtlCheckbox, AtlButton, AtlAlert, gruppiert in
Karten) und Tokens besteht, nicht aus eigenen Bausteinen, und deren Token-Zuordnung Du
nachprüfen kannst. Die Seite verhält sich so:

- „Speichern“ ist deaktiviert, solange sich nichts geändert hat.
- Eine ungültige E-Mail zeigt den Fehlerzustand des Feldes „E-Mail“ und eine Meldung.
- „Abbrechen“ setzt alle Felder auf den gespeicherten Stand zurück.
- Nach dem Speichern erscheint die Erfolgsmeldung.

**Material.**

- Der ausgewählte Frame „Settings / Seite“ in Figma, gelesen mit
  `figma_get_component_for_development` (figma-console-mcp): `boundVariables` und die
  visuelle Referenz.
- Der MCP-Server `{{MCP}}` mit `docs-list` und `docs-show` für jede Komponente, die die Seite
  nutzt.

**Rahmen.**

- Gebaut wird aus Bibliothekskomponenten und `--ui-*`-Tokens: keine festen px-Werte, kein Hex, keine Tailwind-Klassen.
- Eine Prop, die `docs-show` nicht kennt, gibt es nicht.
- Das Verhalten steht in Deinem Prompt, nicht erst im Nachgang: Der Frame zeigt nur Zustände, keine Logik.

**Fertig, wenn** die Komponente existiert, jede Prop eine `docs-show`-Quelle hat, die Liste
„Variable, Token“ des Agenten vollständig ist (oder offene Zuordnungen benennt) und Du jede
der vier Verhaltenszeilen an der laufenden Seite selbst ausprobiert hast.

**Kür.**

- Prüfe die Seite gegen „Settings / Seite · Dark“ und notiere, was im Dark-Modus nicht
  mitwandert.
- Geh die Seite nur mit der Tastatur durch (Tab, Leertaste, Enter) und notiere, wo der Fokus
  hängen bleibt oder fehlt.
- Ergänze eine zweite Validierung, die der Frame nicht zeigt, aus den dokumentierten Props
  eines Feldes, und lass sie mit einem Test festhalten.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Der Figma-Variablenname und die CSS Custom Property sind ähnlich, nicht identisch:
`border-width/default` ist `--ui-border-width`. Ein Property-Name, den der Agent aus einem
Figma-Namen abgeleitet hat, ist geraten, bis er nachgeschlagen wurde.

## Sichtbar machen

Der Agent speichert eine Komponente; auf den Bildschirm bringt er sie nur, wenn Du es sagst.
Solange die Seite nicht eingebunden ist, gibt es nichts, was Du mit Figma vergleichen kannst.

### Karte: Seite in die App einbinden

**Ziel.** Die Settings-Seite erscheint in der App, und Du hast sie mit `npm start` selbst im
Browser gesehen.

**Material.** Die generierte Komponente, die Datei, in der die App ihre Startseite
zusammensetzt, `npm start`.

**Rahmen.**

- Eine Änderung pro Prompt: nur einbinden, die Komponente bleibt unberührt.

**Fertig, wenn** `npm start` die Seite anzeigt und Du sie selbst gesehen hast.

**Kür.**

- Zeig die Seite in zwei Breiten (Fenster schmal ziehen) und notiere, was sich verändert.
- Lass den Agenten die Einbindung wieder entfernen und neu machen, und vergleiche die
  beiden Diffs.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

## Wenn der erste Entwurf bei den Tokens noch abweicht

Modelle, die Muster nachahmen, fallen manchmal auf einen festen px- oder Hex-Wert zurück,
auch wenn man es ihnen verboten hat. Eine kurze Korrektur reicht statt eines kompletten
neuen Prompts.

### Karte: Token-Korrektur

**Ziel.** Kein Inline-Style und kein CSS-Wert der Seite ist ein fester Wert: alles ist ein
`var(--ui-*)`.

**Material.** Die Dateien der Seite, die kanonische Dokumentation über `docs-show` für die
Komponenten der Seite, die Token-Zuordnung aus dem Frame (`boundVariables`).

**Rahmen.**

- Jeder Wert der Seite ist eine `--ui-*` Custom Property: kein festes px, kein Hex, keine Tailwind-Klasse.
- Der Agent fasst nur die Seite an.

**Fertig, wenn** keine Zeile der Seite mehr einen festen Wert enthält und der Agent jede
Änderung benannt hat.

**Kür.**

- Such mit `grep` selbst nach `#`, `px` und `rgb` in den Dateien der Seite und vergleiche mit
  der Liste des Agenten.
- Lass den Agenten für zwei Token begründen, warum er genau dieses gewählt hat, und prüfe die
  Begründung am Figma-Frame.

**Hängst Du fest?** Sieh in `prompt-rubrik.md` nach und in {{STUCK_REF}}.

Ein Font-Weight wie `600` in einer `.css`-Datei fällt ebenfalls bei `npm run check:stylelint`
durch; das Token ist `var(--ui-font-weight-semibold)`.

## Der Agent prüft sich selbst (11:00 bis 11:10)

{{LADDER}}

## Der Vergleich mit Figma

Heute vergleichst Du nach Augenmaß; die Schritte stehen in `parity.md`. Mach das nicht
an einer Komponente, bei der Lint oder Build fehlschlägt. Das Parity-Werkzeug kommt an Tag 2.
