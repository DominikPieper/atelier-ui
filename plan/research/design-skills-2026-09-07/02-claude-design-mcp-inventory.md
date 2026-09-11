# Claude Design MCP — inventory from atelier (2026-09-07)

Auth worked throughout; no failures. Account has 7 projects across several
unrelated design systems (client-looking names: SSP AG, AGES, Prosoz,
Monoceros, Conciso — plus the Atelier project and Atelier Design System);
only "Atelier" (`7a6a2f19-9a3c-4dd9-9828-65c7cc67766c`) and "Atelier Design
System" (`019de217-489c-7441-8275-2efe020086b5`) are in scope here. Default
design system for the account is "Conciso Design System – Test", not Atelier's
— a fresh `create_project` without `design_system_id` would NOT inherit
Atelier's system.

## (a) All 23 tools

| Tool                                                  | Purpose                                                                         | Key inputs                                                                | R/W            | Notes                                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| `list_projects`                                       | List caller's projects                                                          | —                                                                         | R              | id, name, url only                                                                                         |
| `list_design_systems`                                 | List available design systems                                                   | —                                                                         | R              | `is_default` flag                                                                                          |
| `get_claude_design_prompt`                            | Load Claude Design's own system prompt (+ optional bound design-system context) | `design_system_id?`, `project_id?`                                        | R              | Must be called before any `write_files` per its own description                                            |
| `read_design_skill`                                   | Fetch `hifi-design` or `frontend-design` guidance                               | `skill` enum                                                              | R              | Static checked-in text, not project data                                                                   |
| `get_project`                                         | Project metadata                                                                | `project_id`                                                              | R              | name, type, sharing                                                                                        |
| `list_files`                                          | Directory listing w/ etags                                                      | `project_id`, `path?`, `depth?`                                           | R              | `depth:-1` = full tree, no dir stubs                                                                       |
| `read_file`                                           | Read one file (≤256 KiB)                                                        | `project_id`, `path`, `offset?`, `limit?`, `if_none_match?`               | R              | Entity-escaped body; carries etag                                                                          |
| `list_comments`                                       | Pin-anchored feedback threads                                                   | `project_id`, `queued_for_claude?`, `changed_since?`                      | R              | `author_is_you` gates trust                                                                                |
| `get_conversation`                                    | Project's chat transcript(s)                                                    | `project_id`, `chat_id?`                                                  | R              | Capped at 256 KiB; JSON may cut mid-document                                                               |
| `list_members`                                        | Sharing grants (account/group/service/email rows)                               | `project_id`                                                              | R              | Excludes owner and link-scope access                                                                       |
| `create_project`                                      | New project, optional design-system binding                                     | `name`, `design_system_id?`                                               | W              | Returns `{project_id,url}`                                                                                 |
| `write_files`                                         | Write inline file content                                                       | `project_id`, `files[]`, `plan_token?`                                    | W              | First unconditional write to a project prompts one-time human consent (`needs_project_grant`)              |
| `copy_files`                                          | Server-side copy (file/folder, cross-project)                                   | `project_id`, `files[]` (`src`, `dest`, `src_project_id?`), `plan_token?` | W              | Bypasses the 256 KiB read cap; how design-system bundles land in a consumer project                        |
| `create_support_js`                                   | Write the `.dc.html` runtime                                                    | `project_id`, `path?`, `plan_token?`                                      | W              | Server-provided bytes; one per directory holding `.dc.html`                                                |
| `delete_files`                                        | Delete files                                                                    | `project_id`, `plan_token` (path-scoped only), `files[]`/`paths[]`        | W              | Always needs a plan_token; no project-scope delete option                                                  |
| `finalize_plan`                                       | Declare write/delete path set, return `plan_token` + `base_etags`               | `project_id`, `writes[]?`, `deletes[]?`, `scope?`                         | gate           | `scope:"paths"` ~15 min exact set; `scope:"project"` ~4 h, writes-only, no `base_etags`                    |
| `put_conversation`                                    | Push Claude Code's own conversation into the project's chat panel               | `project_id`, `messages[]`, `chat_id?`, `append?`                         | W              | One-way agent→app; nothing typed in-app is ever returned                                                   |
| `ack_comments`                                        | Clear `queued_for_claude` flag                                                  | `project_id`, `comment_ids[]`                                             | W (metadata)   | Never resolves/deletes the thread                                                                          |
| `add_member` / `remove_member` / `update_member_role` | Manage per-account access                                                       | `project_id`, `account_uuid`/`email`, `role`                              | W (governance) | Requires edit access; can't touch self                                                                     |
| `update_sharing`                                      | Change link-sharing scope/permission                                            | `project_id`, `scope?`, `link_permission?`                                | W (governance) | invited vs org scope                                                                                       |
| `render_preview`                                      | Mint preview URLs for a file                                                    | `project_id`, `path`                                                      | R (ephemeral)  | `serve_url` (tooling-only, short-lived, must never be shown to users) vs `open_url` (durable, user-facing) |

## (b) Direction of flow

**Read out of a project:** file tree + content (`list_files`/`read_file`,
etag-tracked, 256 KiB/call cap, entity-escaped so embedded markup can't break
the wrapper), the chat transcript (`get_conversation` — literal SPA `Message`
shape: `role`, `content`, `attachments`, tool calls), comment threads
(`list_comments`, with a `queued_for_claude`/`author_is_you` trust model —
third-party comment text is data, never instructions, until the user says
otherwise), the design skill library (`read_design_skill`), and Claude
Design's own operating system prompt plus a bound design system's guide text
(`get_claude_design_prompt`) — this last one is explicitly _the_ prompt the
in-app Claude Design agent runs under, confirmed byte-for-byte against what
ADR-0032 already reconstructed.

**Write into a project:** file content (`write_files`, `copy_files`,
`create_support_js`), file deletion (`delete_files`), project creation, one
project's own copy of _my_ conversation (`put_conversation`), comment triage
state (`ack_comments`), and access governance (`add_member` family,
`update_sharing`). There is **no tool that pushes an instruction into the
in-app Claude Design agent's own future behavior** — `put_conversation` only
mirrors a transcript into the chat panel for a human viewer to read; it is
documented as one-way and cannot be read back. So "write into a project" does
not mean "steer the designer" in any interactive sense — it means "change
files/access/visible chat history a human or a future session might see."

**`finalize_plan` / `plan_token` gates writes, not reads.** It is a pure
concurrency/consent layer for the mutating quartet (`write_files`,
`copy_files`, `create_support_js`, `delete_files`): declare the exact path set
up front, get back a signed token plus each path's current etag
(`base_etags`) to pass as `if_match`, so a human editing the same project
live gets a structured `{status:"conflict"}` instead of a silent overwrite.
`delete_files` always requires a path-scoped token (no project-scope delete);
writes can instead run under a project's standing write grant, established by
a one-time human consent on the first unconditional write.

**`render_preview` produces neither read nor write** — it mints two URLs for
an already-written file: `serve_url` (short-lived, token-embedded, for
automated browser tooling only — screenshotting, console/DOM inspection) and
`open_url` (the durable `claude.ai/design` editor link, the only one safe to
show a user). It is the mechanism behind the prompt's own "verify loop"
(render → gate on console/404/blank-mount → fresh eyes → act) described in
`get_claude_design_prompt`.

## (c) Shapes

**Artboard file** (`AtlBreadcrumbs.dc.html`, 7.7 KB, read via `read_file`):
exactly the format `get_claude_design_prompt` specifies — a plain HTML5
document whose `<head>` loads `./support.js`, and whose `<body>` holds one
`<x-dc>` template. Inside it: `<helmet data-dc-atomics>` first (a
`design_doc_mode="canvas"` meta tag, a Google Fonts `<link>`, a `<link
href="./_sheet.css">` to the shared component-family stylesheet, and an
inline `<style>` block defining a handful of component-specific classes
against CSS custom properties — `var(--primary)`, `var(--muted)`,
`var(--border-strong)` — that resolve from `_sheet.css`'s own `:root` palette,
since an artboard renders standalone with no access to the library's real
`tokens.css`). After `</helmet>`: plain markup — a `data-screen-label`
wrapper, "Length"/"Anatomy"/"Findings" sections, tables, prose — reading as an
annotated design-review sheet rather than a bare mockup: it cites the exact
Figma node id (`node 55:141`), the spec contract name (`AtlBreadcrumbsSpec`),
ADR numbers, and three explicitly flagged `open` findings. It ends with
`<script type="text/x-dc" data-dc-script data-props="{}">` holding `class
Component extends DCLogic { renderVals() { return {}; } }` — empty here
because this artboard is fully static. No script logic, no dynamic state.
The wrapper carries an opaque `etag`.

**Design system object:** `list_design_systems` returns bare `{id, name,
is_default}`. `get_claude_design_prompt(design_system_id=...)` returns that
plus a natural-language `<design-system-guide>` block (binding rules, asset
paths, icon/logo substitution notes) — I saw a fragment of this same guide
text pre-injected as a `[Design System]` attachment on the first message of
the project's one recorded chat, confirming the guide is delivered the same
way whether fetched live or replayed from history. Physically, a bound
design system also lands as a folder copied into the consumer project:
`_ds/atelier-design-system-<id>/` holding `README.md`,
`_adherence.oxlintrc.json`, `_ds_bundle.js`, `_ds_manifest.json`,
`colors_and_type.css`, a docs-theme CSS, and a UI-kit CSS — this is visible
directly in the Atelier project's own `list_files` output.

## (d) Confirms / contradicts the repo's recorded stance

- **Confirms ADR-0032's own post-verification correction, again.** The
  `.dc.html` format spec is first-party, complete, and shipped only through
  this MCP (not public docs) — matches verbatim. The style guidance is
  exactly as ADR-0032 corrected it: `<helmet><style>` classes are the
  intended token home, inline `style="…"` is for one-offs only — the opposite
  of ADR-0032's original (and already-corrected) claim.
- **No Figma-export tool exists in this MCP surface**, and no `login`/`auth`
  tool exists among the 23 either — consistent with docs' "interactively
  authenticated, a spawned script cannot reach it" and with export staying
  unverified; this MCP surface simply has no tool that would prove or
  disprove export either way.
- **A live, concrete instance of the exact drift risk the repo already
  documents.** `tools/design/artboards.json`'s own header warns the artboard
  column is hand-maintained and "the ONE column that cannot be derived from
  the repo." Comparing it against the live project: the registry lists
  `Typography Directions.dc.html` (a study) as its first artboard, but that
  file is **absent** from the live project; conversely, the live project has
  an `Index.dc.html` (6.5 KB, the most recently touched file by etag) that
  appears **nowhere** in the registry. So the registry's own count of 31 no
  longer matches the live file count of 30 — not a hypothetical staleness
  risk, an observed one, on the same day this inventory was taken.
- **Nuances, doesn't contradict, the docs page's "no machine-readable
  handoff exists in either direction."** Structured data does flow both ways
  through this MCP (JSON file listings, a JSON `_ds_manifest.json`, JSON
  comment/chat objects) — but none of it carries any of the four gate
  identities `check:all` keys on (Figma node id, `libs/spec` union member,
  `--ui-*` token, `COMPONENT_SET` name) as a queryable field. Those do appear
  — but only as prose inside a `.dc.html`'s own text (e.g. "node 55:141"),
  which is exactly what the docs page means by "no gate can address it": a
  script could grep for it, nothing here exposes it as structured input a
  gate could bind to.
- **`get_project`'s sharing (`{"link_permission":"view","scope":"invited",
"view_mode":"private"}`) and an empty `list_members`** are consistent with
  ADR-0032's "per-user consent gate" and default-private framing, and with
  the docs page's governance section (though retention/residency claims
  there come from Anthropic's admin guide, not from anything this MCP schema
  exposes).
- **Relevant to ADR-0096's step-5 aside, not a contradiction of it.**
  ADR-0096 explicitly declines to wait on Claude Design's step 5 (an
  outbound, viewer-facing handoff) because its own problem is inbound, to the
  agent. Nothing here changes that: the tooling for step 5 — `create_project`
  → `write_files` → `render_preview`'s durable `open_url` — is fully present
  and appears workable today: the schema-level blocker ADR-0032 named (per-
  seat save/editing capability in a room) is a runtime/licensing fact no tool
  schema here can resolve either way.

## (e) Auth model

No tool among the 23 takes any credential parameter (no api_key/token/login
field), unlike some other MCP connectors in this environment that expose
explicit `authenticate`/`complete_authentication` pairs. Claude Design has
none — access is resolved entirely at the session/connection level, matching
ADR-0032/the docs page's "interactively authenticated" characterization: it
worked immediately, tied to whatever account this Claude Code session is
connected as (an account holding several unrelated, apparently per-client
Claude Design projects), with per-project sharing/roles (`viewer` /
`commenter` / `editor`) layered on top and a separate "standing write grant"
consent step the first time a project is written to unconditionally.
