# RefToast · Angular

- **Ticket:** course/briefs/toast.md
- **Figma:** `<Datei-Key meiner Kopie>`, Node `55:47` (der AtlToast-Master der Bibliothek, als
  Vorlage gelesen; die Node-ID bleibt in einer Kopie gleich)

## Offene Fragen

- keine

## Entscheidungen

- 2026-11-23 · course/briefs/toast.md · Umfang: Der Toast ist eine neue Komponente, kein Alert,
  der inline stehen bleibt, und kein Dialog, der blockiert; das Statussymbol nutzt AtlIcon
  wieder. Grund: Der Brief beschreibt eine kurzlebige Meldung, die nichts blockiert. Entschieden
  von: Referenz.
- 2026-11-23 · course/briefs/toast.md · Umfang: Info, Warning, Positionen außer einer Ecke,
  Stapeln und der Fortschrittsindikator sind bewusst draußen. Grund: Die Zeit reicht für zwei
  Varianten, und jeder dieser Punkte bräuchte eine eigene Verhaltensentscheidung. Entschieden
  von: Referenz.
- 2026-11-23 · course/briefs/toast.md · Verhalten: Der Toast pausiert den Timer bei
  pointer-enter und bei focus-in und läuft danach weiter, statt neu zu starten. Grund: Wer
  gerade liest oder die Meldung per Tastatur erreicht hat, darf sie nicht verlieren.
  Entschieden von: Referenz.
- 2026-11-23 · course/briefs/toast.md · Verhalten: Escape schließt den Toast, solange der Fokus
  in ihm liegt. Grund: Tastaturnutzer brauchen denselben Ausweg wie Mausnutzer. Entschieden
  von: Referenz.
- 2026-11-23 · course/briefs/toast.md · Bewusste Abweichung: Hover und focus-visible sind nur
  CSS und keine Varianten im Master. Grund: Es sind Zustände des Browsers, keine Entscheidungen
  des Designs. Entschieden von: Referenz.
- 2026-11-24 · course/briefs/toast.md · Verhalten: Der Timer pausiert nur bei pointer-enter,
  nicht mehr bei focus-in; ersetzt den Eintrag vom 2026-11-23 zur Pause. Grund: Der Fokus
  liegt nach dem Auslösen oft schon im Toast, er würde dann nie schließen. Entschieden von:
  Referenz.
- 2026-11-24 · course/briefs/toast.md · Verhalten: Der Toast schließt von selbst nach einer
  Dauer, die der Aufrufer setzen kann; ohne Angabe gilt ein Standard. Grund: Der Brief sagt
  „konfigurierbar“ und nennt keine Zahl; ein Standard hält den einfachen Aufruf kurz.
  Entschieden von: Referenz.
- 2026-11-24 · course/briefs/toast.md · Sonstiges: Der Toast heißt RefToast und setzt sich nicht
  selbst an eine Ecke; der Aufrufer legt ihn dorthin. Grund: AtlToast gehört der Bibliothek
  und Dein eigener Toast aus dem Brief soll daneben bestehen können; Positionieren und
  Stapeln sind ohnehin draußen. Entschieden von: Referenz.
