# Design rebrief — contrast verification log (R1)

_Generated 2026-04-26 by `tools/scripts/wcag-contrast.mjs`._

Direction C, Q1–Q5 decisions per `~/.claude/plans/atelier-design-rebrief.md` §15.
Targets: WCAG 2.2 AA — normal text 4.5:1, large text/UI 3:1.


# LIGHT MODE

| pair | role | ratio | target | result | note |
|---|---|---|---|---|---|
| `text` on `surface` | normal | **17.85** | 4.5 | PASS | body text |
| `text` on `surface-raised` | normal | **17.06** | 4.5 | PASS | body text on raised |
| `text` on `surface-sunken` | normal | **16.30** | 4.5 | PASS | body text on sunken (code blocks) |
| `text-muted` on `surface` | normal | **7.58** | 4.5 | PASS | secondary text |
| `text-muted` on `surface-raised` | normal | **7.24** | 4.5 | PASS | secondary on raised |
| `text-muted` on `surface-sunken` | normal | **6.92** | 4.5 | PASS | secondary on sunken |
| `primary` on `surface` | large | **6.87** | 3 | PASS | primary heading / focus ring |
| `primary` on `surface-raised` | large | **6.57** | 3 | PASS | primary on raised |
| `primary` on `surface-sunken` | large | **6.27** | 3 | PASS | primary on sunken |
| `text-on-primary` on `primary` | normal | **6.87** | 4.5 | PASS | button label on primary fill |
| `text-on-primary` on `primary-hover` | normal | **9.41** | 4.5 | PASS | button label on primary hover |
| `text-on-primary` on `primary-active` | normal | **12.47** | 4.5 | PASS | button label on primary active |
| `danger-text` on `danger-bg` | normal | **6.80** | 4.5 | PASS | danger text on danger callout |
| `success-text` on `success-bg` | normal | **6.49** | 4.5 | PASS | success text on success callout |
| `warning-text` on `warning-bg` | normal | **6.15** | 4.5 | PASS | warning text on warning callout |
| `info-text` on `info-bg` | normal | **8.24** | 4.5 | PASS | info text on info callout |
| `danger` on `surface` | normal | **6.47** | 4.5 | PASS | danger heading on neutral |
| `danger` on `surface-raised` | normal | **6.18** | 4.5 | PASS | danger heading on raised |
| `success` on `surface` | normal | **5.02** | 4.5 | PASS | success heading on neutral |
| `success` on `surface-raised` | normal | **4.79** | 4.5 | PASS | success heading on raised |
| `warning` on `surface` | normal | **5.02** | 4.5 | PASS | warning heading on neutral |
| `info` on `surface` | normal | **5.93** | 4.5 | PASS | info heading on neutral |
| `border` on `surface` | decorative | **1.23** | n/a | INFO | card border (card fill identifies, WCAG 1.4.11 exempt) |
| `border` on `surface-raised` | decorative | **1.18** | n/a | INFO | card border on raised (decorative) |
| `border-strong` on `surface` | ui | **4.76** | 3 | PASS | input / outline-button border (functional, must ≥3:1) |
| `border-strong` on `surface-raised` | ui | **4.55** | 3 | PASS | input border on raised (functional) |

**light: 26 pass / 0 fail**

# DARK MODE

| pair | role | ratio | target | result | note |
|---|---|---|---|---|---|
| `text` on `surface` | normal | **17.35** | 4.5 | PASS | body text |
| `text` on `surface-raised` | normal | **15.72** | 4.5 | PASS | body text on raised |
| `text` on `surface-sunken` | normal | **17.95** | 4.5 | PASS | body text on sunken (code blocks) |
| `text-muted` on `surface` | normal | **7.41** | 4.5 | PASS | secondary text |
| `text-muted` on `surface-raised` | normal | **6.72** | 4.5 | PASS | secondary on raised |
| `text-muted` on `surface-sunken` | normal | **7.67** | 4.5 | PASS | secondary on sunken |
| `primary` on `surface` | large | **10.83** | 3 | PASS | primary heading / focus ring |
| `primary` on `surface-raised` | large | **9.81** | 3 | PASS | primary on raised |
| `primary` on `surface-sunken` | large | **11.20** | 3 | PASS | primary on sunken |
| `text-on-primary` on `primary` | normal | **10.83** | 4.5 | PASS | button label on primary fill |
| `text-on-primary` on `primary-hover` | normal | **12.51** | 4.5 | PASS | button label on primary hover |
| `text-on-primary` on `primary-active` | normal | **14.14** | 4.5 | PASS | button label on primary active |
| `danger-text` on `danger-bg` | normal | **8.58** | 4.5 | PASS | danger text on danger callout |
| `success-text` on `success-bg` | normal | **9.87** | 4.5 | PASS | success text on success callout |
| `warning-text` on `warning-bg` | normal | **11.61** | 4.5 | PASS | warning text on warning callout |
| `info-text` on `info-bg` | normal | **11.99** | 4.5 | PASS | info text on info callout |
| `danger` on `surface` | normal | **6.87** | 4.5 | PASS | danger heading on neutral |
| `danger` on `surface-raised` | normal | **6.23** | 4.5 | PASS | danger heading on raised |
| `success` on `surface` | normal | **10.91** | 4.5 | PASS | success heading on neutral |
| `success` on `surface-raised` | normal | **9.88** | 4.5 | PASS | success heading on raised |
| `warning` on `surface` | normal | **11.39** | 4.5 | PASS | warning heading on neutral |
| `info` on `surface` | normal | **8.87** | 4.5 | PASS | info heading on neutral |
| `border` on `surface` | decorative | **1.30** | n/a | INFO | card border (card fill identifies, WCAG 1.4.11 exempt) |
| `border` on `surface-raised` | decorative | **1.18** | n/a | INFO | card border on raised (decorative) |
| `border-strong` on `surface` | ui | **3.99** | 3 | PASS | input / outline-button border (functional, must ≥3:1) |
| `border-strong` on `surface-raised` | ui | **3.62** | 3 | PASS | input border on raised (functional) |

**dark: 26 pass / 0 fail**

## Summary

- light: 26 pass / 0 fail
- dark:  26 pass / 0 fail
- total: 52 pass / 0 fail

All proposed token pairs meet WCAG 2.2 AA. Cleared to ship as R1.
