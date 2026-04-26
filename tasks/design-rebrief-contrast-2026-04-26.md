# Design rebrief — contrast verification log (R1)

_Generated 2026-04-26 by `tools/scripts/wcag-contrast.mjs`._

Direction C, Q1–Q5 decisions per `~/.claude/plans/atelier-design-rebrief.md` §15.
Targets: WCAG 2.2 AA — normal text 4.5:1, large text/UI 3:1.


# LIGHT MODE

| pair | role | ratio | target | result | note |
|---|---|---|---|---|---|
| `text` on `surface` | normal | **16.39** | 4.5 | PASS | body text |
| `text` on `surface-raised` | normal | **17.85** | 4.5 | PASS | body text on raised |
| `text` on `surface-sunken` | normal | **14.72** | 4.5 | PASS | body text on sunken (code blocks) |
| `text-muted` on `surface` | normal | **6.88** | 4.5 | PASS | secondary text |
| `text-muted` on `surface-raised` | normal | **7.50** | 4.5 | PASS | secondary on raised |
| `text-muted` on `surface-sunken` | normal | **6.18** | 4.5 | PASS | secondary on sunken |
| `primary` on `surface` | large | **14.26** | 3 | PASS | primary heading / focus ring |
| `primary` on `surface-raised` | large | **15.54** | 3 | PASS | primary on raised |
| `primary` on `surface-sunken` | large | **12.81** | 3 | PASS | primary on sunken |
| `text-on-primary` on `primary` | normal | **15.54** | 4.5 | PASS | button label on primary fill |
| `text-on-primary` on `primary-hover` | normal | **12.34** | 4.5 | PASS | button label on primary hover |
| `text-on-primary` on `primary-active` | normal | **17.53** | 4.5 | PASS | button label on primary active |
| `accent` on `surface` | large | **5.45** | 3 | PASS | accent text/icon |
| `accent` on `surface-raised` | large | **5.93** | 3 | PASS | accent on raised |
| `accent` on `accent-bg` | normal | **5.04** | 4.5 | PASS | accent text on accent-tinted callout |
| `text-on-accent` on `accent` | normal | **5.93** | 4.5 | PASS | label on accent fill |
| `text` on `accent-bg` | normal | **15.16** | 4.5 | PASS | body text on accent callout |
| `danger-text` on `danger-bg` | normal | **9.13** | 4.5 | PASS | danger text on danger callout |
| `success-text` on `success-bg` | normal | **7.91** | 4.5 | PASS | success text on success callout |
| `warning-text` on `warning-bg` | normal | **6.75** | 4.5 | PASS | warning text on warning callout |
| `info-text` on `info-bg` | normal | **9.33** | 4.5 | PASS | info text on info callout |
| `danger` on `surface` | normal | **7.48** | 4.5 | PASS | danger heading on neutral |
| `danger` on `surface-raised` | normal | **8.15** | 4.5 | PASS | danger heading on raised |
| `success` on `surface` | normal | **5.97** | 4.5 | PASS | success heading on neutral |
| `success` on `surface-raised` | normal | **6.50** | 4.5 | PASS | success heading on raised |
| `warning` on `surface` | normal | **5.16** | 4.5 | PASS | warning heading on neutral |
| `info` on `surface` | normal | **7.26** | 4.5 | PASS | info heading on neutral |
| `border` on `surface` | decorative | **1.37** | n/a | INFO | card border (card fill identifies, WCAG 1.4.11 exempt) |
| `border` on `surface-raised` | decorative | **1.50** | n/a | INFO | card border on raised (decorative) |
| `border-strong` on `surface` | ui | **4.44** | 3 | PASS | input / outline-button border (functional, must ≥3:1) |
| `border-strong` on `surface-raised` | ui | **4.84** | 3 | PASS | input border on raised (functional) |

**light: 31 pass / 0 fail**

# DARK MODE

| pair | role | ratio | target | result | note |
|---|---|---|---|---|---|
| `text` on `surface` | normal | **16.65** | 4.5 | PASS | body text |
| `text` on `surface-raised` | normal | **15.09** | 4.5 | PASS | body text on raised |
| `text` on `surface-sunken` | normal | **17.34** | 4.5 | PASS | body text on sunken (code blocks) |
| `text-muted` on `surface` | normal | **8.68** | 4.5 | PASS | secondary text |
| `text-muted` on `surface-raised` | normal | **7.87** | 4.5 | PASS | secondary on raised |
| `text-muted` on `surface-sunken` | normal | **9.04** | 4.5 | PASS | secondary on sunken |
| `primary` on `surface` | large | **7.35** | 3 | PASS | primary heading / focus ring |
| `primary` on `surface-raised` | large | **6.66** | 3 | PASS | primary on raised |
| `primary` on `surface-sunken` | large | **7.65** | 3 | PASS | primary on sunken |
| `text-on-primary` on `primary` | normal | **6.26** | 4.5 | PASS | button label on primary fill |
| `text-on-primary` on `primary-hover` | normal | **7.77** | 4.5 | PASS | button label on primary hover |
| `text-on-primary` on `primary-active` | normal | **9.60** | 4.5 | PASS | button label on primary active |
| `accent` on `surface` | large | **9.64** | 3 | PASS | accent text/icon |
| `accent` on `surface-raised` | large | **8.74** | 3 | PASS | accent on raised |
| `accent` on `accent-bg` | normal | **8.28** | 4.5 | PASS | accent text on accent-tinted callout |
| `text-on-accent` on `accent` | normal | **9.64** | 4.5 | PASS | label on accent fill |
| `text` on `accent-bg` | normal | **14.31** | 4.5 | PASS | body text on accent callout |
| `danger-text` on `danger-bg` | normal | **8.58** | 4.5 | PASS | danger text on danger callout |
| `success-text` on `success-bg` | normal | **9.77** | 4.5 | PASS | success text on success callout |
| `warning-text` on `warning-bg` | normal | **10.02** | 4.5 | PASS | warning text on warning callout |
| `info-text` on `info-bg` | normal | **9.65** | 4.5 | PASS | info text on info callout |
| `danger` on `surface` | normal | **7.00** | 4.5 | PASS | danger heading on neutral |
| `danger` on `surface-raised` | normal | **6.34** | 4.5 | PASS | danger heading on raised |
| `success` on `surface` | normal | **10.69** | 4.5 | PASS | success heading on neutral |
| `success` on `surface-raised` | normal | **9.68** | 4.5 | PASS | success heading on raised |
| `warning` on `surface` | normal | **11.02** | 4.5 | PASS | warning heading on neutral |
| `info` on `surface` | normal | **8.73** | 4.5 | PASS | info heading on neutral |
| `border` on `surface` | decorative | **1.57** | n/a | INFO | card border (card fill identifies, WCAG 1.4.11 exempt) |
| `border` on `surface-raised` | decorative | **1.43** | n/a | INFO | card border on raised (decorative) |
| `border-strong` on `surface` | ui | **3.58** | 3 | PASS | input / outline-button border (functional, must ≥3:1) |
| `border-strong` on `surface-raised` | ui | **3.24** | 3 | PASS | input border on raised (functional) |

**dark: 31 pass / 0 fail**

## Summary

- light: 31 pass / 0 fail
- dark:  31 pass / 0 fail
- total: 62 pass / 0 fail

All proposed token pairs meet WCAG 2.2 AA. Cleared to ship as R1.
