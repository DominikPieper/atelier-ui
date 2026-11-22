# Tag 1, Block 02: die Settings Card

Gebraucht in Tag 1, Block 02. Der Figma-Frame „Settings / Card“ wird eine
{{FRAMEWORK}}-Komponente, gebaut aus `@atelier-ui/{{FRAMEWORK_LC}}`. Die Bridge muss
verbunden sein (siehe `rescue.md`). Wähle den Frame in Figma aus, während Claude Code schon
läuft: Eine Auswahl, die vor dem Start der Session getroffen wurde, sieht der Agent nicht.
Meldet der Agent, dass nichts ausgewählt ist, klicke den Frame noch einmal an.

## Die Komponente generieren

```text
Ich habe in Figma den Frame "Settings / Card" ausgewählt.

1. Nutze figma-console MCP (figma_get_component_for_development), um die Spec des
   Frames zu lesen. Ich brauche die boundVariables und die visuelle Referenz.
2. Nutze {{MCP}} MCP, um die Props von AtlCard, AtlInput, AtlToggle
   und AtlButton nachzuschlagen.
3. Erzeuge die {{FRAMEWORK}}-Komponente mit:
   - den Atelier-UI-Komponenten, die Du aus Storybook zugeordnet hast
   - den Tokens hinter den boundVariables des Frames: Löse jede Variable zu
     ihrem Namen auf und nutze die passende --ui-* Custom Property. Passt ein Name
     nicht exakt, sag das, statt zu raten.
```

Der Figma-Variablenname und die CSS Custom Property sind ähnlich, nicht identisch:
`border-width/default` ist `--ui-border-width`. Ein Property-Name, den der Agent aus einem
Figma-Namen abgeleitet hat, ist geraten, bis er nachgeschlagen wurde.

## Sichtbar machen

Der Agent speichert eine Komponente; auf den Bildschirm bringt er sie nur, wenn Du es sagst.
Solange die Card nicht eingebunden ist, gibt es nichts, was Du mit Figma vergleichen kannst.

```text
Ich sehe die Card nirgends. Binde sie in die App ein, damit ich sie mit npm start ansehen kann.
```

## Wenn der erste Entwurf bei den Tokens noch abweicht

Modelle, die Muster nachahmen, fallen manchmal auf einen festen px- oder Hex-Wert zurück,
auch wenn man es ihnen verboten hat. Füge diese Einzeiler-Korrektur ein statt eines
kompletten neuen Prompts:

```text
Prüfe jeden Inline-Style und jeden CSS-Wert, die Du gerade geschrieben hast, noch einmal
gegen var(--ui-*). Die Überschrift von AtlCard im kanonischen Beispiel nutzt
var(--ui-font-size-lg) für die Größe und var(--ui-color-text) für die Farbe, und Padding
und Gap der Card selbst sind var(--ui-spacing-6) / var(--ui-spacing-4): kein festes px,
kein Hex, keine Tailwind-Klasse. Ersetze alles, was keine --ui-* Custom Property ist,
durch die passende und sag mir, welche Zeile Du geändert hast.
```

Ein Font-Weight wie `600` in einer `.css`-Datei fällt ebenfalls bei `npm run check:stylelint`
durch; das Token ist `var(--ui-font-weight-semibold)`.

## Der Agent prüft sich selbst (11:00 bis 11:10)

{{LADDER}}

## Der Vergleich mit Figma

Heute vergleichst Du nach Augenmaß; die Schritte stehen in `parity-prompt.md`. Mach das nicht
an einer Komponente, bei der Lint oder Build fehlschlägt. Das Parity-Werkzeug kommt an Tag 2.
