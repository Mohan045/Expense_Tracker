// ============================================================
//  CLI Expense Tracker — Node.js Beginner Project
//  Concepts used: variables, data types, loops, functions, fs
// ============================================================

const fs    = require("fs");          // Node.js built-in: File System module
const chalk = require("chalk");       // npm package: adds colour to terminal text
const path  = require("path");        // Node.js built-in: handles file paths

// ── 1. VARIABLES & DATA TYPES ────────────────────────────────
//  string  → FILE_PATH, category names
//  number  → amounts, totals
//  boolean → used inside validation functions
//  array   → list of expenses loaded from disk
//  object  → a single expense record { id, description, amount, category, date }

const FILE_PATH = path.join(__dirname, "expenses.json"); // string — where we save data

const VALID_CATEGORIES = ["food", "transport", "shopping", "health", "other"]; // array of strings

// ── 2. FUNCTIONS ─────────────────────────────────────────────

// --- File helpers (fs module) ---

/** Read all expenses from the JSON file.
 *  Returns an ARRAY of expense objects.
 *  If the file doesn't exist yet, returns an empty array.
 */
function loadExpenses() {
  if (!fs.existsSync(FILE_PATH)) {   // fs.existsSync → check if file is present
    return [];                        // return empty array on first run
  }
  const raw  = fs.readFileSync(FILE_PATH, "utf8");  // fs.readFileSync → read file as string
  return JSON.parse(raw);                           // convert JSON string → JS array
}

/** Save the current expenses array back to the JSON file. */
function saveExpenses(expenses) {
  const json = JSON.stringify(expenses, null, 2);  // convert JS array → formatted JSON string
  fs.writeFileSync(FILE_PATH, json, "utf8");       // fs.writeFileSync → write string to file
}

// --- Core feature functions ---

/** ADD a new expense.
 *  Parameters: description (string), amount (number), category (string)
 */
function addExpense(description, amount, category) {

  // --- Validation using boolean checks ---
  if (!description || description.trim() === "") {
    console.log(chalk.red("X  Description cannot be empty."));
    return;
  }

  const parsedAmount = parseFloat(amount);      // convert string input → number
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.log(chalk.red("X  Amount must be a positive number."));
    return;
  }

  if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
    console.log(chalk.red(`X  Category must be one of: ${VALID_CATEGORIES.join(", ")}`));
    return;
  }

  // --- Build an expense OBJECT ---
  const expenses   = loadExpenses();             // array of existing expenses
  const newExpense = {                           // object — one expense record
    id         : expenses.length + 1,            // number
    description: description.trim(),             // string
    amount     : parsedAmount,                   // number
    category   : category.toLowerCase(),         // string
    date       : new Date().toLocaleDateString("en-IN")  // string
  };

  expenses.push(newExpense);   // add object to the array
  saveExpenses(expenses);      // persist to file

  console.log(chalk.green(`Added: "${newExpense.description}" — Rs.${newExpense.amount} (${newExpense.category})`));
}

/** VIEW all expenses using a FOR loop. */
function viewExpenses() {
  const expenses = loadExpenses();  // array

  if (expenses.length === 0) {
    console.log(chalk.yellow("  No expenses recorded yet."));
    return;
  }

  console.log(chalk.cyan("\n  ID  | Date       | Category    | Amount  | Description"));
  console.log(chalk.cyan("  ---------------------------------------------------------"));

  // FOR loop — iterating over an array
  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];  // each element is an object
    const row =
      `  ${String(e.id).padStart(3)} | ${e.date.padEnd(10)} | ${e.category.padEnd(11)} | Rs.${String(e.amount).padEnd(6)} | ${e.description}`;
    console.log(row);
  }

  console.log(chalk.cyan("  ---------------------------------------------------------\n"));
}

/** SUMMARY — total & per-category breakdown using forEach loop. */
function showSummary() {
  const expenses = loadExpenses();

  if (expenses.length === 0) {
    console.log(chalk.yellow("  No expenses to summarise."));
    return;
  }

  let total = 0;  // number variable — accumulates the sum

  // Object used as a "map": category → total amount
  const byCategory = {};

  // forEach loop — another way to loop over arrays
  expenses.forEach(function(expense) {
    total += expense.amount;   // add each amount to total

    if (!byCategory[expense.category]) {
      byCategory[expense.category] = 0;
    }
    byCategory[expense.category] += expense.amount;
  });

  console.log(chalk.cyan("\n  ── Expense Summary ──────────────────────────"));
  console.log(`  Total spent : Rs.${total.toFixed(2)}`);
  console.log(chalk.cyan("  By category:"));

  // for...in loop — iterating over object keys
  for (const cat in byCategory) {
    console.log(`    - ${cat.padEnd(12)}: Rs.${byCategory[cat].toFixed(2)}`);
  }
  console.log(chalk.cyan("  ─────────────────────────────────────────────\n"));
}

/** DELETE an expense by its ID. */
function deleteExpense(id) {
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    console.log(chalk.red("X  Please provide a valid numeric ID."));
    return;
  }

  let expenses  = loadExpenses();
  const before  = expenses.length;

  expenses = expenses.filter(function(e) {
    return e.id !== parsedId;
  });

  if (expenses.length === before) {
    console.log(chalk.red(`X  No expense found with ID ${parsedId}.`));
    return;
  }

  saveExpenses(expenses);
  console.log(chalk.green(`Deleted expense with ID ${parsedId}.`));
}

/** Show how to use the tool. */
function showHelp() {
  console.log(chalk.cyan(`
  =====================================================
         CLI Expense Tracker -- Commands
  =====================================================
  node index.js add <desc> <amount> <category>
      Add a new expense
      Categories: food  transport  shopping  health  other

  node index.js view
      List all expenses

  node index.js summary
      Show total + breakdown by category

  node index.js delete <id>
      Delete an expense by its ID
  =====================================================
  `));
}

// ── 3. COMMAND-LINE ARGUMENT PARSING ─────────────────────────
//  process.argv is an ARRAY provided by Node.js
//  index 0 → "node"
//  index 1 → path to this file
//  index 2 → the command  (add / view / summary / delete)

const args    = process.argv;   // array
const command = args[2];        // string

if (command === "add") {
  addExpense(args[3], args[4], args[5]);
} else if (command === "view") {
  viewExpenses();
} else if (command === "summary") {
  showSummary();
} else if (command === "delete") {
  deleteExpense(args[3]);
} else {
  showHelp();
}
