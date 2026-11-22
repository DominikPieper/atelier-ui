# Rescue: wenn Dein Platz rot ist

Nutze das, wenn `npm run preflight` nach dem Setup-Block noch rot ist oder ein echter
Prompt fehlschlägt. Das Setup hat drei unabhängige Teile: die Claude Code CLI, die
MCP-Server und den Modellzugang. Preflight prüft die ersten beiden. Der Modellzugang ist
nur durch eine echte Anfrage bewiesen.

## 1. Benenne, was fehlt

Lies die Preflight-Ausgabe und entscheide, welcher der drei Teile fehlt: die CLI, ein
MCP-Server oder der Modellzugang. Behebe genau den, nicht alles auf einmal.

## 2. Modellzugang

`claude --version` und ein grüner Preflight beweisen nur, dass die CLI installiert ist.
Beweise den Modellzugang mit einer echten Anfrage:

```shell
claude -p "Reply with exactly: PREFLIGHT-OK"
```

Verlangt sie eine Anmeldung oder endet mit einem Authentifizierungsfehler: Im Kurs sind die
Rechner vorbereitet, und die Anmeldung läuft im Raum (`claude auth login`, dann die
Anmeldung im Browser abschließen). Sag dem Trainer Bescheid.

## 3. MCP-Server

Führe `npm run preflight` aus, starte dann `claude` im Workspace-Root (dem Ordner mit der
`.mcp.json`) und tippe `/mcp`.

- **Keine Server aufgelistet, oder „Pending approval“.** Claude Code wurde gestartet, bevor
  die `.mcp.json` existierte, oder aus einem anderen Ordner. Schließ es, starte `claude` im
  Workspace-Root, bestätige die Abfrage „Trust this folder“ und genehmige die
  Projekt-Server, wenn danach gefragt wird. Hast Du einen früher abgelehnt:
  `claude mcp reset-project-choices`, dann `claude` neu starten.
  {{MCP_RESCUE}}
- **`storybook-local` ist nicht verbunden.** Storybook läuft nicht. Starte es mit
  `npm run storybook`; die Tools erscheinen von selbst. Wenn nicht: `/mcp` und
  `storybook-local` neu verbinden. Ist der Port 6006 belegt, finde zuerst den Prozess
  (`lsof -nP -iTCP:6006 -sTCP:LISTEN`) und beende genau den. Töte nichts, was Du Dir nicht
  angesehen hast. `storybook-local` fragt fest Port 6006 ab: Ein Storybook auf einem anderen
  Port (6007) liest der Agent nicht, und ein fremdes Storybook auf 6006 liest er statt Deines.
  Prüfe vor jedem Lauf, dass auf 6006 Dein Storybook antwortet.
- Bearbeite die `.mcp.json` nicht und füge keinen Server von Hand hinzu: Die Einträge sind
  Teil des Workspace. Ein Platz, der rot bleibt, arbeitet ohne `storybook-local` weiter: Das
  Storybook im Browser und `npm run check:stories` zeigen dasselbe Ergebnis.

## 4. Storybook startet nicht (Port belegt)

`EADDRINUSE` heißt, dass noch ein früherer Dev-Server läuft. Sieh nach, was den Port hält:
`lsof -nP -iTCP:<Port> -sTCP:LISTEN`. Beende den Prozess nur, wenn er der veraltete
Dev-Server ist. Die App läuft auf Port 4200 (`npm start -- --port 4300` für einen anderen
Port), Storybook ist fest auf 6006: `npm run storybook` bricht bei belegtem Port mit einer
Fehlermeldung ab (`--exact-port`), statt still auf 6007 auszuweichen. Das Beenden des
Prozesses auf 6006 und ein neuer Start löst es. Die Prüfung vorab:
`lsof -nP -iTCP:6006 -sTCP:LISTEN` (keine Ausgabe heißt: frei).
{{FIGMA_RESCUE}}

## Noch rot

Repariere einen kaputten Workspace nicht selbst: Sag dem Trainer Bescheid, der Rechner ist
seine Sache. Wer im Setup-Block noch rot ist, setzt sich zu einem Nachbarn (eine Tastatur,
der Nachbar steuert). Niemand startet Tag 2 rot: Der Check durch den Trainer findet in der
Kaffeepause oder in der Mittagspause statt, nicht als Hausaufgabe.

Noch rot: frag Deinen Nachbarn, dann den Trainer.
