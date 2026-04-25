---
scenario: code-verify-token-rename
---

I just consolidated `--ui-color-on-primary` into `--ui-color-text-on-primary` and made it mode-aware (white in light, dark slate in dark). Tests pass and the Figma side is updated. Before I commit, I want to confirm the Primary button actually renders dark text on cyan in dark mode — not the old white-on-cyan. The repo is Angular with Storybook.
