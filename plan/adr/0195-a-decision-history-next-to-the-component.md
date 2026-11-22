---
status: accepted
date: 2026-11-22
sources:
  - owner, 2026-11-22 ("die Idee, dass wir den über den Skill anlegen, sodass wir die Informationen, die wir üblicherweise in einer Story in Jira haben, auch noch mal persistent mit im Repo liegen haben … referenzieren wir die Jira-Stories anhand einer Nummer … dass man später Entscheidungen und die Herkunft von Entscheidungen mit im Repo hat"; then the choices "Dauerhafte Entscheidungshistorie" and "Neben der Komponente")
  - owner, 2026-11-22 ("wir müssen dann halt gut entscheiden, welche Infos reinkommen, am besten welche, die nicht zu schnell veralten, und dass wir die Infos am Ende nicht drei- und viermal da liegen haben")
  - plan/adr/0193-task-cards-not-prompts-and-a-handoff-that-dissolves.md (point 4, the dissolving handoff)
  - plan/adr/0096-the-handoff-a-picture-cannot-carry.md
---

# A decision history next to the component

## Status

Accepted. Supersedes ADR-0193 point 4 (corrected in place, same commit).

## Context

ADR-0193 made the handoff document a short-lived order that is dissolved at the end of Day 2, to
keep it from drifting from Figma and code. The owner pointed out what that loses: months later
nobody can see why the Toast does not stack or where that came from, and a ticket may be
archived by then. Tools such as Kiro keep a folder of specs per feature for that reason, and those
specs do go stale. The owner's own project keeps decisions in the repo; the condition he named is
that only slowly ageing information goes in and that no fact lives in three or four places.

## Decision

1. **Each component carries a decision file next to its source,** `<name>.decisions.md`, committed
   with the code. In the course it replaces the handoff document; the German term is
   „Entscheidungsdatei“.
2. **Header:** the ticket key (in the course the brief path) and the Figma file and node. The ticket
   text is not copied.
3. **`## Offene Fragen`** while a build needs answers; **`## Entscheidungen`** as dated,
   append-only entries (Umfang, Verhalten, Bewusste Abweichung, Sonstiges), each with its reason and
   who decided. A change is a new entry naming the one it replaces; old entries are never edited.
4. **One place per fact:** requirement text in the ticket, appearance in Figma, API in code and
   docs-show, behaviour in detail in the `play` tests, the why and where-from of a decision in the
   decision file. An entry holds only what ages slowly: the decision and its reason, never current
   values or counts.
5. **The seat skill** creates the file when a build starts without one, fills the header, writes
   open questions and stops; with a file present it reads it before any change and appends new
   decisions. Day 2 ends with „Entscheidungen festhalten und committen“ instead of dissolving.

Rejected: dissolving the document (loses provenance); a full maintained spec per component in the
manner of Kiro (requirements, design, tasks — goes stale as soon as nobody maintains it); a central
folder (separated from the code it explains, the agent finds it less often).

## Consequences

- The course teaches a pattern participants can take home unchanged: ticket key plus decisions next
  to the component.
- Staleness is limited by form, not by discipline alone: history entries cannot become wrong, and
  current truth stays in tests, Figma and code. A file can still collect noise; the review of a
  component change should look at its new entries.
- The repo's own `design-to-code` skill keeps its handoff template for repo work for now.
