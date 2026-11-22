---
status: accepted
date: 2026-11-19
sources:
  - owner decisions, 2026-11-19 (schedule pass, point 5 and its follow-up: 'Embed plus PNG')
  - plan/adr/0186-room-time-goes-to-what-a-participant-can-take-to-their-own-system.md (point 13 moves demo D-3 to Day 2 Block 02 and names this record)
  - tasks/todo.md, "Package E", steps E0 and E6 (the spike and the scaffold change)
  - tasks/reviews.md, R-090 (the open finding this closes, 2026-09-14)
  - plan/adr/0144-no-figma-no-contract.md (the `--figma` switch R-090 wanted this behind)
---

# ADR-0187: The scaffold story shows its Figma frame as an embed and as an image

## Status

Accepted. Proven on a generated seat in a browser for the public Atelier file. The embed for a
private file is unmeasured; the image entry is there so the course does not depend on that answer.

## Context

Demo D-3 showed the Design tab on Day 1: the trainer opened a story in the monorepo's Storybook and
the Figma frame sat beside the component. A participant could not repeat it. The scaffold's three
`main.ts.template` files did not list `@storybook/addon-designs` and no scaffold story set
`parameters.design` (R-090, open since 2026-09-14). The schedule pass (ADR-0186) asked of every
block what a participant takes to their own system; a tab that exists only on the trainer's machine
fails that question. The owner's condition was a spike: if the frame shows on a seat, the addon goes
into the scaffold and the demo moves to Day 2 Block 02, where the generated component first meets
its design. If not, D-3 is dropped.

The spike answered half. `@storybook/addon-designs` 11.1.4 turns a `www.figma.com/design/…` link
into an `embed.figma.com` iframe and the frame renders. But the Atelier file is public
(`link_access: view`), and a participant draws in a duplicate in their drafts, which is private.
Whether the embed loads there depends on the seat browser being logged in to Figma and on Figma's
embed rules for private files. No private file was reachable from the trainer machine, so that stayed
open four days before the rehearsal.

## Decision

1. `@storybook/addon-designs` is a devDependency of every scaffolded workspace, pinned exactly to the
   version in the monorepo's root `package.json`, and registered in all three `main.ts.template`
   files after `addon-a11y`.
2. The `atelier-component` skill carries the rule, not the prompt: a component built from a handoff
   document that names a Figma source gets a two-entry `parameters.design` on its story meta. The
   first entry is the Figma link from the document's Source line (`type: 'figma'`). The second is a
   PNG of the frame (`type: 'image'`), taken with `figma_take_screenshot` and copied next to the
   stories as `<component-file-name>.design.png`.
3. The image is addressed as `new URL('./<name>.design.png', import.meta.url).href`.
4. Without the bridge the agent writes the link entry alone and says so.
5. The shipped `atl-button` example story carries no design parameter. Its tab says "No designs
   found".
   **Corrected 2026-11-22** by [ADR-0197](0197-the-story-carries-the-figma-link-only.md): points 2,
   3 and 5 are superseded. Stories carry the Figma link only (no PNG), and the example button story
   carries the link to the AtlButton master when the seat was created with its file key.
6. Demo D-3 is trainer-shown on Day 2 Block 02 on the participant path: generate, open the story,
   look at both.

## Why

**Two entries because one question is unmeasured.** The embed is the better view (live, zoomable,
follows the file) and it is the one a team keeps. It may not load for a private duplicate. A PNG
loads everywhere, costs one tool call the bridge already offers without a token, and makes the
Design tab work in the room whatever the embed does. If the rehearsal shows the embed loads for
private files, the image entry stays as a cheap fallback; if it shows the opposite, the tab still
has content. Either outcome needs no change to the scaffold.

**The rule sits in the skill** for the reason ADR-0183 gives: a standing rule a participant should
get on every generation does not belong in a prompt they paste once. The Day 2 generation prompt
only gained the exception that lets the agent write the image file.

**`new URL(..., import.meta.url)`** is the form Vite resolves by itself, in dev and in a static
build. It needs no `staticDirs` entry, no `*.png` module declaration under the scaffold's strict
TypeScript, and the image lives beside the stories that use it, so deleting a component deletes its
picture.

**Not behind `--figma`.** R-090 wanted addon and parameter only when the workspace is created with
`--figma`. The parameter already is: it is written only when a handoff document names a Figma source.
Making the addon conditional too would add a template variable, a branch in the dependency list and
a test per branch, to spare a `--no-figma` workspace one empty tab. Course seats are created with
`--figma`.

## Rejected

- **Embed only.** Cheapest, and broken in the room if private embeds do not load. Nobody could
  measure that before the rehearsal.
- **Image only.** Works everywhere, but teaches a screenshot where a team would want the live frame,
  and the picture goes stale without anybody noticing.
- **Drop D-3.** The owner's fallback had the spike failed. With the image entry it did not have to.
- **`staticDirs` plus an absolute URL.** Splits a component's files across two folders and breaks
  when the app's `public` layout changes.
- **A design parameter on the shipped `atl-button` story.** It would point at the public Atelier
  file, which is the one case the participant never has.

## Consequences

- Verified 2026-11-19 on a workspace generated from the packed preset, in Chromium: the panel reads
  "Design (2)" with a FIGMA and an IMAGE tab, the embed shows the Atelier file, the image shows the
  PNG beside the stories, and the shipped `atl-button` story renders with "No designs found".
  `nx test create-workspace` and `nx lint create-workspace` pass.
- Not measured: the embed for a private duplicate; whether the seat browser is logged in to Figma;
  the image entry in a static `build-storybook` output; a full agent run on a seat that takes the
  screenshot and copies the file. The rehearsal of 2026-11-23 is the first place all four meet.
- The test workspace was first created with `create-nx-workspace --preset=apps`, whose
  `tsconfig.base.json` sets `emitDeclarationOnly`. Under it every story failed with "Cannot destructure
  property 'id' of 'defaultExport'", the shipped one included. That is a property of that base
  config, not of this change: with the flag removed both stories render. The real flow never writes
  that flag (the framework's application generator writes the base config), but a participant who
  later moves a workspace to TypeScript project references would meet the same error.
- A PNG is a copy. It is right on the day it was taken. The link entry is the one that stays true.
- A `--no-figma` workspace gets a Design tab that is always empty.
- Seats need a new create-workspace release and reprovisioning before the rehearsal.
- R-090 closes with this record.
