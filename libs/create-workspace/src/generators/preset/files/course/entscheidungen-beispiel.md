# Entscheidungsdatei: ein ausgefülltes Beispiel

Verwendet in Tag 2, Block 01 (der Agent entwirft, Du beantwortest die offenen Fragen), Block 02
(gebaut wird daraus), Block 03 (Stimmen die Entscheidungen noch?) und Block 04 (die Datei wird
mit der Komponente committet). Das hier ist die Datei, ausgefüllt für den Toast-Brief
(`briefs/toast.md`), in {{FRAMEWORK}}. Wer eine eigene Idee baut, schreibt im Kopf `Ticket: eigene Idee` und trägt seinen Zweck-Satz als ersten Eintrag der Art Umfang ein. Im Projekt heißt sie `<Komponente>.decisions.md` und
liegt neben dem Quellcode der Komponente.

**Warum sie bleibt.** In Monaten fragt jemand, warum der Toast bei Fokus nicht pausiert oder
warum der Schatten nur in CSS steht. Die Antwort steht nicht im Code und nicht in Figma, sondern
in der Entscheidung und ihrem Grund. Die Datei wird mit der Komponente committet und bleibt.

**Warum sie nicht veraltet.** Sie ist ein datierter Verlauf: Ein Eintrag wird nie geändert
und nie gelöscht, eine Änderung ist ein neuer Eintrag, der den alten nennt. Der aktuelle Stand
steht in den Tests, in Figma und im Code, nicht hier.

**Ein Ort pro Tatsache.** Nichts steht an zwei Orten, denn die zweite Kopie driftet.

| Tatsache                           | Steht in                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------- |
| Anforderung, Story-Text            | Ticket (in der Datei nur der Schlüssel)                                   |
| Aussehen, Varianten, Tokens        | Figma                                                                     |
| API, Props                         | Code und `docs-show`                                                      |
| Verhalten im Detail                | `play`-Tests (die Datei sagt nur, DASS und WARUM es so entschieden wurde) |
| Warum, Herkunft einer Entscheidung | Entscheidungsdatei                                                        |

**Was nicht hineingehört.** Ein Eintrag hält nur fest, was langsam altert: die Entscheidung und
ihren Grund. Keine aktuellen Werte oder Zahlen, keine Variantenlisten, keine Token-Bindungen,
keine Größen, keine Props, keine Zieldateien und keine Kopie des Ticket-Texts, nur der Verweis.

Der Name ist vergeben: `@atelier-ui/{{FRAMEWORK_LC}}` hat schon einen eigenen Toast (in
Angular wird er als `AtlToast` exportiert) mit einer anderen API. Diese Datei beschreibt den,
den Du baust. Wenn der Agent fragt, welchen Du meinst, sag es, und lass ihn nicht den der
Bibliothek importieren.

---

# AtlToast · {{FRAMEWORK}}

- **Ticket:** course/briefs/toast.md
- **Figma:** `<Datei-Key meiner Kopie>`, Node `<Node-ID meiner Kopie>` (kopiert aus dem
  Starter-Frame `Toast / Starter`, Node `703:341`; Draft-URL: <Draft-URL>)

## Offene Fragen

- Nach wie vielen Sekunden schließt der Toast automatisch? Der Brief sagt „konfigurierbar“
  und nennt keine Zahl.

## Entscheidungen

- 2026-11-23 · course/briefs/toast.md · Umfang: Der Toast ist eine neue Komponente, kein Alert,
  der inline stehen bleibt, und kein Dialog, der blockiert; das Statussymbol nutzt AtlIcon
  wieder. Grund: Der Brief beschreibt eine kurzlebige Meldung, die nichts blockiert. Entschieden
  von: Teilnehmer:in.
- 2026-11-23 · course/briefs/toast.md · Umfang: Info, Warning, Positionen außer einer Ecke,
  Stapeln und der Fortschrittsindikator sind bewusst draußen. Grund: Die Zeit reicht für zwei
  Varianten, und jeder dieser Punkte bräuchte eine eigene Verhaltensentscheidung. Entschieden
  von: Teilnehmer:in.
- 2026-11-23 · course/briefs/toast.md · Verhalten: Der Toast pausiert den Timer bei
  pointer-enter und bei focus-in und läuft danach weiter, statt neu zu starten. Grund: Wer
  gerade liest oder die Meldung per Tastatur erreicht hat, darf sie nicht verlieren.
  Entschieden von: Teilnehmer:in.
- 2026-11-23 · course/briefs/toast.md · Verhalten: Escape schließt den Toast, solange der Fokus
  in ihm liegt. Grund: Tastaturnutzer brauchen denselben Ausweg wie Mausnutzer. Entschieden
  von: Teilnehmer:in.
- 2026-11-23 · course/briefs/toast.md · Bewusste Abweichung: Hover und focus-visible sind nur
  CSS und keine Varianten im Master. Grund: Es sind Zustände des Browsers, keine Entscheidungen
  des Designs. Entschieden von: Teilnehmer:in.
- 2026-11-24 · course/briefs/toast.md · Verhalten: Der Timer pausiert nur bei pointer-enter,
  nicht mehr bei focus-in; ersetzt den Eintrag vom 2026-11-23 zur Pause. Grund: Der Fokus
  liegt nach dem Auslösen oft schon im Toast, er würde dann nie schließen. Entschieden von:
  Teilnehmer:in.
