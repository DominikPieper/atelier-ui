# Komponenten-Brief: StatCard

> **Quelle: zusammengesetzt, nicht kanonisch.** Unter den kanonischen Komponenten gibt es
> kein `stat-card`. Dieser Brief setzt eines aus `card` und `badge` zusammen. Zwei der
> Slots unten, `value` und `delta`, haben **kein kanonisches Gegenstück**; sie sind die
> eigenen dieser Komposition und auf vorhandene Slots abgebildet. Jede solche Abbildung
> ist markiert.
> **Starter-Frame:** `StatCard / Starter`, Node `703:348` auf der Seite
> `🛠️ Workshop-Templates`.
> **Lies zuerst [`README.md`](README.md).** Die gemeinsamen Regeln und die Messlatte
> „Fertig, wenn“ stehen dort und werden hier nicht wiederholt.

Eine begrenzte Fläche, die eine Kennzahl zeigt: ein Label, die Zahl und ihren Trend.
Die Versuchung ist, sie als „eine Card mit einer großen Zahl darin“ zu behandeln. Einen
Brief braucht sie, weil die kanonische Anatomie einer Card einen **Pflicht**-Action-Slot
hat und eine StatCard keine Aktion. Als Erstes schuldet diese Komponente also eine
festgehaltene Entscheidung, was sie weglässt und warum.

---

## 1. Anatomie

Sechs Slots. Vier entsprechen kanonischen Card-Slots, zwei sind die eigenen dieser Komposition.

| Slot        | Pflicht | Entspricht                                     | Figma                         | Was es ist                                                                                                                                        |
| ----------- | ------- | ---------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container` | ja      | card (die Fläche selbst)                       | Frame, Auto-Layout vertikal   | Die begrenzte Fläche. Trägt die Variantengestaltung, den Radius und das Padding-Budget.                                                           |
| `label`     | ja      | card `eyebrow`                                 | Text                          | Was gemessen wird. Kurz, kategorisch, über der Zahl: stellt den Kontext her, bevor der Wert kommt. **Keine** Überschrift, sondern Metadaten.      |
| `value`     | ja      | _kompositionsspezifisch_, belegt card `title`  | Text                          | Die Zahl selbst in Display-Größe. Die primäre Kennung der Karte; sie muss auch außerhalb des Kartenkontexts als eigenständiges Label lesbar sein. |
| `delta`     | nein    | _kompositionsspezifisch_, eine `badge`-Instanz | Instanz                       | Der Trendmarker: `+12%`, `−3.4%`. Ein Badge mit einer Schweregrad-Variante.                                                                       |
| `caption`   | nein    | card `subtitle`                                | Text                          | Sekundärer Zusatz, der den Wert eingrenzt: „gegenüber letzter Woche“, „gleitende 30 Tage“. Kein Platz für Prosa.                                  |
| `footer`    | nein    | card `footer`                                  | Frame, Auto-Layout horizontal | Tertiäre Metadaten mit geringerem visuellem Gewicht: Zeitstempel, Quelle, ein Link nach außen.                                                    |

**Der Slot, den diese Komposition weglässt.** Card markiert `primary-action` als
**Pflicht**: genau ein Button pro Karte, der eine Entscheidung auslöst. Eine StatCard
löst keine Entscheidung aus. Den Slot wegzulassen ist legitim. Den Wegfall in der
Beschreibung des Masters festzuhalten unterscheidet eine bewusste Komposition von einer
unvollständigen. Braucht Deine StatCard doch ein Bedienangebot „Details ansehen“, lies
zuerst §4.1: Es ändert die Tastaturbedienung der Komponente komplett.

**Token-Budget.** `container`: Hintergrund `color/surface-raised` (elevated) oder
`color/surface` mit `color/border` (outlined), Radius `radius/lg`, Padding aus
`spacing/*`. `label`: `color/text-muted`, `font-size/xs`, `font-weight/medium`, mit
weitem `letter-spacing`, wenn Du es in Großbuchstaben setzt. `value`: `color/text`, die
größte Stufe, die Deine Typo-Skala hergibt. `caption` und `footer`: `color/text-muted`,
`font-size/xs`. `delta`: das Schweregrad-Paar des Badge selbst, `color/success-bg` +
`color/success-text` oder `color/danger-bg` + `color/danger-text`.

**Elevation ist ein reines CSS-Token.** Die Variante `elevated` braucht `--ui-shadow-md`,
und `Library Tokens` enthält kein `shadow/*`: Figma kann es nicht binden. Nenne den
Schatten in der Beschreibung. Erfinde keine Variable dafür. (Darum lässt sich die
Variante `outlined`, die nur `color/border` braucht, leichter token-treu bauen.)

---

## 2. Achsen

**Variante (aus `card`):** `elevated` · `outlined` · `flat`. Das sind strukturell
verschiedene Flächen, deshalb verdienen sie eine Variantenachse.

**Properties (keine Varianten):**

| Property      | Art     | Werte                    | Aus                      |
| ------------- | ------- | ------------------------ | ------------------------ |
| `orientation` | enum    | `vertical`, `horizontal` | card                     |
| `density`     | enum    | `comfortable`, `compact` | card                     |
| `interactive` | boolean | —                        | card                     |
| `hasDelta`    | boolean | —                        | _kompositionsspezifisch_ |

`orientation` ist eine **Property**, keine Variante: der häufigste Zählfehler bei dieser
Komponente. Designer, die sie als Variante modellieren, sehen sechs Varianten, wo
Entwickler drei Varianten und eine binäre Prop sehen, und beide Dateien sind sich nicht
mehr einig, was existiert.

### Umfang für den 90-Minuten-Block

**Im Umfang: `elevated` und `outlined`, in den Zuständen `delta-up` und `delta-down`,
mit `hasDelta: true`.** Die beiden Varianten unterscheiden sich in genau einer Dimension,
Rahmen gegen Schatten. So wird die Lektion „Figma kann keinen Schatten binden“ konkret
statt theoretisch. `delta-up` und `delta-down` sind die eigene `state`-Achse dieser
Komposition (§3), ein Datenpaar und kein Interaktionspaar, denn eine statische StatCard
hat keine Interaktionszustände zu zeichnen (siehe unten). Beide zu zeichnen macht den
Blocker „Farbe allein“ aus Punkt 3 (§4) direkt am Frame prüfbar, statt ihn nur in Prosa
zu behaupten. `hasDelta: true` zieht die Achse und die Badge-Komposition überhaupt erst
in den Umfang.

**Nicht im Umfang, und sag das in der Beschreibung, statt es stillschweigend wegzulassen:** `flat`,
beide `orientation`-Werte (baue `vertical`), `density`, `interactive` und die
Datenzustände `selected` / `loading`.

---

## 3. Zustände

**Interaktiv (aus `card`):** `hover`, `focus-visible`, `active`, `disabled`, und nur bei
`interactive: true`. Eine statische StatCard hat keinen davon. Hover auf einer nicht
interaktiven Karte zu zeichnen verspricht ein Bedienangebot, das es nicht gibt.

**Daten (aus `card`):** `selected`, `loading`.

Über `loading` lohnt es sich nachzudenken, auch wenn es nicht zum Bauumfang gehört: Der
gesamte Inhalt einer StatCard ist eine asynchrone Zahl. Der Skeleton-Zustand ist also
keine Dekoration, sondern der Zustand, in dem die Komponente ihre ersten Frames
verbringt. Halte in der Beschreibung fest, was die Karte zeigt, bevor die Zahl eintrifft.

**`selected` ist ein Datenzustand, keine Variante.** Wer ihn als „Outline + gefüllter
Hintergrund“ modelliert, doppelt die Gestaltung an zwei Stellen und blockiert die
Kombination `selected + disabled` komplett.

**Daten (kompositionsspezifisch): `delta-up`, `delta-down`.** `card` bringt kein eigenes
Delta mit: Dieses Paar gehört zur Komposition des `delta`-Slots, nicht zu `card`, und es
ist die eine `state`-Achse, die dieser Brief tatsächlich zeichnet (§2). Eine Karte mit
`hasDelta: true` erscheint als `delta-up` (Badge-Paarung `success`) oder `delta-down`
(Badge-Paarung `danger`). Beide Frames gehören in den Umfang, gerade weil die Richtung
ohne Farbe erkennbar bleiben muss (§4 Punkt 3).

---

## 4. Anforderungen an die Barrierefreiheit

Jeder Punkt trägt eine Markierung: **(dieser Block)**, prüfbar an den Frames
`elevated`/`outlined`, gezeichnet in `delta-up` und `delta-down`, mit `hasDelta: true`,
oder **(volle Komponente)**: real, hängt aber von `interactive`, einem Live-Datenstrom
oder einem optionalen Slot ab, den der Umfang dieses Briefs außer Reichweite legt (siehe
[`README.md` Punkt 7](README.md#fertig-wenn)).

1. **Eine interaktive Karte hat genau ein Aktivierungselement, und verschachtelte
   Controls brauchen das Overlay-Muster.** _(Blocker · volle Komponente)_ Wer die ganze
   Karte in ein `<a>` packt, macht sie zu einem einzigen Tab-Stopp und sperrt alles
   Fokussierbare darin ein: Ein Screenreader liest die verschachtelten Controls dann als
   Teil des Link-Namens. Die kanonische Lösung: Die Karte bleibt ein einfacher
   Container, der `value` (oder `label`) bekommt ein echtes `<a>`, dessen `::before` die
   Karte abdeckt, und wirklich eigenständige Controls werden in einen höheren
   Stapelkontext gehoben. `interactive` ist bewusst draußen (§2), hier ist nichts
   klickbar.
2. **Eine klickbare Karte hat ein echtes fokussierbares Aktivierungselement.**
   _(Blocker · volle Komponente)_ Ein Click-Handler auf einem `<div>` ist per Tastatur
   nicht erreichbar und wird nicht angekündigt. `<a href>` für Navigation, `<button>` für
   Aktionen auf der Seite, nie `role="button"` auf dem Karten-div. Dieselbe Abhängigkeit
   von `interactive` wie bei Punkt 1.
3. **Das Delta steht nie allein durch Farbe.** _(Blocker, aus `badge` · dieser Block)_
   Grün für steigend, Rot für fallend ist für eine große Gruppe von Nutzern unsichtbar.
   Kombiniere es mit einem Vorzeichen (`+` / `−`), einem Pfeilsymbol _plus_ Text oder
   einem visuell versteckten Wort. Die Richtung der Zahl muss in Graustufen erhalten
   bleiben. `delta-up` und `delta-down` sind beide im Umfang (§2, §3): prüfbar, indem Du
   die beiden gezeichneten Frames direkt in Graustufen vergleichst, statt es nur von
   einem einzelnen zu behaupten.
4. **Ein sich live aktualisierender Wert wird höflich angekündigt.** _(major, aus `badge`
   · volle Komponente)_ Ändert sich die Zahl ohne Navigation, setze `aria-live="polite"`
   mit `aria-atomic="true"`, damit der ganze neue Wert vorgelesen wird statt eines
   Fragments. Drossele die Updates, sonst überflutet eine schnelle Kennzahl den
   Screenreader. Setzt einen echten Datenstrom voraus, den ein statischer Frame nicht
   hat: Dokumentiere stattdessen den Vertrag.
5. **Das Label ist keine Überschrift.** _(dieser Block)_ Die kanonische Card-Vorgabe: Das
   Eyebrow ist Metadaten. Müssen Wert und Label als Einheit angekündigt werden, verknüpfe
   sie mit `aria-labelledby`, statt das Label zu `<h3>` zu befördern. Der Textstil des
   Slots `label` ist eine gezeichnete Entscheidung, am Frame prüfbar.
6. **Wert und Label werden zusammen angekündigt.** _(dieser Block)_ „1.284“ allein ist
   bedeutungslos. Welchen Mechanismus Du auch wählst, DOM-Reihenfolge, `aria-labelledby`
   oder einen visuell versteckten kombinierten String: Schreib ihn in die Beschreibung.
7. **Ein dekoratives Delta-Icon ist versteckt.** _(major · dieser Block)_
   `aria-hidden="true"` auf dem Pfeilsymbol, wenn bereits ein textliches Vorzeichen da
   ist, sonst wird doppelt angekündigt. Die `delta`-Badge-Instanz ist im Umfang
   (`hasDelta: true`), am Frame prüfbar.
8. **Der Alt-Text von Medien wiederholt nie das Label.** _(minor · volle Komponente)_
   Fügst Du eine Sparkline oder ein Icon hinzu, ergänzt der Alt-Text, was der Text nicht
   sagt („Diagramm zeigt 12 % Wachstum“), oder er ist `alt=""`. Medien gehören nicht zur
   Anatomie dieser Komposition (§1), das gilt nur, falls Du später eines ergänzt.

---

## 5. Figma ↔ Code: die Stolperstellen

| Gezeichnet als                                                           | Implementiert als                                                       | Warum es wehtut                                                                                                                                                                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Varianten für hover / focus / active / disabled                          | CSS-Pseudoklassen und ARIA-Attribute                                    | 3 Varianten × 4 Zustände × 2 Orientierungen sind 24+ Frames, und keiner davon lässt sich ohne Handarbeit auf eine Pseudoklasse abbilden. Dokumentiere Interaktionszustände auf einem eigenen States-Sheet. |
| Media-on-top und Media-on-leading als getrennte Varianten                | Eine Komponente mit einer `orientation`-Prop                            | Designer zählen sechs Varianten, Entwickler drei plus eine binäre Union. Die Zahlen laufen auseinander, und die Dateien mit ihnen.                                                                         |
| Eine Card-Komponente über einer unsichtbaren Button-Komponente gestapelt | Ein `<a>`/`<button>`, das die Karte umschließt, oder das Overlay-Muster | Die Figma-Datei kodiert das Bedienangebot nicht, also merkt keine Seite, dass die ganze Karte ein einziges zugängliches Aktivierungselement sein muss.                                                     |
| Eine Variante „selected“ mit Outline + gefülltem Hintergrund             | Ein Attribut `data-selected` / `aria-selected`                          | Die Gestaltung steckt an zwei Stellen und driftet auseinander, und `selected + disabled` lässt sich nicht mehr darstellen.                                                                                 |

---

## 6. Woran Du „fertig“ erkennst

Zusätzlich zur gemeinsamen Messlatte in [`README.md`](README.md):

- Die Variantenachse ist `variant` mit den Werten `elevated` und `outlined`;
  `orientation` und `density` sind Properties, falls Du sie überhaupt modellierst.
- Die Beschreibung des Masters hält fest: dass `primary-action` bewusst weggelassen
  wurde, dass der Schatten von `elevated` ein reines CSS-Token ist und was die Karte
  zeigt, solange die Zahl lädt.
- Die Richtung des Deltas ist in Graustufen lesbar.
- Die `state`-Achse ist `delta-up` / `delta-down`, das eigene Datenpaar der Komposition
  und kein `card`-Zustand. Die Beschreibung nennt die `card`-Zustände
  (`hover`/`focus-visible`/`active`/`disabled`, `selected`, `loading`), die dieser Brief
  nicht baut.
- Der Slot `delta` ist eine **Instanz** Deines Badge (oder von `Display/AtlBadge`), keine
  handgezeichnete Pille: Die Komposition muss eine echte Komposition sein, sonst bricht
  die nächste Token-Änderung sie unbemerkt.

---

**Bevor Du promptest:** Schreib zuerst das Übergabedokument. Ein ausgefülltes Beispiel (zum Toast-Brief) steht in `../handoff-example.md`.
