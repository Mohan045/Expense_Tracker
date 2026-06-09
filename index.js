


const fs    = require("fs");          
const chalk = require("chalk");       
const path  = require("path");    


const FILE_PATH = path.join(__dirname, "expenses.json");

const VALID_CATEGORIES = ["food", "transport", "shopping", "health", "other"]; 

function loadExpenses() {
  if (!fs.existsSync(FILE_PATH)) {   
    return [];                        
  }
  const raw  = fs.readFileSync(FILE_PATH, "utf8");  
  return JSON.parse(raw);                           
}


function saveExpenses(expenses) {
  const json = JSON.stringify(expenses, null, 2);  
  fs.writeFileSync(FILE_PATH, json, "utf8");       
}


function addExpense(description, amount, category) {

 
  if (!description || description.trim() === "") {
    console.log(chalk.red("X  Description cannot be empty."));
    return;
  }

  const parsedAmount = parseFloat(amount);      
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.log(chalk.red("X  Amount must be a positive number."));
    return;
  }

  if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
    console.log(chalk.red(`X  Category must be one of: ${VALID_CATEGORIES.join(", ")}`));
    return;
  }

    const expenses   = loadExpenses();            
  const newExpense = {                           
    id         : expenses.length + 1,            
    description: description.trim(),             
    amount     : parsedAmount,                  
    category   : category.toLowerCase(),         
    date       : new Date().toLocaleDateString("en-IN")  
  };

  expenses.push(newExpense);   
  saveExpenses(expenses);      

  console.log(chalk.green(`Added: "${newExpense.description}" — Rs.${newExpense.amount} (${newExpense.category})`));
}


function viewExpenses() {
  const expenses = loadExpenses();  

  if (expenses.length === 0) {
    console.log(chalk.yellow("  No expenses recorded yet."));
    return;
  }

  console.log(chalk.cyan("\n  ID  | Date       | Category    | Amount  | Description"));
  console.log(chalk.cyan("  ---------------------------------------------------------"));

  
  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];  
    const row =
      `  ${String(e.id).padStart(3)} | ${e.date.padEnd(10)} | ${e.category.padEnd(11)} | Rs.${String(e.amount).padEnd(6)} | ${e.description}`;
    console.log(row);
  }

  console.log(chalk.cyan("  ---------------------------------------------------------\n"));
}


function showSummary() {
  const expenses = loadExpenses();

  if (expenses.length === 0) {
    console.log(chalk.yellow("  No expenses to summarise."));
    return;
  }

  let total = 0;  
  const byCategory = {};

  
  expenses.forEach(function(expense) {
    total += expense.amount;   
    if (!byCategory[expense.category]) {
      byCategory[expense.category] = 0;
    }
    byCategory[expense.category] += expense.amount;
  });

  console.log(chalk.cyan("\n  ── Expense Summary ──────────────────────────"));
  console.log(`  Total spent : Rs.${total.toFixed(2)}`);
  console.log(chalk.cyan("  By category:"));

  
  for (const cat in byCategory) {
    console.log(`    - ${cat.padEnd(12)}: Rs.${byCategory[cat].toFixed(2)}`);
  }
  console.log(chalk.cyan("  ─────────────────────────────────────────────\n"));
}


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


function showHelp() {
  console.log(chalk.cyan(`
  
         CLI Expense Tracker -- Commands
  
  node index.js add <desc> <amount> <category>
      Add a new expense
      Categories: food  transport  shopping  health  other

  node index.js view
      List all expenses

  node index.js summary
      Show total + breakdown by category

  node index.js delete <id>
      Delete an expense by its ID
  
  `));
}



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
