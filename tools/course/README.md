# Course decks: export to PowerPoint with formatted speaker notes

The two lecture decks are Slides artifacts on claude.ai (owner's account):

- Tag 1: https://claude.ai/artifact/F7o6AkbbLLUDfAFtmfrM6t
- Tag 2: https://claude.ai/artifact/Y5NWqQn9bPf6cqEiBYPdfp

Speaker notes live in each slide's `<aside>` as plain text. They are written as what the trainer
says, without a `Sag:` label, followed by labelled blocks (`Regie:`, `Ein guter Prompt nennt:`,
`Nur für Trainer:`, `Probe-Punkt:`, `Notausgang:`, …), each starting a sentence.

## 1. Export

1. Open the deck in Chrome.
2. Toolbar, download icon (top right) → **PowerPoint, current fonts (.pptx)**.
3. Confirm the browser prompt "Diesem Artifact erlauben, eine Datei herunterzuladen?" with
   **Datei speichern**. The file lands in `~/Downloads` as `Design-to-Code mit KI – Tag N.pptx`.
4. Optional: **PDF (.pdf)** from the same menu; tick "Include speaker notes" only for a trainer
   copy.

The export puts every note into PowerPoint's notes pane, but as one long paragraph with English
spelling (`lang="en-US"`).

## 2. Move the file

Claude Code's shell cannot read `~/Downloads` on macOS (privacy protection). Move the file by
hand into `slides/` of this repo. Keep the raw export:

```shell
mkdir -p slides/Archiv/<YYYY-MM-DD>-roh
mv "slides/Design-to-Code mit KI – Tag 2.pptx" "slides/Archiv/<YYYY-MM-DD>-roh/"
```

## 3. Format the notes

```shell
python3 -I tools/course/format-pptx-notes.py \
  "slides/Archiv/<YYYY-MM-DD>-roh/Design-to-Code mit KI – Tag 2.pptx" \
  "slides/Design-to-Code mit KI – Tag 2.pptx"
```

What it does, per notes slide, standard library only:

- splits the spoken part into paragraphs of at most three sentences;
- starts a new paragraph at each label from its `LABELS` list and sets the label in bold;
- sets the language to `de-DE`, adds a little space after each paragraph;
- drops any leftover `Sag: „…“` wrapper;
- checks every rewritten notes XML is well formed before writing the file.

It prints `<n> notes formatted`; `n` should equal the number of slides. A new label used in the
notes belongs in `LABELS`, or it stays inline. Open the result once in PowerPoint's presenter
view before the course.
