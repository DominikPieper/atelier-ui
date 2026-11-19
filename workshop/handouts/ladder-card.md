# The ladder: what the agent checks itself with

Five tools, in the order the course meets them. Each one catches something the one below it cannot see.

| Stage | Tool                                           | Catches                                                          | Does not see                                                                 | In the course                  |
| ----- | ---------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| 0     | Figma linter                                   | raw colours, default layer names, detached instances             | whether the design is right; spacing and radius                              | Day 1 Block 03, Day 2 Block 01 |
| 1     | Compiler (`npm run build`)                     | an invented value, a binding to an input that does not exist     | an invented static attribute (`shadow="lg"`), an invented event              | Day 1 Block 04                 |
| 2     | ESLint (`npm run lint`)                        | missing `alt`, click without keyboard, not focusable             | a raw `<button>` where a library component exists; meaning (`alt=""` passes) | Day 1 Block 02                 |
| 3     | Stylelint (`npm run check:stylelint`)          | a raw colour in a `.css` file, a token bypass                    | inline `style=`, a `styles:` array, named colours, `oklch()`                 | Demo D-1, Day 1 Block 05       |
| 4     | Story tests with axe (`npm run check:stories`) | a story that stops rendering, a failing `play`, an axe violation | anything without a story; dark mode; a keyboard path no `play` walks         | Day 1 Block 04, Day 2 Block 03 |

**Break it on purpose. The tool says so. The agent repairs.**

The prompt that drives each stage:

> Run `<command>`. Report every exit code. If one is not 0, read the output (the full log if the summary has no error text), fix it and run it again.

Three things to remember:

1. **Green does not mean right.** Lint demands `alt`, the agent writes `alt=""`, lint is green, and a meaningful image stays hidden from screen readers.
2. **Each row has a blind spot.** What a tool does not see, you check yourself, or the next stage does.
3. **None of the five catches an invented name or a hand-built element.** For that, every property needs a `docs-show` source in the receipts table.
