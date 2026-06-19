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

# CampusCash — M1 Planning

## Theme
Student Finance Tracker

---

## Wireframes

### Setup Screen
```
+---------------------------+
|   Welcome to CampusCash  |
|   Name: [____________]   |
|   Period: [Trimester v]  |
|   Income: [__________]   |
|   Currency: [RWF v]      |
|   Housing: [Yes/No v]    |
|   [Get Started] [Skip]   |
+---------------------------+
```

### App Layout (Mobile)
```
+--------+------------------+
| side   |                  |
| bar    |   Section        |
|        |   Content        |
| Home   |                  |
| Dash   |                  |
| Trans  |                  |
| Add    |                  |
| Sett   |                  |
| About  |                  |
+--------+------------------+
```

### Dashboard
```
+----------------------------------+
| Income | Expenses | Balance | Top |
|--------|----------|---------|-----|
| [Budget Cap input]               |
| [====Progress Bar====]           |
| [7-day trend chart canvas]       |
| Food    [========] 45%           |
| Housing [====] 30%               |
+----------------------------------+
```

### Transactions
```
+----------------------------------+
| [Search regex input] [x] ignore  |
| Sort: [Date] [Desc] [Amount]     |
|----------------------------------|
| Desc | Amount | Cat | Type | Date|
|------|--------|-----|------|-----|
| ...  | ...    | ... | ...  | ... |
|----------------------------------|
| [Export JSON]  [Import JSON]     |
+----------------------------------+
```

---

## Data Model

### Transaction
```json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": "12.50",
  "category": "Food",
  "type": "expense",
  "date": "2025-09-30",
  "createdAt": "2025-09-30T10:00:00.000Z",
  "updatedAt": "2025-09-30T10:00:00.000Z"
}
```

### Settings
```json
{
  "name": "Sonia",
  "period": "Trimester",
  "startDate": "2025-09-01",
  "endDate": "2025-11-30",
  "income": "500000",
  "currency": "RWF",
  "housing": "yes",
  "rent": "80000"
}
```

### Categories
Food, Housing, Transport, Books & Stationery, Entertainment, Other

---

## Accessibility Plan
- Skip-to-content link at top of page
- All inputs have associated labels
- Errors announced via aria-live="polite"
- Budget exceeded announced via aria-live="assertive"
- Visible focus styles on all interactive elements
- Semantic landmarks: header, nav, main, section, footer
- Keyboard-only navigation supported throughout
- prefers-reduced-motion respected

---

## File Structure
```
campuscash/
├── index.html
├── seed.json
├── tests.html
├── PLANNING.md
├── README.md
├── styles/
│   ├── main.css
│   └── dashboard.css
└── scripts/
    ├── ui.js
    ├── state.js
    ├── storage.js
    ├── validators.js
    └── search.js
```
