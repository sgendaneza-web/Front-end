# CampusCash
Track student spending, Cap spending, search and sort transactions in a Student budget tracker.

---

## Features
- Setting up flow/name, period, currency, housing/rent.
Add, edit and delete transactions
Provides search/replace functionality and highlights the matches.Allows searching and replacing with real-time highlighting.
The display can be sorted by date, description, amount.
The Dashboard displays the following information: stats, budget progress bar, 7-day chart, and category bars.
- Validate and import/export JSON data
- localStorage persistence
- Fully keyboard navigable, screen-reader friendly

---

## Regex Catalog

| Rule | Pattern | Example |
|---|---|---|
| Description | `/^\S(?:.*\S)?$/` | Yes to `"Lunch"`  No to`" Lunch"`  |
| Amount | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | Yes to`"12.50"` No to `"12.999"`  |
| Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | Yes to`"2025-09-30"` No to `"2025-13-01"`  |
| Category | `/^[A-Za-z&]+(?:[ -][A-Za-z&]+)*$/` | Yes to`"Food"` No to `"Food123"`  |
| **Advanced** | `/\b(\w+)\s+\1\b/i` | No to`"lunch lunch"`  (duplicate word) |

---

## Keyboard Map
| Key | Action |
|---|---|
Move forward/backward |
Click and hold on buttons and links |
C | Cancel edit |

---

## Accessibility
The three features listed above are all part of this.All of the three features above are part of it.
- All inputs have labels
Avoid using the following:Do not use:
- `prefers-reduced-motion` respected

---

## How to Run
1. Open in VS Code
Click 2 to launch the page in Live Server.
3. Open tests.html as you would open any other HTML file.

---

## Demo Video
https://drive.google.com/file/d/1red9akoKKyj6eedSXmQ1I14gyBc3Oz_d/view?usp=sharing
