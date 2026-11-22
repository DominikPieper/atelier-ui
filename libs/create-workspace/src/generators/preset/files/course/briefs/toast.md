# Komponenten-Brief: Toast

> **Quelle:** eine kanonische Komponente, abgebildet auf das `Library Tokens`-Vokabular von Atelier.
> **Starter-Frame:** `Toast / Starter`, Node `703:341` auf der Seite `🛠️ Workshop-Templates`.
> **Lies zuerst [`README.md`](README.md).** Die gemeinsamen Regeln und die Messlatte „Fertig, wenn“
> stehen dort und werden hier nicht wiederholt.

Eine flüchtige, schwebende Benachrichtigung, verankert an einer Ecke des Viewports, die nach kurzer
sichtbarer Dauer von selbst verschwindet. Sie ist **kein** Alert (inline, bleibt stehen) und kein
Modal (blockierend). Was sie von beiden trennt, sind Flüchtigkeit und Positionierung. Genau diese
Unterscheidung schuldet die Komponente als Erstes: eine Meldung, die man verpassen darf.

---

## 1. Anatomie

Neun Slots. Drei sind unbedingt Pflicht: `viewport`, `container`, `body`. Zwei weitere
werden Pflicht, sobald Du den Schließen-Button einbaust. Die zweistufige Struktur, ein
Viewport, der das Stapeln besitzt, und ein Container, der eine Meldung besitzt, machen die meisten
falsch. Deshalb gehört sie richtig gebaut.

| Slot           | Pflicht          | Figma                         | Was es ist                                                                                                                                                                                   |
| -------------- | ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `viewport`     | ja               | Frame                         | Region mit fester Position an einer Ecke des Viewports, die alle sichtbaren Toasts hält. **Einer pro Seite.** Besitzt Stapeln, Pause bei Hover und die Landmark.                             |
| `container`    | ja               | Frame, Auto Layout horizontal | Die Fläche eines Toasts. Maximale Inline-Größe 360–420px. Trägt die Schweregrad-Darstellung und seine eigene Live-Region-Rolle.                                                              |
| `icon`         | nein             | Instanz                       | Schweregrad-Glyphe am Inline-Start. Glyphen-Wechsel an die Schweregrad-Variante gebunden. Dekorativ.                                                                                         |
| `title`        | nein             | Text                          | Optionale kurze Überschrift. Nur, wenn der Body mehrzeilig wird. Ein einzeiliger Toast _ist_ seine eigene Überschrift.                                                                       |
| `body`         | ja               | Text                          | Die Meldung. Laut Kanon ein oder zwei Sätze. Alles Längere ist ein Alert.                                                                                                                    |
| `action`       | nein             | Instanz                       | **Genau eine** Inline-Aktion („Undo“, „View“). Zwei Aktionen sind ein Zeichen für ein Redesign.                                                                                              |
| `close-button` | nein             | Instanz                       | Echter Button. Icon-Button, Variante close, am Inline-Ende.                                                                                                                                  |
| `close-icon`   | ja (des Buttons) | Instanz                       | Die ×-Glyphe. Immer dekorativ.                                                                                                                                                               |
| `close-label`  | ja (des Buttons) | Text                          | Der zugängliche Name: ein visuell verstecktes „Dismiss notification“ oder ein `aria-label` am Button. Als Slot gezählt, damit die Abhängigkeit in der Struktur steht und nicht in der Prosa. |

**Token-Budget.** `container`: Hintergrund `color/surface-raised`, Rahmen `color/border`,
Radius `radius/md`, Abstand und Lücke von der `spacing/*`-Leiter. `viewport`: nur `spacing/*` für
Abstand und Lücke. Vordergrund von `icon` und `action`: `color/text` oder die Schweregrad-Farbe.
Vordergrund von `close-button`: `color/text-muted`.

**Der Schatten ist keine Variable.** Ein Toast schwebt, das heißt `--ui-shadow-lg`. In `Library Tokens` gibt es
kein `shadow/*`, Elevation lebt nur in `tokens.css`. Halte das in Deiner Figma-Beschreibung fest
und erfinde keine Variable dafür.

---

## 2. Achsen

**Variante (die Schweregrad-Achse):** `info` · `success` · `warning` · `danger`.

**Properties (keine Varianten):**

| Property      | Art     | Werte                                                                                                                |
| ------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| `position`    | enum    | `block-start-start`, `block-start-end`, `block-start-center`, `block-end-start`, `block-end-end`, `block-end-center` |
| `dismissible` | boolean | —                                                                                                                    |
| `hasAction`   | boolean | —                                                                                                                    |
| `hasIcon`     | boolean | —                                                                                                                    |

`position` ist eine Property des **Viewports**, nicht eines Toasts. Sie wählt eine Ecke und
gestaltet die Meldung nicht um.

### Umfang für den 90-Minuten-Block

**Im Umfang: `success` und `danger`, in den Zuständen `open` und `closing`.** Diese zwei
Schweregrade sind das Paar, das sich um mehr als den Farbton unterscheiden muss (siehe §4), und das Paar, dessen
Live-Region-Höflichkeit sich unterscheidet. Zusammen tragen sie die ganze Lektion. Modelliere
`dismissible` und `hasIcon` als Booleans, wenn die Zeit reicht.

**Nicht im Umfang, und sag das in der Beschreibung, statt es stillschweigend wegzulassen:** `info`
und `warning`, die sechs `position`-Werte (baue eine Ecke), das Stapelverhalten und
das Fortschrittsangebot.

---

## 3. Zustände

**Interaktiv:** `hover`, `focus-visible`. Das ist CSS, keine Varianten.

**Daten:** `opening` → `open` → `paused` → `open` → `closing` → `closed`.

| Von       | Nach      | Auslöser                                                                                                                                         |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `closed`  | `opening` | Der Consumer löst den Toast aus. Er wird gemountet, der Timer ist initialisiert, aber nicht gestartet.                                           |
| `opening` | `open`    | Das Einblenden ist fertig (oder sofort bei `prefers-reduced-motion: reduce`). **Jetzt** startet der Timer, und die Live-Region kündigt an.       |
| `open`    | `paused`  | Der Zeiger betritt den Viewport **oder** der Fokus wandert hinein. Jeder sichtbare Toast pausiert, nicht nur der unter dem Zeiger.               |
| `paused`  | `open`    | Zeiger und Fokus sind beide draußen. Der Timer **läuft weiter**, er startet nicht neu. Die verstrichene Zeit zählt.                              |
| `open`    | `closing` | Der Timer läuft ab; oder Escape bei Fokus in der Region; oder Schließen/Aktion ausgelöst; oder ein programmatisches Schließen.                   |
| `closing` | `closed`  | Das Ausblenden ist fertig (oder sofort bei reduzierter Bewegung). Aus dem Viewport und aus der Live-Region entfernt, der Stapel ordnet sich neu. |

Die Ankündigung passiert beim Eintritt in `open`, nicht beim Mounten. Ein Toast, der ankündigt,
während er noch einfährt, kündigt Inhalt an, den der Nutzer noch nicht lesen kann.

---

## 4. Anforderungen an die Barrierefreiheit

Nicht verhandelbar. Drei davon haben in der maßgeblichen Quelle den Schweregrad blocker. Jede ist außerdem
mit **(dieser Block)** markiert, also prüfbar an dem Frame und der Beschreibung, die Du in den
90 Minuten tatsächlich baust, oder mit **(volle Komponente)**, also wahr für den Toast in Produktion und wert,
in die Beschreibung des Masters geschrieben zu werden, aber abhängig vom Zustand `paused`, einem Szenario mit mehreren Toasts
oder einem Laufzeitmechanismus, den der Umfang dieser Übung nicht baut (siehe [`README.md`,
Punkt 7](README.md#fertig-wenn)).

1. **Timer pausieren bei Hover und Fokus.** _(blocker, WCAG 2.2.1 Timing Adjustable · volle
   Komponente)_ Pausiere, wenn der Zeiger den Viewport betritt **und** wenn der Fokus hineinwandert, und setze erst fort, wenn
   beides draußen ist. Pausiere auf Viewport-Ebene, nicht pro Toast, damit ein Nutzer zwischen
   benachbarten Toasts wechseln kann. Ohne das verliert ein langsamer Leser die Meldung mitten im Satz. Hängt vom
   Zustand `paused` ab, der hier nicht im Umfang ist: Dokumentiere den Vertrag in der
   Beschreibung, die Pause selbst baust Du nicht.
2. **Escape schließt.** _(blocker · volle Komponente)_ Bei Fokus innerhalb der Toast-Region
   schließt Escape den fokussierten Toast, oder den jüngsten, wenn keiner fokussiert ist. Sonst
   bleiben als Ausgang nur, zum Button zu tabben oder zu warten, und der Tastaturvertrag wirkt neben jeder anderen
   Light-Dismiss-Fläche kaputt. Keydown-Behandlung ist Code: Dokumentiere die Belegung.
3. **Der Schweregrad bestimmt die Höflichkeit der Live-Region.** _(major · volle Komponente)_ `info` und
   `success` → `role="status"` (polite). `danger` → `role="alert"` (assertive). `warning`
   ist kanonisch polite. Wer jeden Toast assertive markiert, unterbricht den Nutzer bei jedem
   „Copied“ und bringt ihm bei, Benachrichtigungen abzuschalten. Die Rollenaufteilung ist ein Code-Attribut
   ohne Figma-Entsprechung: Halte die Zuordnung in der Beschreibung fest. `success`
   und `danger` sind genau das Paar, das Du zeichnest, hier hat die Beschreibung also echtes Gewicht.
4. **Kritische Fehler sind keine Toasts.** _(blocker · dieser Block)_ Alles, worauf der Nutzer
   reagieren muss, etwa ein Netzwerkfehler oder eine Warnung vor Datenverlust, ist ein Alert oder ein Modal. Ein Toast ist für das, was
   man ohne Folgen verpassen darf. Das falsch zu machen, ist eine inhaltliche Entscheidung, die kein
   korrektes Markup repariert, und sie ist direkt an dem prüfbar, was Du zeichnest: Weder
   `success` noch `danger` darf etwas darstellen, das man nicht verpassen darf.
5. **Die Region ist eine Landmark, keine Live-Region.** _(volle Komponente)_ `role="region"`
   mit `aria-label="Notifications"` am Viewport. Die Live-Region-Rollen sitzen
   an den einzelnen Toasts. Beides sind ARIA-Rollen ohne Darstellung in Figma: Dokumentiere sie.
6. **Das Schließen-Control kündigt sich einmal an.** _(dieser Block)_ `aria-label="Dismiss"` **oder** ein
   visuell versteckter Span, nie beides. Das `close-icon` ist `aria-hidden="true"` und trägt nie
   einen eigenen Namen. `close-icon` und `close-label` sind Anatomie-Slots (§1) und
   direkt am Frame prüfbar, wenn Du `dismissible` baust.
7. **Das Icon ist nie der Schweregrad.** _(dieser Block)_ `aria-hidden="true"` an der Glyphe.
   Der Schweregrad erreicht assistive Technik über die Rolle und den sichtbaren Text. Der Slot `icon`
   ist in der Anatomie-Tabelle (§1) als dekorativ markiert und am Frame prüfbar, den Du für
   beide Schweregrade im Umfang zeichnest.
8. **Die Stapeltiefe ist begrenzt.** _(major · volle Komponente)_ Drei sichtbare Toasts, der
   Rest wartet in einer Warteschlange. Ein unbegrenzter Stapel überflutet Bildschirm und Screenreader gleichermaßen. Setzt
   mehrere gleichzeitige Toasts voraus, die das Stapelverhalten, das dieser Brief aus dem Umfang nimmt (§2),
   hier nicht vorführbar macht: Dokumentiere die Grenze, baue die Warteschlange nicht.
9. **Die Aktion ist ein Button.** _(dieser Block)_ Per Tab erreichbar, nach dem Schließen-Button,
   mit einem echten zugänglichen Namen. Die Tab-Reihenfolge ist Laufzeit, aber „ein Button, kein gestylter Span“ ist
   eine Kompositionsentscheidung, am Frame prüfbar, wenn Du `hasAction` baust (§2).

---

## 5. Figma ↔ Code: die Stolperstellen

Die vier Stellen, an denen die Design-Datei und die Implementierung dieser Komponente gewohnheitsmäßig auseinanderlaufen.
Jede ist einen Satz in Deiner Figma-Beschreibung wert.

| Gezeichnet als                                        | Implementiert als                                          | Warum es wehtut                                                                                                                                                                        |
| ----------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ein Toast neben dem Button, der ihn ausgelöst hat     | Eine einzige Viewport-Region mit fester Position pro Seite | Schwebende Flächen pro Auslöser konkurrieren miteinander und verlieren Stapeln, Auto-Dismiss und Live-Region auf einmal.                                                               |
| Eine statische Darstellung ohne Timer-Hinweis         | Ein Auto-Dismiss-Timer mit konfigurierbarer Dauer          | Designer sehen nicht, dass er verschwindet. Entwickler liefern kein Fortschrittsangebot und keinen vernünftigen Default. Dokumentiere Dauer und Hover-Pause als kanonisches Verhalten. |
| Varianten „One toast“ / „two toasts“ / „three toasts“ | Ein Toast plus ein Viewport, der stapelt                   | Der Drei-Toast-Frame ist Dekoration. Stapeln ist Sache des Viewports: Dokumentiere die maximale Tiefe im Viewport-Slot, nicht als Toast-Variante.                                      |
| Ein Inline-Link „Undo“ im Body-Text                   | Ein Button im Slot `action`                                | Ein Anchor ist die falsche Semantik (Undo navigiert nicht), und ein Span mit Click-Handler hat gar keine. Der Body beschreibt, die Aktion ist separat erreichbar.                      |

---

## 6. Woran Du „fertig“ erkennst

Zusätzlich zur gemeinsamen Messlatte in [`README.md`](README.md):

- Die Variantenachse heißt `variant` mit den Werten `success` und `danger`, kleingeschrieben,
  passend zur String-Literal-Union, die die Spec tragen wird.
- `success` und `danger` sind auch ohne Farbe unterscheidbar.
- Die Beschreibung am Master nennt: die Auto-Dismiss-Dauer, den Vertrag der Hover-Pause,
  die Escape-Belegung und dass der Schatten nur in CSS existiert.
- Die zwei Zustände im Umfang sind `open` und `closing`, und die Beschreibung nennt die vier
  Datenzustände, die Du nicht gebaut hast.

---

**Bevor Du promptest:** Schreib zuerst das Übergabedokument. Ein ausgefülltes Beispiel (zum Toast-Brief) steht in `../handoff-example.md`.
