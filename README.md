# 💰 Expense Tracker — CLI Project

A beginner Node.js project that covers **variables, data types, loops, functions, and the `fs` module** in one real working app.

---

## 📁 Project Structure

```
expense-tracker/
├── index.js        ← main app (all logic lives here)
├── expenses.json   ← auto-created when you add your first expense
├── package.json    ← project config + chalk dependency
└── README.md
```

---

## ⚙️ Setup

```bash
npm install
```

---

## 🚀 Commands

| Command | What it does |
|---|---|
| `node index.js help` | Show command reference |
| `node index.js add "Coffee" 80 Food` | Add an expense |
| `node index.js list` | List all expenses |
| `node index.js summary` | Totals grouped by category |
| `node index.js delete <ID>` | Delete one expense by ID |

**Categories:** Food · Travel · Shopping · Bills · Other

---

## 🧠 Concepts Covered — With Line References

### 1. Variables & Data Types

| Type | Example in code |
|---|---|
| `string` | `const DATA_FILE = 'expenses.json'` |
| `number` | `amount: parseFloat(amount)` |
| `boolean` | `isNaN(amount)` — returns true/false |
| `array` | `const CATEGORIES = ['Food', 'Travel', ...]` |
| `object` | `const newExpense = { id, description, amount, ... }` |

### 2. Functions
Every action is its own function with one clear job:
- `loadExpenses()` — reads from disk, returns array
- `saveExpenses(expenses)` — writes array to disk
- `addExpense(desc, amount, cat)` — builds object + saves
- `listExpenses()` — loops + prints to terminal
- `showSummary()` — groups by category + prints totals
- `deleteExpense(id)` — filters out matching item + saves

### 3. Loops
```js
// FOR...OF — used in listExpenses() to print each item
for (const expense of expenses) { ... }

// FOR...IN — used in showSummary() to loop over object keys
for (const category in summary) { ... }

// REDUCE — accumulates a total in one pass
const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

// FILTER — removes one item, returns new array
expenses = expenses.filter(exp => exp.id !== Number(id));
```

### 4. fs Module (File System)
```js
fs.existsSync(path)          // check if file exists → boolean
fs.readFileSync(path, 'utf-8') // read file → string
fs.writeFileSync(path, data)   // write string to file
```
The data is stored as **JSON** — `JSON.stringify()` converts a JS array to a string before saving, and `JSON.parse()` converts it back when reading.

### 5. process.argv
```
node index.js add "Coffee" 80 Food
 [0]   [1]     [2]   [3]  [4]  [5]
```
`process.argv` is a built-in Node.js array that captures everything you type in the terminal.

---

## 🔁 How a Command Flows (add example)

```
User types:  node index.js add "Coffee" 80 Food
                                  ↓
                     process.argv[2] = "add"
                                  ↓
                        addExpense() is called
                                  ↓
                         loadExpenses() ← fs.readFileSync
                                  ↓
                    newExpense object is built
                                  ↓
                    pushed into expenses array
                                  ↓
                         saveExpenses() → fs.writeFileSync
                                  ↓
                      ✅ Confirmation printed
```

---

## 💡 Demo Script (for your presentation)

```bash
# 1. Show help
node index.js

# 2. Add some expenses
node index.js add "Morning Coffee" 80 Food
node index.js add "Auto to office" 150 Travel
node index.js add "Electricity Bill" 1200 Bills
node index.js add "Lunch" 220 Food
node index.js add "Groceries" 650 Shopping

# 3. List all
node index.js list

# 4. Category totals
node index.js summary

# 5. Delete one (use an ID shown in list)
node index.js delete <ID>

# 6. Open expenses.json to show the raw data file
cat expenses.json
```
