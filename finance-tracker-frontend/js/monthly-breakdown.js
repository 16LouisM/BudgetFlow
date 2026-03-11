// ======================================================
// BudgetFlow - Monthly Breakdown (User-Specific Version)
// ======================================================

// ======================
// AUTH CHECK
// ======================
const isLoggedIn = localStorage.getItem("isLoggedIn");
const currentUser = localStorage.getItem("currentUser");

if (isLoggedIn !== "true" || !currentUser) {
  window.location.replace("../pages/login.html");
}

// ======================
// USER-SPECIFIC STORAGE KEYS
// ======================
const TRANSACTION_KEY = `budgetflow_transactions_${currentUser}`;
const BUDGET_KEY = `budgetflow_budgets_${currentUser}`;

// ======================
// GLOBAL VARIABLES
// ======================
let transactions = [];
let categoryBudgets = {};
let expenseChart;

const expenseCategories = [
  'Groceries', 'Transport', 'Internet', 'Entertainment', 'Dining Out',
  'Health', 'Shopping', 'Education', 'Personal Care',
  'Bills & Utilities', 'Other'
];

const incomeCategories = [
  'Allowance', 'NSFAS/Bursary/Scholarship', 'Side-Hustle', 'Gift',
  'Internship/Stipend', 'Savings', 'Stokvel', 'Other'
];

// ======================
// DOM ELEMENTS
// ======================
const monthDisplayEl = document.getElementById('monthDisplay');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');
const budgetRemainingEl = document.getElementById('budgetRemaining');
const chartMonthEl = document.getElementById('chartMonth');
const expenseChartCtx = document.getElementById('expenseChart')?.getContext('2d');
const budgetTableBody = document.getElementById('budgetTableBody');
const insightsContent = document.getElementById('insightsContent');
const budgetMessagesDiv = document.getElementById('budgetMessages');
const modalContainer = document.getElementById("modal-container");

// ======================================================
// STORAGE (USER-SPECIFIC)
// ======================================================
function loadBudgets() {
  categoryBudgets = JSON.parse(localStorage.getItem(BUDGET_KEY)) || {};
}

function saveBudgets() {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(categoryBudgets));
}

function loadTransactions() {
  transactions = JSON.parse(localStorage.getItem(TRANSACTION_KEY)) || [];
}

function saveTransactions() {
  localStorage.setItem(TRANSACTION_KEY, JSON.stringify(transactions));
}

// ======================================================
// DATE
// ======================================================
function setCurrentMonthYear() {
  const now = new Date();
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const label = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  monthDisplayEl.textContent = label;
  chartMonthEl.textContent = label;
}

function filterCurrentMonthTransactions() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return transactions.filter(t => {
    if (!t.date) return false;
    const [y, m] = t.date.split('-').map(Number);
    return y === year && m === month;
  });
}

// ======================================================
// CALCULATIONS
// ======================================================
function calculateTotals(monthlyTransactions) {
  let totalIncome = 0;
  let totalExpense = 0;
  const categorySpent = {};

  expenseCategories.forEach(cat => categorySpent[cat] = 0);

  monthlyTransactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      const cat = t.category || 'Other';
      if (!categorySpent[cat]) categorySpent[cat] = 0;
      categorySpent[cat] += t.amount;
    }
  });

  return { totalIncome, totalExpense, categorySpent };
}

// ======================================================
// SUMMARY
// ======================================================
function updateSummary(totalIncome, totalExpense, categorySpent) {
  const balance = totalIncome - totalExpense;

  totalIncomeEl.textContent = `R${totalIncome.toLocaleString()}`;
  totalExpenseEl.textContent = `R${totalExpense.toLocaleString()}`;
  balanceEl.textContent = `R${balance.toLocaleString()}`;

  const totalBudget = Object.values(categoryBudgets).reduce((a,b)=>a+b,0);
  const totalSpent = Object.values(categorySpent).reduce((a,b)=>a+b,0);
  const remaining = totalBudget - totalSpent;

  budgetRemainingEl.textContent = `R${remaining.toLocaleString()}`;

  let messages = [];

  if (totalBudget > 0) {
    const percent = (totalSpent / totalBudget) * 100;
    if (remaining < 0)
      messages.push(`🚨 You exceeded your total budget by R${Math.abs(remaining).toLocaleString()}`);
    else if (percent >= 80)
      messages.push(`⚠️ You have used ${percent.toFixed(0)}% of your monthly budget`);
  }

  if (totalExpense > totalIncome)
    messages.push(`📉 You are spending more than your income`);

  budgetMessagesDiv.innerHTML = messages.length
    ? messages.map(m => `<p class="warning">${m}</p>`).join('')
    : `<p class="success">✅ Your budget is under control</p>`;
}

// ======================================================
// BUDGET STATUS HELPER
// ======================================================
function getBudgetStatus(spent, budget) {
  if (budget === 0 || budget === undefined) {
    return { text: 'No budget', className: '' };
  }
  const remaining = budget - spent;
  const percentUsed = (spent / budget) * 100;
  if (remaining < 0) {
    return { text: 'Exceeded', className: 'exceeded' };
  } else if (percentUsed >= 80) {
    return { text: 'Warning', className: 'warning' };
  } else {
    return { text: 'On track', className: 'good' };
  }
}

// ======================================================
// TABLE (with Budget, Remaining, and Status columns)
// ======================================================
function renderBudgetTable(categorySpent) {
  let html = '';
  let highest = { name: '', spent: 0 };

  expenseCategories.forEach(cat => {
    const spent = categorySpent[cat] || 0;
    const budget = categoryBudgets[cat] || 0;
    const remaining = budget - spent;
    const status = getBudgetStatus(spent, budget);

    if (spent > highest.spent) {
      highest = { name: cat, spent };
    }

    html += `
      <tr>
        <td>${cat}</td>
        <td>${budget ? 'R' + budget.toLocaleString() : '-'}</td>
        <td>R${spent.toLocaleString()}</td>
        <td class="${remaining < 0 ? 'exceeded' : ''}">
          ${budget ? 'R' + remaining.toLocaleString() : '-'}
        </td>
        <td class="${status.className}">${status.text}</td>
      </tr>
    `;
  });

  budgetTableBody.innerHTML = html;

  insightsContent.innerHTML = `
    <p>📊 Highest spending: ${highest.name} (R${highest.spent.toLocaleString()})</p>
    <p>💡 Review budgets weekly.</p>
  `;
}

// ======================================================
// CHART
// ======================================================
function renderChart(categorySpent) {
  if (!expenseChartCtx) return;

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(expenseChartCtx, {
    type: 'pie',
    data: {
      labels: expenseCategories,
      datasets: [{
        data: expenseCategories.map(cat => categorySpent[cat] || 0),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#E7E9ED', '#76A346', '#C45850', '#6A4C9C', '#8B4513'
        ]
      }]
    },
    options: { responsive: true }
  });
}

// ======================================================
// REFRESH VIEW
// ======================================================
function refreshMonthlyView() {
  const monthly = filterCurrentMonthTransactions();
  const { totalIncome, totalExpense, categorySpent } = calculateTotals(monthly);

  updateSummary(totalIncome, totalExpense, categorySpent);
  renderChart(categorySpent);
  renderBudgetTable(categorySpent);
}

// ======================================================
// MODAL SYSTEM (Add Income/Expense)
// ======================================================
function openTransactionModal(type) {
  const today = new Date().toISOString().split("T")[0];
  const isIncome = type === 'income';
  const title = isIncome ? 'Add Income' : 'Add Expense';
  const categories = isIncome ? incomeCategories : expenseCategories;

  let categoryOptions = '';
  categories.forEach(cat => {
    categoryOptions += `<option value="${cat}">${cat}</option>`;
  });

  modalContainer.innerHTML = `
    <div class="modal" style="display:flex;">
      <div class="modal-content">
        <h2>${title}</h2>

        <div class="form-group">
          <label>Category</label>
          <select id="modalCategory" required>
            <option value="" disabled selected>Select</option>
            ${categoryOptions}
          </select>
        </div>

        <div class="form-group">
          <label>Description</label>
          <input type="text" id="modalDescription" placeholder="e.g. ${isIncome ? 'Monthly allowance' : 'Dinner'}" required>
        </div>

        <div class="form-group">
          <label>Amount (R)</label>
          <input type="number" id="modalAmount" placeholder="e.g. ${isIncome ? '1500' : '500'}" step="0.01" required>
        </div>

        <div class="form-group">
          <label>Date</label>
          <input type="date" id="modalDate" value="${today}" required>
        </div>

        <div class="modal-actions">
          <button class="btn-clear" id="clearModal">Clear</button>
          <button class="btn-cancel" id="cancelModal">Cancel</button>
          <button class="btn-add" id="saveTransaction">Add</button>
        </div>

      </div>
    </div>
  `;

  const clearBtn = document.getElementById("clearModal");
  const cancelBtn = document.getElementById("cancelModal");
  const saveBtn = document.getElementById("saveTransaction");

  clearBtn.onclick = () => {
    document.getElementById("modalCategory").value = '';
    document.getElementById("modalDescription").value = '';
    document.getElementById("modalAmount").value = '';
    document.getElementById("modalDate").value = today;
  };

  cancelBtn.onclick = () => {
    modalContainer.innerHTML = "";
  };

  saveBtn.onclick = () => {
    const category = document.getElementById("modalCategory").value;
    const description = document.getElementById("modalDescription").value;
    const amount = Number.parseFloat(document.getElementById("modalAmount").value);
    const date = document.getElementById("modalDate").value;

    if (!category || !description || Number.isNaN(amount) || amount <= 0) {
      alert("Please complete all fields correctly.");
      return;
    }

    transactions.push({
      type,
      category,
      description,
      amount,
      date
    });

    saveTransactions();
    refreshMonthlyView();
    modalContainer.innerHTML = "";
  };

  // Close when clicking outside
  const modal = document.querySelector('.modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modalContainer.innerHTML = "";
  });
}

// ======================================================
// SET BUDGETS MODAL
// ======================================================
function openBudgetModal() {
  let inputsHtml = '';
  expenseCategories.forEach(cat => {
    const currentBudget = categoryBudgets[cat] || '';
    inputsHtml += `
      <div class="form-group">
        <label>${cat}</label>
        <input type="number" id="budget_${cat}" value="${currentBudget}" min="0" step="0.01" placeholder="0">
      </div>
    `;
  });

  modalContainer.innerHTML = `
    <div class="modal" style="display:flex;">
      <div class="modal-content" style="max-width: 600px;">
        <h2>Set Monthly Budgets</h2>
        <p style="color: #9ca3af; margin-bottom: 15px;">Enter amounts for each category (leave blank for no budget)</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-height: 400px; overflow-y: auto; padding: 5px;">
          ${inputsHtml}
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" id="cancelBudget">Cancel</button>
          <button class="btn-add" id="saveBudgets">Save Budgets</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("cancelBudget").onclick = () => {
    modalContainer.innerHTML = "";
  };

  document.getElementById("saveBudgets").onclick = () => {
    const newBudgets = {};
    expenseCategories.forEach(cat => {
      const input = document.getElementById(`budget_${cat}`);
      if (input && input.value.trim() !== '') {
        const val = Number.parseFloat(input.value);
        if (!Number.isNaN(val) && val >= 0) {
          newBudgets[cat] = val;
        }
      }
    });
    categoryBudgets = newBudgets;
    saveBudgets();
    refreshMonthlyView();
    modalContainer.innerHTML = "";
  };

  const modal = document.querySelector('.modal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modalContainer.innerHTML = "";
  });
}

// ======================================================
// SIDEBAR BUTTONS
// ======================================================
document.getElementById('addIncomeBtn')?.addEventListener('click', () => openTransactionModal('income'));
document.getElementById('addExpenseBtn')?.addEventListener('click', () => openTransactionModal('expense'));
document.getElementById('setBudgetsBtn')?.addEventListener('click', () => openBudgetModal());

// ======================================================
// SIDEBAR NAVIGATION
// ======================================================
document.getElementById("dashboardBtn")?.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  window.location.replace("login.html");
});

// ======================================================
// INITIALISE PAGE
// ======================================================
setCurrentMonthYear();
loadBudgets();
loadTransactions();
refreshMonthlyView();