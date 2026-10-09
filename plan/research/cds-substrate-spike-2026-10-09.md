# Spike: Conciso Design System als Übungsobjekt der Schulung (2026-10-09)

Frage des Owners: Die eigene Komponentenbibliothek rauswerfen und die Schulung auf das Conciso
Design System (CDS) umstellen? Änderungen dort nützen auch anderen Nutzern und Schulungen.

Spike auf `conciso-design-system`, Branch `spike/atelier-kata-2026-10-09` (von `main` 96368b2,
2026-10-08), Commits c9308ae und 3011cb5. Nicht gepusht, nicht zum Mergen.

## Fakten zum CDS (gelesen)

- **Aufbau:** CSS-Klassen auf semantischem HTML plus Vanilla-JS. Darüber eine Angular-Lib mit
  dünnen Wrappern (`cds-*`-Selektoren, Klassen `*Component`, CDS-ADR-0001/0008). Kein React, kein Vue.
- **Infrastruktur:** Storybook 10.6 mit `addon-vitest`, `addon-a11y`, `addon-mcp`, `addon-designs`;
  eigener MCP-Server; npm-Paket (MIT); Storybook auf GitHub Pages.
- **Figma:** `BQCBQwIDcconnYNpb2w9fn`, öffentlich lesbar. Die Stories verlinken die Master per
  `parameters.design`.
- **Kein Figma-Gate, bewusst:** CDS-ADR-0015: „Keine Figma-Skripte und kein Gate im Repo … Die
  Bridge zu Figma Desktop hat nur eine Person im Team.“

## Ergebnisse

| #   | Frage                                              | Ergebnis                                                                                                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Master lesbar und übergabereif?                    | **Ja.** `figma_get_component_for_development` auf Snackbar `4:5222` liefert alles. Alle 63 Master haben ihre Fills zu 82–100 % an Variablen gebunden. Die Beschreibung nennt Selektor, CSS-Klasse und Tokens. 13 der 63 Master haben keine Beschreibung.                                                                                                                               |
| S2  | Kata-Ziel?                                         | **Keine offene Lücke.** Der Code deckt praktisch alle 63 Master ab. Eine Kata müsste entweder eine neue Komponente einführen (Design zuerst in Figma) oder eine Komposition aus CDS-Komponenten bauen wie heute die SettingsCard.                                                                                                                                                      |
| S3  | Contract-Schleife portierbar?                      | **Ja, mit zwei kleinen Pfadfixes.** Die `create-workspace`-Skripte laufen im CDS-Repo. Snapshot plus `check-contracts` enden mit Exit 0 (0 Fehler, 61 Warnungen: 54 × kein Contract, 5 × Story-Args nicht statisch auflösbar, 1 × `[UNMIRRORED]`, 1 × `[CONTRACT-IMPORT]`). Nötig waren `ts-eval.js` → `.cjs` (CDS hat `"type": "module"`) und ein von Hand angelegtes `tools/figma/`. |
| S3b | Parity?                                            | **Optik deckungsgleich.** Fläche, Radius, Padding, Gap, Typografie und beide Schatten stimmen. Alle 7 Abweichungen sind Namen (`Ton`↔`tone`, `Meldung`↔`message`, `Aktion`↔`actionLabel`, `Aktion anzeigen`). Der Contract hält genau diese Abweichungen fest, das Parity-Tool liest ihn aber nicht.                                                                                   |
| S4  | Story-Tests?                                       | **Grün:** 58 Dateien, 233 Tests, 32 s (nach `npm run playwright:install`).                                                                                                                                                                                                                                                                                                             |
| S5  | Wie stark hängt Atelier an der eigenen Bibliothek? | Docs ca. 6 methodisch / 18 mit Atelier-Beispielen / 6 über die Bibliothek selbst (Heuristik nach Trefferdichte, nicht ganz gelesen). Skills: `figma-workspace-architect` generisch, `design-to-code` mit Repo-Zweig, `atelier-design` fällt weg. `create-workspace` hängt fest an `@atelier-ui/*`. Ca. 24 von 47 Gates betreffen die Bibliothek selbst.                                |

## Befunde am CDS selbst (Stoff für die Schulung, nicht behoben)

- **Snackbar-Master:** In `Ton=ok` und `Ton=err` sind Meldungs- und Aktionstext nicht an die
  Text-Properties `Meldung`/`Aktion` gebunden, nur in `Ton=def`. Ein Override wirkt also nur auf
  eine von drei Varianten. Das ist ein Befund zur Übergabe-Reife (A10).
- **Achsennamen gemischt Deutsch/Englisch:** `State` (Button, Chip, Textfeld, Checkbox, Slider)
  neben `Zustand` (Combobox, Topnav, Logo-Carousel); `Tone` (Status-Badge) neben `Ton` (Snackbar);
  `Variant` (Button) neben `Variante` (Logo, Carousel, Tabelle, Code-Block). Das ist Stoff für die
  Benennungs-Übung (B5).
- **Contract-Format passt:** Deutsche Figma-Namen gegen englische Code-Namen sind genau die
  „bewussten Abweichungen“, für die `axisMap` und `figmaOnly` gedacht sind.

## Was am Werkzeug fehlt (bei einem Wechsel zu tun)

1. Das Snapshot-Skript liest die aktive Figma-Datei und scheitert, wenn eine zweite Datei per
   Bridge verbunden ist. `--file` sollte unter den verbundenen Dateien wählen.
2. Das Snapshot-Skript legt sein Ausgabeverzeichnis nicht an.
3. `ts-eval.js` scheitert in Repos mit `"type": "module"`; das Scaffold sollte `.cjs` liefern.
4. Der Token-Scan in `--emit` erkennt nur `--ui-*`. Für das CDS (`--n-*`, `--c-*`, `--s*`, `--r-*`,
   `--e*`, `--ty-*`) blieb `usedTokens` leer. Das ist aus dem leeren Ergebnis gefolgert, der Scanner
   wurde nicht gelesen.
5. Parity gegen deutsche Figma-Namen: Der API-Teil des Berichts ist reines Rauschen, solange der
   codeSpec die `axisMap` des Contracts nicht anwendet.

## Offene Fragen an den Owner und das CDS-Team

- Darf eine Contract-/Snapshot-Schicht ins CDS-Repo (CDS-ADR-0015 ersetzen), oder lebt sie im
  Schulungs-Workspace? Die Mechanik funktioniert an beiden Orten. Der Grund des CDS-Teams betrifft
  nur den Snapshot-Refresh, `check-contracts` selbst läuft offline.
- Nimmt das CDS Beiträge aus Schulungen an, und wer reviewt sie?
- Schulung künftig nur noch Angular? Das CSS-Fundament hält React/Vue technisch offen, aber die
  Wrapper fehlen.

## Nicht geprüft

- Kein Parity-Lauf außer an der Snackbar; keine zweite Komponente mit Contract.
- Die Kata selbst wurde nicht durchgespielt (keine Komponente generiert).
- Ein Workspace außerhalb des CDS-Repos, der das npm-Paket nutzt, wurde nicht ausprobiert.
