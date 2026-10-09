# ADR-0016: Contract-Schicht zwischen Figma und Code

- Status: Entwurf
- Datum: 2026-10-09
- Ersetzt: in [ADR-0015](0015-figma-links-an-stories.md) den Punkt „Keine Figma-Skripte und kein Gate im Repo“. Gültig bleiben dort die Figma-Links an den Stories.
- Ergänzt: [ADR-0014](0014-repo-layout-packages-apps-templates-tools.md) (ein viertes Paket unter `packages/`, Figma-Daten unter `tools/`), [ADR-0010](0010-release-ausloesung-und-versionsquelle.md) und [ADR-0011](0011-veroeffentlichung-auf-npmjs.md) (das Paket läuft in derselben Release-Kette).

## Kontext

Die Conciso-Schulung „Atelier“ (Design-to-Code mit KI) nutzt künftig das CDS als Übungsobjekt statt einer eigenen Komponentenbibliothek (Atelier ADR-0165). Teil der Methode ist eine Contract-Schleife: Pro Komponente hält ein kleiner Contract nur die **bewussten** Abweichungen zwischen Figma-Master und Code fest, etwa deutsche Figma-Namen gegen englische Props. Ein Offline-Check vergleicht dann vier Quellen: Contract, Docgen der Komponente, die `args` der Stories und einen eingefrorenen Snapshot der Figma-Master. Alles, was nicht im Contract steht und trotzdem abweicht, ist ein Befund.

ADR-0015 hat Figma-Skripte und Gates ausgeschlossen, weil nur eine Person im Team die Bridge zu Figma Desktop hat. Dieser Grund betrifft nur das **Auffrischen** des Snapshots. Der Check selbst liest nur Dateien im Repo und braucht weder Figma noch Netz.

Ein Spike am 2026-10-09 auf dem Branch `spike/atelier-kata-2026-10-09` hat die Schleife am Snackbar durchgespielt:

- Snapshot und Check liefen, Exit 0.
- Der Parity-Abgleich in Figma war optisch deckungsgleich. Die einzigen Abweichungen waren Namen, und die hält der Contract fest.
- Die 233 Story-Tests blieben grün.
- Nebenbei zeigten sich zwei echte Befunde am Figma-Master:
  - Im Snackbar sind in `Ton=ok/err` die Texte nicht an die Properties gebunden.
  - Achsennamen mischen Deutsch und Englisch (`State`/`Zustand`, `Tone`/`Ton`, `Variant`/`Variante`).

## Entscheidung

1. **Contracts und Snapshot liegen unter `tools/figma/`**: `tools/figma/contracts/<name>.contract.ts` und `tools/figma/snapshot.json`, beide in Git. Sie werden nicht veröffentlicht. Konfiguration in `contracts.config.json` an der Wurzel.
2. **`check:contracts` ist ein Offline-Gate in der CI.** Es prüft Contract, Docgen, Stories und Snapshot gegeneinander und braucht keinen Figma-Zugang. Es kann niemanden blockieren, weil Figma erst mit dem nächsten Snapshot ins Spiel kommt.
3. **Der Snapshot wird von Hand aufgefrischt**, von der Person mit Bridge: `figma-snapshot-contracts --file BQCBQwIDcconnYNpb2w9fn`. Kein CI-Schritt spricht mit Figma. Was nach einem Refresh rot wird, ist eine echte Änderung in Figma. Der Refresh-Commit klärt sie: entweder den Contract nachziehen oder den Code anpassen.
4. **Das Werkzeug ist das Paket `@conciso/design-contracts` unter `packages/contracts`.** Es wird über dieselbe Release-Kette veröffentlicht wie die anderen Pakete. Es bleibt neutral gegenüber dem Design System: Pfade und Token-Präfixe kommen aus der Konfiguration, und die Tests laufen an einer Fixture, die nicht aus dem CDS stammt. Schulungsteilnehmer setzen es für ihr eigenes Design System ein. Bis zum Umzug entsteht es im Atelier-Repo und wird dort nicht veröffentlicht.
5. **Contracts gibt es für alle Komponenten mit Figma-Master.** Gepflegt werden sie vom CDS-Team. Was in Schulungen entsteht, bleibt in deren Workspaces. Das CDS nimmt keine Beiträge aus Schulungen an, sondern ergänzt bei Bedarf selbst.

## Begründung

- Der Grund aus ADR-0015 bleibt bestehen und wird nur genauer gefasst. Gesperrt ist, wer **auffrischen** muss, nicht wer **prüft**. Ein Gate, das nur Dateien im Repo liest, kann jeder grün halten.
- Bewusste Abweichungen stehen mit Begründung an einer Stelle. Heute stecken sie in Köpfen, oder sie fallen erst beim Bauen eines Prototyps auf.
- Die Befunde aus dem Spike zeigen, dass die Schleife echte Lücken in der Übergabe zwischen Figma und Code findet. Davon haben auch die Nutzer des CDS etwas, nicht nur die Schulung.
- Liegt das Paket im CDS-Repo, hat es seinen einzigen Nutzer mit CI direkt daneben, und für die Veröffentlichung braucht es keine zweite Release-Kette.

## Bewusst nicht gewählt

- **Ein Gate, das live gegen Figma prüft.** Daran scheitert ADR-0015 zu Recht, denn in der CI gibt es keine Bridge.
- **Contracts nur im Schulungs-Workspace.** Das wäre technisch möglich, aber Befunde und bewusste Abweichungen kämen dann nie im CDS an.
- **Die Skripte ins Repo kopieren statt ein Paket zu nutzen.** Die Kopie im Spike ist sofort auseinandergelaufen (`"type": "module"`, fehlendes Ausgabeverzeichnis).
- **Die Contracts in `packages/angular` neben die Komponenten legen.** Dann würden sie nach Code aussehen, der ausgeliefert wird. Sie sind aber Daten, die nur das Repo selbst braucht, und gehören deshalb nach ADR-0014 unter `tools/`.

## Folgen

- Etwa 55 Contracts sind zu schreiben. Der Aufwand ist geschätzt, gespikt wurde nur eine Komponente.
- Ändert jemand einen Figma-Master und frischt den Snapshot nicht auf, merkt das Gate nichts. Bis zum nächsten Refresh zeigt es den letzten bekannten Stand. Das ist der Preis dafür, dass die CI keinen Zugang zu Figma braucht.
- Der Parity-Abgleich (`figma_check_design_parity`) bleibt ein Schritt von Hand mit Bridge. `check:contracts --emit` liefert ihm einen codeSpec in Figma-Namen, damit dort nur echte Abweichungen erscheinen.
- Das neue Paket bekommt die gemeinsame Versionsnummer (`v${version}`). Ob der Pfadfilter (`relevant-paths.mjs`) Releases des Werkzeugs sauber von Releases des Design Systems trennt, wird beim Umzug geprüft.
- Die gemischten Achsennamen in Figma bleiben vorerst so, wie sie sind. Der Contract hält sie fest. Ob man sie vereinheitlicht, ist eine eigene Entscheidung.
