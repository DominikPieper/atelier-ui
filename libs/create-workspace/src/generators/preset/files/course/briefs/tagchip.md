# Komponenten-Brief: TagChip

> **Quelle: zusammengesetzt, nicht kanonisch.** Unter den kanonischen Komponenten gibt es
> weder `tag-chip` noch `chip`. Dieser Brief setzt eines aus zwei Komponenten zusammen,
> die kanonisch _sind_: den Slots `tag` und `tag-remove` eines Tag Inputs und dem
> gesamten `badge`. Wo beide sich widersprechen, wird der Widerspruch benannt, nicht
> geglättet.
> **Starter-Frame:** `TagChip / Starter`, Node `703:352` auf der Seite
> `🛠️ Workshop-Templates`.
> **Lies zuerst [`README.md`](README.md).** Die gemeinsamen Regeln und die Messlatte
> „Fertig, wenn“ stehen dort und werden hier nicht wiederholt.

Ein kompaktes beschriftetes Token, das sich entfernen lässt. Es sieht aus wie ein Badge
und verhält sich wie das `tag` in einem Tag Input, und die Lücke zwischen diesen beiden
Tatsachen ist der gesamte Brief: Ein Badge ist **laut kanonischem Vertrag
schreibgeschützt**, und sobald Du ein × darauf setzt, erbst Du eine Pflicht zur
Trefferfläche, für die das Badge nie gedacht war.

---

## 1. Anatomie

Sechs Slots. Drei stammen aus `badge`. `remove-button` ist `tag-remove` aus `tag-input`;
seine zwei Kinder sind keine Slots, die `tag-input` deklariert: Sie folgen der
Aufteilung `close-button` / `close-icon` / `close-label`, die `toast` festhält, und dort
setzt die kanonische Liste einen zugänglichen Namen an ein reines Icon-Control.

| Slot            | Pflicht          | Aus                            | Figma                         | Was es ist                                                                                                                            |
| --------------- | ---------------- | ------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `root`          | ja               | badge `root` + tag-input `tag` | Frame, Auto-Layout horizontal | Die Pillenfläche. Trägt die Variantengestaltung, den Radius und das Padding-Budget.                                                   |
| `icon-leading`  | nein             | badge                          | Instanz                       | Optionales Symbol vor dem Label, am Anfangsrand mit gleichbleibendem Abstand.                                                         |
| `label`         | ja               | badge                          | Text                          | Der Text des Chips und sein zugänglicher Name. Eine Nominalphrase, die bei Überlauf mit Ellipse abgeschnitten wird.                   |
| `remove-button` | nein             | tag-input `tag-remove`         | Instanz                       | Echter `<button>`. Icon-Button am Zeilenende. Fehlt bei schreibgeschützten Chips.                                                     |
| `remove-icon`   | ja (des Buttons) | toast `close-icon`             | Instanz                       | Das ×-Symbol. Immer dekorativ.                                                                                                        |
| `remove-label`  | ja (des Buttons) | toast `close-label`            | Text                          | Der zugängliche Name: `"Remove <label>"`, die Formulierung stammt aus `tag-input`. Visuell versteckt oder ein `aria-label` am Button. |

**Token-Budget.** `root`: Hintergrund `color/surface-sunken` (neutral) oder das
`color/<severity>-bg` des Schweregrads, Vordergrund `color/text` oder
`color/<severity>-text`, Rahmen `color/border`, Radius `radius/full` für eine Pille oder
`radius/sm` für einen rechteckigen Chip, Padding und Abstand aus `spacing/*`, Schrift
`font-size/xs` in `font-weight/semibold`. `remove-button`: Vordergrund
`color/text-muted`, Fokusring aus `color/input-border-focus`.

**Wo die beiden Quellen sich widersprechen.** `badge` setzt die Pille auf `radius.pill`
und die Schrift auf `text.xs`; das `tag` aus `tag-input` setzt sie auf `radius.sm` und
`text.sm`, weil ein Tag in einem Formular-Control sitzt und zur Schrift des Inputs
passt. Wähle eines und schreibe den Grund in die Beschreibung. Ein freistehender Chip
steht einem Badge näher, ein Chip in einem Feld einem Tag. Diese Entscheidung _ist_ die
Designarbeit.

---

## 2. Achsen

**Variante (die Schweregrad-Achse, aus `badge`):** `default` · `success` · `warning` ·
`danger` · `info`. Ein geschlossenes Enum, dasselbe, das der CSS-Vertrag auf Token-Paare
abbildet.

**Properties (keine Varianten):**

| Property    | Art     | Werte      | Aus       |
| ----------- | ------- | ---------- | --------- |
| `size`      | enum    | `sm`, `md` | badge     |
| `removable` | boolean | —          | tag-input |
| `hasIcon`   | boolean | —          | badge     |

`removable` ist die Achse, die ein Badge zum TagChip macht, und sie ist eine
**Property**, keine Variante, genau wie `badge` `dot` modelliert. „Chip“ und „Removable
Chip“ in zwei Komponenten aufzuspalten ist der dokumentierte Drift: Sie laufen bei
Padding, Größe und Rahmen binnen ein, zwei Releases auseinander.

### Umfang für den 90-Minuten-Block

**Im Umfang: `default` und `success`, mit `removable: true`.** Zwei Schweregrade belegen
die Token-Zuordnung; `removable: true` macht das Ganze überhaupt erst zum TagChip und
zieht den ganzen a11y-Abschnitt nach sich. Der Chip selbst ist nicht das interaktive
Element, der Entfernen-Button ist es (§3), also zeichnet er nach
[`README.md` Punkt 1](README.md#fertig-wenn) gar keine `state`-Achse: hover und
focus-visible auf dem × gehören in die Beschreibung des Masters, genau wie die unten als
bewusst draußen aufgeführten Zustände.

**Nicht im Umfang, und sag das in der Beschreibung, statt es stillschweigend wegzulassen:**
`warning`, `danger`, `info`, die Größe `sm`, `hasIcon`, die eigenen Datenzustände des
Badge (`idle`, `updated`, `max`, `hidden`, §3), die Zustände `hover`/`focus-visible` des
Entfernen-Buttons und der Zustand „ausgewählt/per Tastatur angesteuert“, den ein Chip in
einem Tag Input bekommt. Keiner davon wird als `state`-Achse auf Chip-Ebene gezeichnet;
dokumentiere sie stattdessen in der Beschreibung des Masters.

---

## 3. Zustände

**Interaktiv:** `hover`, `focus-visible`, auf dem **Entfernen-Button**, nicht auf dem
Chip. Der Chip selbst ist kein Button. Die maßgebliche Quelle von `badge` listet _gar
keine_ interaktiven Zustände, was der ehrliche Ausgangspunkt ist: Das Einzige, was hier
den Fokus bekommt, ist das ×. Keiner von beiden wird als `state`-Achse auf Chip-Ebene
gezeichnet. Der Chip ist nicht das interaktive Element, also gehören sie nach
[`README.md` Punkt 1](README.md#fertig-wenn) stattdessen in die Beschreibung des Masters.

**Daten (aus `badge`):** `idle`, `updated`, `max`, `hidden`.

Ein Chip in einem Tag Input erbt auch dessen Zustände: `empty`, `filled`, `busy`,
`invalid` gehören zum Feld, nicht zum Chip. Modelliere sie hier nicht.

Ein Übergang ist es wert, gezeichnet zu werden, obwohl er nicht gebaut wird: das
Entfernen. Wird der Entfernen-Button aktiviert, verschwindet der Chip aus der
Werteliste **und der Fokus springt zum nächsten Chip**, oder zum Input, wenn es der
letzte war. Fokus, der nach dem Entfernen nirgends landet, ist die häufigste Art, wie
diese Komponente für Tastaturnutzer kaputtgeht.

---

## 4. Anforderungen an die Barrierefreiheit

Der Blocker hier ist der, der die Leute am meisten überrascht. Jeder Punkt trägt
zusätzlich die Markierung **(dieser Block)**, prüfbar am Frame `default`/`success` mit
`removable: true`, den Du zeichnest, oder **(volle Komponente)**: real, einer davon mit
Schweregrad Blocker, hängt aber von einem Verhalten ab (das Entfernen selbst, mehrere
Chips, `hasIcon`), das der Umfang dieses Briefs für die 90 Minuten außer Reichweite legt
(siehe [`README.md` Punkt 7](README.md#fertig-wenn)). Die Markierung **(volle
Komponente)** ist keine Erlaubnis, den Punkt zu überspringen: Sie ist der Grund, warum
der abschließende Check Dich nicht durchfallen lässt, weil Du ihn nicht gebaut hast.

1. **Die Trefferfläche ist mindestens 24 × 24 px.** _(Blocker, WCAG 2.5.8 · dieser
   Block)_ Ein Entfernen-Button, der in einem kompakten Chip gut aussieht, ist
   regelmäßig 16 px groß. Erweitere den Aktivierungsbereich mit Padding oder einem
   `::after`-Overlay, damit der _sichtbare_ Chip kompakt bleibt, die _Trefferfläche_ aber
   die Schwelle erreicht. Der Rat der maßgeblichen Quelle ist noch deutlicher: Braucht
   das Design wirklich ein interaktives Badge, greife stattdessen zu Tag Input oder
   Button. Diese Komponente lebt in der Lücke zwischen beiden, und das solltest Du
   wissen, bevor Du sie zeichnest. `removable: true` ist im Umfang, die Zielgröße ist
   direkt am Frame messbar.
2. **Chips lassen sich per Tastatur entfernen, nicht nur per Zeiger.** _(Blocker · volle
   Komponente)_ In einem Feld lautet das kanonische Modell: Backspace in einem leeren
   Input _wählt_ den letzten Chip aus; ein zweites Backspace entfernt ihn; ArrowLeft /
   ArrowRight wechseln zwischen ausgewählten Chips. Freistehend ist das Minimum, dass der
   Entfernen-Button ein echter `<button>` in der Tab-Reihenfolge ist. Entfernen nur mit
   der Maus ist ein hartes Durchfallen. **Das Entfernen wird hier ausdrücklich nicht
   gebaut (§3)**: Ein statischer Figma-Frame hat keine Tastatur, an der er scheitern
   könnte, also lässt sich das im 90-Minuten-Abschluss nicht vorführen. Zeichne den
   Übergang (§3) und schreibe den Tastaturvertrag in die Beschreibung; baue es, wenn Du
   den Code schreibst.
3. **Chips tragen Listenstruktur.** _(Blocker · volle Komponente)_ Eine Reihe von Chips
   ist ein `<ul>` (oder `role="list"`), jeder Chip ein `<li>`, kein `<div>` voller
   gestylter Spans. Ohne das hört ein Screenreader einen undifferenzierten Textstrom und
   kann Chip nicht von Beiwerk unterscheiden. Hängt von einer Reihe Chips ab; der
   Starter-Frame ist ein einzelner Chip.
4. **Der Schweregrad steht nie allein durch Farbe.** _(Blocker · dieser Block)_
   Kombiniere die Variante mit einem Icon, einem Text-Präfix oder einem visuell
   versteckten Schweregrad-Wort. Farbe verstärkt nur. `default` und `success` sind genau
   das Paar, das Du zeichnest, direkt prüfbar.
5. **Der Entfernen-Button nennt sein Ziel.** _(dieser Block)_ `aria-label="Remove <label>"`,
   nicht „Remove“, nicht „Close“. Der Nutzer muss wissen, _welchen_ er gleich löschen
   wird. `remove-label` ist ein Anatomie-Slot (§1), der immer vorhanden ist, wenn
   `removable: true`, am Frame prüfbar.
6. **Das Entfernen-Icon kündigt nichts an.** _(major · dieser Block)_ `aria-hidden="true"`
   auf dem Symbol. Wer Icon und Button benennt, kündigt doppelt an. `remove-icon` ist ein
   Anatomie-Slot (§1), als dekorativ markiert, am Frame prüfbar.
7. **Auch das Icon am Anfang kündigt nichts an.** _(major · volle Komponente)_ Dekorativ,
   sobald ein sichtbares Label vorhanden ist. `hasIcon`, und mit ihm `icon-leading`, ist
   bewusst draußen (§2); nichts, was hier gebaut wird, hat ein Icon am Anfang, das sich
   markieren ließe.

---

## 5. Figma ↔ Code: die Stolperstellen

| Gezeichnet als                                                     | Implementiert als                                                         | Warum es wehtut                                                                                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Statische Textfelder mit Rahmen als Deko                           | Lebendige Elemente mit Entfernen-Buttons, die Teil des Formularwerts sind | Umsetzungen folgen dem Mockup und liefern gestylte Spans aus: keine Entfernen-Möglichkeit, kein Tastaturvertrag, keine Möglichkeit, einen Wert zu ändern, außer ihn komplett neu zu tippen. |
| Eine Komponente „Chip“ und eine separate „Removable Chip“          | Eine Komponente mit einem `removable`-Boolean                             | Beide driften unabhängig auseinander (anderes Padding, anderer Rahmen, andere Größe), und die kanonische Anatomie spaltet sich optisch auf.                                                 |
| Das × ist gezeichnet, aber keine Tastaturnavigation zwischen Chips | Pfeiltasten-Navigation plus Entfernen per Backspace                       | Tastaturnutzer müssen nacheinander durch das × jedes Chips tabben. Das Design kodiert das Bedienangebot und lässt das Modell weg.                                                           |
| Fünf einzelne Frames, einer pro Schweregrad                        | Eine `variant`-Prop, abgebildet auf Token-Paare                           | Die Matrix verdoppelt sich für nichts, und Schweregrad-Drift wird unsichtbar: `success` und `info` können unbemerkt auf denselben Farbton zulaufen.                                         |

---

## 6. Woran Du „fertig“ erkennst

Zusätzlich zur gemeinsamen Messlatte in [`README.md`](README.md):

- Ein Component Set mit `variant` (`default` / `success`) und einem Boolean `removable`,
  keine zwei Komponenten.
- Der Aktivierungsbereich des Entfernen-Buttons misst ≥ 24 × 24 px, auch wo der Chip
  kleiner ist, und die Beschreibung sagt, wie das erreicht wird.
- Die Beschreibung des Masters nennt die Gestaltung von `hover`/`focus-visible` des
  Entfernen-Buttons und das Modell „ausgewählt/per Tastatur angesteuert“; beides wird
  nicht als Achse auf Chip-Ebene gezeichnet (§2, §3).
- Die Beschreibung hält fest, **welcher** Quelle Du für Radius und Schrift gefolgt bist
  (badge oder tag) und warum.
- `default` und `success` sind ohne Farbe unterscheidbar.

### Offene Frage für Deine Entscheidungsdatei

Was passiert mit einem Label, das länger ist als der Chip breit sein darf: wird es abgeschnitten, umgebrochen, oder wächst der Chip? Wie kommt ein Nutzer an den vollen Text, und was liest ein Screenreader vor? Entscheide es in der Entscheidungsdatei.

---

**Bevor Du promptest:** Lass den Agenten die Entscheidungsdatei entwerfen und beantworte die offenen Fragen selbst, als Einträge für Umfang, Verhalten und Bewusste Abweichungen. Ein ausgefülltes Beispiel (zum Toast-Brief) steht in `../entscheidungen-beispiel.md`.
