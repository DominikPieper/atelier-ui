# What a design system has to bring

Mark each row for your own design system: yes, partly or no.

| Row         | The question                                                                                                                  | "Yes" looks like                                                                                                                                          | yes / partly / no | Where to check it                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------- |
| 1 Describe  | Can the agent read what each component is for and what each property does?                                                    | A description per component and per property, values printed in full, the import line in the usage example; read through the Storybook MCP (`docs-show`). | [ ] / [ ] / [ ]   | `/storybook-readiness`            |
| 2 Constrain | Does the API leave little to guess?                                                                                           | Literal unions instead of `string`, one variant axis instead of a pile of Boolean props, composition over configuration, a default for every property.    | [ ] / [ ] / [ ]   | `/design-principles`              |
| 3 Tokens    | Is every colour, spacing and radius a named token, with the same name in Figma and in code, and do modes switch through them? | Every value resolves to a named token; the name is identical on both sides; dark mode switches through the tokens.                                        | [ ] / [ ] / [ ]   | `/readiness`                      |
| 4 Prove     | Does every variant value and state have a story, and do the stories run as tests with axe?                                    | One story per variant value and Boolean state; every story runs as a test, accessibility check included.                                                  | [ ] / [ ] / [ ]   | `/storybook-readiness`            |
| 5 Enforce   | Is every rule that can be enforced in a linter or the compiler, and not in a wiki?                                            | Strict TypeScript, ESLint, stylelint and a Figma linter carry the rules.                                                                                  | [ ] / [ ] / [ ]   | the ladder card on `/cheat-sheet` |
| 6 Instruct  | Does the repo have its own rules file with the exact check commands, and a skill for the recurring task?                      | A rules file (`CLAUDE.md` or `AGENTS.md`) with a "Definition of Done" that lists the commands; one skill for the recurring task.                          | [ ] / [ ] / [ ]   | your rules file                   |
| 7 Measure   | Do you know the agent is better with the design system than without?                                                          | The same prompt run with and without the context, the results compared.                                                                                   | [ ] / [ ] / [ ]   | run it once yourself              |

**Pick the weakest row. That is your next step.**

Where the course taught each row:

1. Describe: Day 1 Blocks 04 and 05, Day 2 Block 02.
2. Constrain: Day 2 Block 01.
3. Tokens: Day 1 Block 03.
4. Prove: Day 1 Block 04, Day 2 Block 03.
5. Enforce: the ladder, Day 1 Blocks 02 and 05.
6. Instruct: Day 2 Blocks 00 and 05.
7. Measure: Day 1 Block 00 (the guardrail demo is the smallest form); an exercise of its own comes with cohort 2.

The how: https://atelier.pieper.io/readiness · https://atelier.pieper.io/storybook-readiness · https://atelier.pieper.io/design-principles
