// ===== ELEMENTS =====
const categoryEl = document.getElementById("category");
const descEl = document.getElementById("desc");
const amountEl = document.getElementById("amount");
const listEl = document.getElementById("list");
const alertEl = document.getElementById("alert");
const budgetEl = document.getElementById("budget");
const addBtnEl = document.getElementById("addBtn");
const chartCanvas = document.getElementById("myChart");

// ===== DATA =====
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = Number(localStorage.getItem("budget")) || 0;
let editIndex = null;
let chart = null;

// ===== SAVE BUDGET =====
function saveBudget() {
  budget = Number(budgetEl.value) || 0;
  localStorage.setItem("budget", budget);
  checkBudget();
}

// ===== ADD / UPDATE EXPENSE =====
function addExpense() {
  const amount = Number(amountEl.value);
  if (!descEl.value || amount <= 0) {
    showAlert("Enter valid description & amount");
    return;
  }

  const expense = {
    category: categoryEl.value,
    desc: descEl.value,
    amount: amount,
    date: new Date().toISOString()
  };

  if (editIndex !== null) {
    expenses[editIndex] = expense;
    editIndex = null;
    addBtnEl.textContent = "Add Expense";
  } else {
    expenses.push(expense);
  }

  localStorage.setItem("expenses", JSON.stringify(expenses));
  descEl.value = "";
  amountEl.value = "";

  render();
}

// ===== EDIT EXPENSE =====
function editExpense(index) {
  const e = expenses[index];
  categoryEl.value = e.category;
  descEl.value = e.desc;
  amountEl.value = e.amount;
  editIndex = index;
  addBtnEl.textContent = "Save";
}

// ===== DELETE EXPENSE =====
function deleteExpense(index) {
  if (!confirm("Delete this expense?")) return;
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  render();
}

// ===== SHOW EXPENSES =====
function showExpenses() {
  listEl.innerHTML = "";

  if (expenses.length === 0) {
    listEl.innerHTML = "<li>No expenses yet</li>";
    return;
  }

  expenses.forEach((e, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${e.category}</strong> - ${e.desc}
      <span>₹${e.amount.toFixed(2)}</span>
      <div>
        <button onclick="editExpense(${i})">Edit</button>
        <button onclick="deleteExpense(${i})">Delete</button>
      </div>
    `;
    listEl.appendChild(li);
  });
}

// ===== ALERT =====
function showAlert(msg) {
  alertEl.innerText = msg;
  alertEl.style.color = "red";
  setTimeout(() => (alertEl.innerText = ""), 3000);
}

// ===== BUDGET CHECK =====
function checkBudget() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  if (budget > 0 && total > budget) {
    alertEl.innerText = "⚠ Budget Exceeded!";
    alertEl.style.color = "red";
  } else if (budget > 0) {
    alertEl.innerText = `Remaining: ₹${(budget - total).toFixed(2)}`;
    alertEl.style.color = "green";
  } else {
    alertEl.innerText = "";
  }
}

// ===== CSV EXPORT =====
function exportCSV() {
  let csv = "Category,Description,Amount,Date\n";
  expenses.forEach(e => {
    csv += `${e.category},${e.desc},${e.amount},${e.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
}

// ===== CHART DATA =====
function getCategoryTotals() {
  const totals = { Food: 0, Travel: 0, Shopping: 0, Bills: 0, Others: 0 };
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  return totals;
}

// ===== UPDATE CHART =====
function updateChart() {
  const data = getCategoryTotals();

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffcd56",
          "#4bc0c0",
          "#9966ff"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

// ===== RENDER ALL =====
function render() {
  showExpenses();
  updateChart();
  checkBudget();
}

// ===== INIT =====
budgetEl.value = budget || "";
render();

// ===== GLOBAL =====
window.saveBudget = saveBudget;
window.addExpense = addExpense;
window.exportCSV = exportCSV;
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;
