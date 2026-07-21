<!--
Thanks for the PR. Fill in the sections that apply; delete the ones that
don't. The Figma checklist is required only for PRs that add, rename, or
substantially refactor a component — delete it for tooling / docs / fix
PRs.
-->

## Summary

<!-- One sentence — what changes and why. -->

## How to review

<!-- Optional: the file or scenario to look at first. -->

---

## Figma component checklist

> **Required only for PRs that add, rename, or substantially refactor a component. Delete this section for tooling, docs, or bug-fix PRs.**
>
> Full guide: [`plan/figma-component-checklist.md`](../plan/figma-component-checklist.md)

- [ ] Complete variant matrix — every value in `metadata.variantMatrix` exists as a Figma variant on the master `COMPONENT_SET`.
- [ ] Descriptions annotated — Figma component description matches `metadata.purpose`; each variant has a one-line description.
- [ ] Token-linked styles — no hardcoded colour, spacing, typography, radius, or shadow values; all bound via Figma Variables to `--ui-*` tokens.
- [ ] Auto layout throughout — no absolute positioning.
- [ ] Name alignment — Figma component name matches the spec selector (`AtlButton`); variant property names + values match the spec unions.
- [ ] Inventory page — one `INSTANCE` of the new master added; TOC count + date bumped.

## Drift gates

<!-- Confirm the local pre-push hook ran clean (or note which gates you knowingly bypassed and why). -->

- [ ] `npm run check:all` passes locally.
