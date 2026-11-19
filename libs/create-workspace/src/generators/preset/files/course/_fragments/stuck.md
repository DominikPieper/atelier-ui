## When you are stuck

Claude cannot see your terminal or your screen. A report that says "it does not work" gets a
guess; a report with the four things below gets a diagnosis. Paste these four things:

1. **The exact error.** The first error, copied, not retyped and not summarised. The last
   line of a long output is usually a consequence.
2. **The exit code.** Run the gate as below and read the file afterwards. Piping into `head`
   or `grep` reports the pipe's exit code, which is always `0`, so a red gate looks green.
3. **What you expected.** One line: "exit 0", "the compact card is tighter", "no axe
   violation".
4. **What changed last.** The commands you ran in order, and the last thing that was green
   before it broke.

```shell
npm run check:stories > check.out 2>&1; echo $?
```

A stuck report you can fill in and paste:

```text
A gate is red. Help me find the cause, not just a patch.

Ran:       npm run check:stories > check.out 2>&1; echo $?
Exit code: 1
Output:    check.out (read it; the first error is the one that matters)
Expected:  exit 0, every story renders and passes its play and axe check
Changed:   since the last green run I only added the density prop and its stories (the failing story is the new one)

Before you change anything, tell me what you think the cause is and what
would prove you wrong.
```
