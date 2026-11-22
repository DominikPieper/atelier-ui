---
status: accepted
date: 2026-11-22
sources:
  - owner, 2026-11-22 ("woher kommt das png üblicherweise bindet man doch über die storybook datei nur den FIGMA link der komponente an"; "für den Button … auch dort schon gemacht haben"; "Der Browser ist üblicherweise auf den Rechnern angemeldet bei Figma")
  - plan/adr/0187-the-scaffold-story-shows-its-figma-frame-as-embed-and-as-image.md (points 2, 3 and 5)
  - tools/figma/snapshot.json (AtlButton component set, node 129:20)
---

# ADR-0197: The story carries the Figma link only, the example button included

## Status

Accepted. Supersedes ADR-0187 points 2, 3 and 5.

## Context

ADR-0187 gave every generated story two design entries: the Figma link and a PNG of the frame,
because nobody knew whether the embed shows a private duplicate in the room. The owner's answer:
the course browsers are logged in to Figma, and a team keeps only the link. The PNG was a
workaround for an unknown that is now answered, and it taught a habit no team has. The example
button story had no link at all, so its Design tab said "No designs found" while the slides
showed the tab as the place to compare.

## Decision

1. The `atelier-component` skill writes one `parameters.design` entry, the link from the decisions
   file's Figma line (`type: 'figma'`). No screenshot, no `.design.png`. No Figma line, no entry.
2. The example `atl-button` story carries the link to the AtlButton master when the workspace is
   created with the attendee's file key (`--figma-file <key or URL>`, preset option `figmaFile`):
   `https://www.figma.com/design/<key>/?node-id=129-20`. Node ids survive a Figma duplicate, file
   keys do not, so the key comes from the seat and the node id from the source file. Without a
   key the story carries no design parameter and no placeholder.

Rejected: keeping the PNG as a fallback (it answers a question the room has answered, and costs a
tool call and a binary per component); a placeholder link in keyless workspaces (a link that
opens nothing is worse than an empty tab).

## Consequences

- Provisioning a seat with its key (`--figma-file`) now also fills the button's Design tab.
- If the embed does not render on a seat after all, the fallback is to open the link beside the
  story; the rehearsal checks it.
- The node id `129:20` is a constant in `preset.ts`; nothing gates it against the snapshot, so a
  rebuilt AtlButton master in the source file would leave a stale link.
- A `--figma-file` given with `--no-figma` still writes the link.
