# Migration playbook

Between greenfield Build and a one-off Audit lies the case where the file already exists, the Audit produced a punch list, and now things need to *change* without breaking the people downstream. This file is that path.

> The single biggest mistake in Figma migrations is making them all at once. Almost every operation in this file has a "do additively, then remove later" form. Use it.

## When to load this file

Load it when the user's intent is to **change an existing structure** — not to assess one (Audit) and not to create one from scratch (Build). Trigger phrases:

- "rename this Variable / Variant Property / Component"
- "split this Variant Set into…"
- "add a Mode"
- "split our library"
- "restructure these tokens"
- "we ran the audit, now fix the Critical findings"

If the user has already run the Audit and is now in fix-mode, you'll often arrive here from `audit-checklist.md`. The Audit categories map directly onto the operations below.

## Pre-flight — always

Run all four before touching anything:

1. **Re-run discovery.** `figma_get_file_data` (or `figma_get_variables` + `figma_get_styles` for large files). The state you remember from the last session may not be the current state.
2. **Snapshot.** Pin a screenshot or `figma_get_file_data` dump as "before". You will refer back to it.
3. **Identify the safety class** for each planned change (table below). A Breaking change in your set forces the coordination protocol; a list of all-Safe changes can run end-to-end without ceremony.
4. **Tell the consumers.** Code (Style Dictionary export, Token Studio config, manually-maintained `tokens.css`), other Figma files using this as a library, and the design team. The cost of silence is debugging "the production app's primary color is wrong" three days later.

## Safety classes

The figma-console-mcp tool surface and the Figma Variables API are designed so that *most* renames preserve aliases — the breakage shows up in code that references by name. Categorize before you act.

### Safe — references are preserved automatically

| Operation                                  | What carries through                                          |
|--------------------------------------------|---------------------------------------------------------------|
| `figma_rename_variable`                    | Aliases pointing at the renamed Variable are auto-updated.    |
| `figma_rename_mode`                        | Values per mode are preserved; the Mode keeps its `modeId`.   |
| Renaming a Component Set                   | Instances follow.                                             |
| Reordering Variants in a Component Set     | No effect on instances or the Variant Property values.        |

These still need a code-side update because most exporters key by *name* — but the Figma file itself stays internally consistent.

### Mostly safe — additive, but verify after

| Operation                                       | Verify                                                                                   |
|-------------------------------------------------|------------------------------------------------------------------------------------------|
| `figma_add_mode`                                | Existing Variables get the new mode seeded with their current value. Re-confirm scopes.  |
| `figma_create_variable` / `figma_batch_create_variables` | New Variable doesn't collide with an existing name (case-sensitive).                |
| Adding a Variant to an existing Component Set   | The new Variant Property combination renders correctly; existing instances keep their mapping. |
| Adding a Component Property                     | Instances pick up the default value. Inspect a few.                                      |

### Breaking — needs the coordination protocol

| Operation                                  | What breaks                                                                                                |
|--------------------------------------------|------------------------------------------------------------------------------------------------------------|
| `figma_delete_variable`                    | Every aliased Variable showing the old name as a broken reference; every component fill bound to it.       |
| `figma_delete_variable_collection`         | Same as above, multiplied by the number of Variables in the collection.                                    |
| Removing a Mode                            | All values for that mode are gone; bindings fall back to default.                                          |
| Removing a Variant from a Component Set    | Instances using that combination "stick" but no longer track upstream changes.                             |
| Renaming a Variant Property or its values  | Existing instances reset to the property's default — every consumer rebuilds.                              |
| Splitting one Component into two           | Old instances continue pointing at the original; downstream rebuild required.                              |
| Splitting a Library                        | Every consumer file's import breaks; needs a manual swap-instances pass.                                   |

## Coordination protocol — for every Breaking change

The same five steps regardless of the operation:

1. **Announce.** What is changing, when, and what consumers need to do. A Slack message and an entry in the file's Cover page.
2. **Add the new shape alongside the old.** Both shapes exist for one cycle. Old is marked with `_deprecated` prefix or the description is updated.
3. **Migrate consumers.** Code (rename in `tokens.css` / Style Dictionary source / manually). Other Figma files (`Swap Instance`). One designer per consumer file is the unit of work.
4. **Wait.** Don't remove the old shape until the next design review or the next code-side release, whichever is later. This is the gap where "wait, we still use that" surfaces.
5. **Remove.** `figma_delete_variable` (or equivalent) on the old shape. Confirm via `figma_get_file_data` that no broken aliases remain. Update the Cover page note.

Skipping step 4 is the most common failure. If you find yourself wanting to skip it because "we checked, nobody uses it" — assume someone does.

## Recipes — common operations end-to-end

### Rename a Variable safely

```
1. figma_get_variables         — confirm current name + ID + aliases
2. figma_rename_variable        — Figma updates all aliases; instances follow
3. Re-export to code            — codesync exporter writes the new name
4. CI runs                      — diff is "rename only"; reviewer confirms
5. Update Cover page note if the rename is user-facing
```

The change is Safe inside Figma; the code-side rename is the only chance for drift. If the codesync exporter keys by ID instead of name (rare), step 3 is a no-op.

### Add a Mode without breaking existing components

```
1. figma_get_variables             — count the Variables in target collection
2. figma_execute → collection.addMode('NewMode')
3. For each Variable, decide:
   - alias to a primitive (most semantic tokens),
   - inherit from the default mode (most spacing / radius),
   - explicit value per Variable (rare; probably means the Variable should be renamed).
4. Use figma_batch_update_variables to seed the new mode in one call.
5. figma_take_screenshot a representative component in the new mode.
6. Update the codesync exporter's mode list.
```

Mostly safe — but the Mode now exists across **N × M** Variables and every one of them needs an explicit value. Don't ship the Mode until the count is verified.

### Split a Variant Set into two Components

The hardest legitimate refactor. Use when the cardinality has exploded (e.g., a `Button` Component Set with 5 variants × 4 sizes × 5 states × 3 widths = 300 permutations) and the user has confirmed the split is the right answer (see `decision-heuristics.md`).

```
1. Audit which axis to split on. The right answer is usually the one that:
   - Is least likely to be cross-referenced (a "primary vs. icon button" split is cleaner than a "primary vs. lg button").
   - Has the smallest cardinality on the side becoming its own Component.
2. Build the new Component(s) in a parallel Component Set with a different name (e.g. `IconButton`).
3. Document the migration on the Cover page or in the Component description (`figma_set_description`):
   "IconButton extracted from Button — was variant=icon-only. Migrate via Swap Instance."
4. Wait one design cycle (Step 4 of the coordination protocol).
5. Migrate consumer files via Swap Instance.
6. Remove the old Variant from the original Component Set.
```

The new Component does NOT inherit instance history. Every instance referencing the extracted Variant has to be re-bound manually. Without coordination this turns into a multi-week regression hunt.

### Promote a Primitive to a Semantic Token

When you discover a primitive is being used semantically across many places (e.g., `primitive/teal/600` is what every component means by "primary action"), retrofit a semantic Variable on top.

```
1. figma_create_variable → 'color/primary' aliased to 'primitive/teal/600' in every Mode.
2. Audit usages: find every component fill bound to 'primitive/teal/600' that should be 'color/primary'.
3. figma_execute → walk components, rebind those fills via setBoundVariableForPaint.
4. The primitive stays — it's still the leaf value. Components now go through the semantic.
```

Safe operation. The primitive's name doesn't change; only the binding layer does. Downstream code that imports the primitive directly continues working; downstream code can adopt the semantic at its own pace.

### Restructure Variant Properties (e.g., split `state` into `interactive` + `disabled`)

```
1. Add the new properties in parallel (figma_execute on the Component Set).
2. Each existing variant gets a default value for the new properties.
3. Update consumers: each instance has to be inspected. Worst case is fully manual.
4. Once all instances migrated, remove the old property.
```

This is Breaking. There is no "alias" mechanism for Variant Properties. Always use the coordination protocol.

### Split a Library

The largest possible migration. Treat it like a code monorepo split: every consumer file is a separate work unit.

```
1. Plan the split first. What lives where, and why?
2. Create the new Library file (a fresh file with the same conventions; see naming-and-file-structure.md).
3. Copy the components and Variable Collections that belong in the new Library.
4. Publish both Libraries.
5. For each consumer file: Swap to new Library where appropriate. This is the slow step.
6. Wait one full design cycle.
7. Remove the moved-out content from the original Library.
```

A Library split is rarely the right answer compared to *organizing* the existing Library better. Confirm with the user that they have actually outgrown the file (>100 components OR multiple distinct product surfaces) before recommending this.

## Post-flight — always

After every migration, regardless of size:

1. **Re-run the architectural Audit** (`audit-checklist.md`). The exact thing that triggered the migration should now read "Resolved" in the new audit.
2. **Diff with the snapshot.** What changed beyond the intended scope? Unexpected diffs are bugs.
3. **Update Component descriptions** with `figma_set_description` if the Component's API changed. The description is what designers see in the asset panel; an out-of-date description is a worse-than-no-doc state.
4. **Run the codesync exporter** (or have the engineering team run theirs) and verify the diff is exactly the intended change. See `code-sync.md` for the drift sources.
5. **Update the Cover page note** with what changed, the date, and the rationale. Future-you will thank you.

If a migration is large enough to span multiple sessions, treat each session as a self-contained step with its own pre-flight + post-flight. Do not leave the file in an in-between state at the end of a working day.

## Out-of-scope here

- Visual redesigns where the structure stays the same (just CSS / stroke / radius tweaks). Use Build mode with the existing structure as discovery input.
- Component implementation changes that don't affect the public Variant Property surface. Treat as a normal `figma_execute` edit, no migration ceremony.
- Library publishing / versioning workflow itself. That's Figma library mechanics, not architecture.
