// monthly-breakdown.js

// ======================================================
// BudgetFlow - Monthly Breakdown
// Complete Production Version with Modal Support
// ======================================================

// ======================
// GLOBAL VARIABLES
// ======================
let transactions = [];
let categoryBudgets = {};
let expenseChart;

const expenseCategories = [
  'Groceries', 'Transport', 'Internet', 'Entertainment', 'Dining Out',
  'Health', 'Shopping', 'Education', 'Personal Care', 'Bills & Utilities', 'Other'
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

// ======================================================
// STORAGE FUNCTIONS
// ======================================================
function loadBudgets() {
  const stored = localStorage.getItem('budgetflow_budgets');
  categoryBudgets = stored ? JSON.parse(stored) : {};
}

function saveBudgets() {
  localStorage.setItem('budgetflow_budgets', JSON.stringify(categoryBudgets));
}

function loadTransactions() {
  const stored = localStorage.getItem('budgetflow_transactions');
  transactions = stored ? JSON.parse(stored) : [];
}

function saveTransactions() {
  localStorage.setItem('budgetflow_transactions', JSON.stringify(transactions));
}

// ======================================================
// DATE / MONTH
// ======================================================
function setCurrentMonthYear() {
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  monthDisplayEl.textContent = `${currentMonth} ${currentYear}`;
  chartMonthEl.textContent = `${currentMonth} ${currentYear}`;
}

function filterCurrentMonthTransactions() {
  const now = new Date();
  const monthIndex = now.getMonth();
  const yearNum = now.getFullYear();

  return transactions.filter(t => {
    if (!t.date) return false;
    const [year, month] = t.date.split('-').map(Number);
    return year === yearNum && month === monthIndex + 1;
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
      categorySpent[cat] += t.amount;
    }
  });

  return { totalIncome, totalExpense, categorySpent };
}

// ======================================================
// SUMMARY + BUDGET LOGIC
// ======================================================
function updateSummary(totalIncome, totalExpense, categorySpent) {

  const balance = totalIncome - totalExpense;

  totalIncomeEl.textContent = 'R' + totalIncome.toLocaleString();
  totalExpenseEl.textContent = 'R' + totalExpense.toLocaleString();
  balanceEl.textContent = 'R' + balance.toLocaleString();

  const totalBudget = Object.values(categoryBudgets).reduce((a, b) => a + b, 0);
  const totalSpent = Object.values(categorySpent).reduce((a, b) => a + b, 0);
  const remaining = totalBudget - totalSpent;

  budgetRemainingEl.textContent = 'R' + remaining.toLocaleString();

  let messages = [];

  if (totalBudget > 0) {
    const percentUsed = (totalSpent / totalBudget) * 100;

    if (remaining < 0) {
      messages.push(`🚨 You exceeded your total budget by R${Math.abs(remaining).toLocaleString()}.`);
    }
    else if (percentUsed >= 80) {
      messages.push(`⚠️ You have used ${percentUsed.toFixed(0)}% of your total monthly budget.`);
    }
  }

  if (totalExpense > totalIncome) {
    messages.push(`📉 You are spending more than your income this month.`);
  }

  budgetMessagesDiv.innerHTML = messages.length
    ? messages.map(m => `<p class="warning">${m}</p>`).join('')
    : `<p class="success">✅ Your overall budget is under control.</p>`;
}

// ======================================================
// CATEGORY STATUS
// ======================================================
function calculateBudgetStatus(spent, budget) {
  const remaining = budget - spent;
  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

  if (budget === 0) return { status: 'No budget', className: '' };
  if (remaining < 0) return { status: 'Exceeded', className: 'exceeded' };
  if (percentUsed >= 80) return { status: 'Warning', className: 'warning' };

  return { status: 'On track', className: 'good' };
}

// ======================================================
// RENDER TABLE
// ======================================================
function renderBudgetTable(categorySpent) {

  let html = '';
  let highest = { name: '', spent: 0 };

  expenseCategories.forEach(cat => {
    const spent = categorySpent[cat];
    const budget = categoryBudgets[cat] || 0;
    const remaining = budget - spent;
    const status = calculateBudgetStatus(spent, budget);

    if (spent > highest.spent)
      highest = { name: cat, spent };

    html += `
      <tr>
        <td>${cat}</td>
        <td>${budget ? 'R' + budget.toLocaleString() : '-'}</td>
        <td>R${spent.toLocaleString()}</td>
        <td class="${remaining < 0 ? 'exceeded' : ''}">
          ${budget ? 'R' + remaining.toLocaleString() : '-'}
        </td>
        <td class="${status.className}">${status.status}</td>
      </tr>
    `;
  });

  budgetTableBody.innerHTML = html;

  insightsContent.innerHTML = `
    <p>📊 Highest spending category: ${highest.name} (R${highest.spent.toLocaleString()})</p>
    <p>💡 Review your budgets weekly to stay ahead.</p>
  `;
}

// ======================================================
// CHART
// ======================================================
function renderChart(categorySpent) {

  if (!expenseChartCtx) return;

  const labels = expenseCategories;
  const data = labels.map(cat => categorySpent[cat]);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(expenseChartCtx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
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
// SIDEBAR NAVIGATION
// ======================================================
function initSidebarNavigation() {

  document.getElementById('dashboardBtn')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {

    // Clear login flag
    localStorage.removeItem('isLoggedIn');

    // Replace history so user can't go back
    window.location.replace('login.html');
  });

  // These will now open the modals (handled by initModals after loading)
}

// ======================================================
// MODAL LOADING AND INITIALIZATION (copied from dashboard.js)
// ======================================================

// Fallback modal HTML for Income
const fallbackIncomeModalHTML = `
<div id="incomeModal" class="modal">
  <div class="modal-content">
    <h2>Add Income</h2>
    <form id="incomeForm">
      <div class="form-group">
        <label for="category">Category :</label>
        <select id="category" name="category" required>
          <option value="" disabled selected>Select</option>
          <option value="Allowance">Allowance</option>
          <option value="NSFAS/Bursary/Scholarship">NSFAS / Bursary / Scholarship</option>
          <option value="Side-Hustle">Side-Hustle</option>
          <option value="Gift">Gift</option>
          <option value="Internship/Stipend">Internship / Stipend</option>
          <option value="Savings">Savings</option>
          <option value="Stokvel">Stokvel</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="description">Description :</label>
        <input type="text" id="description" placeholder="e.g. Monthly allowance" required>
      </div>
      <div class="form-group">
        <label for="amount">Amount (R) :</label>
        <input type="number" id="amount" placeholder="e.g. 1500" step="0.01" required>
      </div>
      <div class="form-group">
        <label for="date">Date :</label>
        <input type="date" id="date" required>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-clear">Clear</button>
        <button type="button" class="btn-cancel">Cancel</button>
        <button type="submit" class="btn-add">Add</button>
      </div>
    </form>
  </div>
</div>
`;

// Fallback modal HTML for Expense
const fallbackExpenseModalHTML = `
<div id="expenseModal" class="modal">
  <div class="modal-content">
    <h2>Add Expense</h2>
    <form id="expenseForm">
      <div class="form-group">
        <label for="expenseCategory">Category :</label>
        <select id="expenseCategory" name="category" required>
          <option value="" disabled selected>Select</option>
          <option value="Groceries">Groceries</option>
          <option value="Transport">Transport</option>
          <option value="Dining Out">Dining Out</option>
          <option value="Health">Health</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Shopping">Shopping</option>
          <option value="Education">Education</option>
          <option value="Personal Care">Personal Care</option>
          <option value="Bills & Utilities">Bills & Utilities</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="expenseDescription">Description :</label>
        <input type="text" id="expenseDescription" placeholder="e.g. Dinner at restaurant" required>
      </div>
      <div class="form-group">
        <label for="expenseAmount">Amount (R) :</label>
        <input type="number" id="expenseAmount" placeholder="e.g. 500" step="0.01" required>
      </div>
      <div class="form-group">
        <label for="expenseDate">Date :</label>
        <input type="date" id="expenseDate" required>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn-clear">Clear</button>
        <button type="button" class="btn-cancel">Cancel</button>
        <button type="submit" class="btn-add">Add</button>
      </div>
    </form>
  </div>
</div>
`;

// Generic modal loader – prevents duplicates
function loadModal(modalId, modalPath, containerId, fallbackHTML, callback) {
  if (document.getElementById(modalId)) {
    console.log(`Modal ${modalId} already exists, skipping load.`);
    if (callback) callback();
    return;
  }

  fetch(modalPath)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(html => {
      document.getElementById(containerId).insertAdjacentHTML('beforeend', html);
      if (callback) callback();
    })
    .catch(error => {
      console.warn(`Fetch failed for ${modalPath}, using fallback. Error:`, error);
      document.getElementById(containerId).insertAdjacentHTML('beforeend', fallbackHTML);
      if (callback) callback();
    });
}

// Initialize Income Modal
function initIncomeModal() {
  const modal = document.getElementById('incomeModal');
  const addIncomeBtn = document.getElementById('addIncomeBtn');
  const form = document.getElementById('incomeForm');
  const clearBtn = document.querySelector('#incomeModal .btn-clear');
  const cancelBtn = document.querySelector('#incomeModal .btn-cancel');

  if (!modal) {
    console.warn('Income modal element missing');
    return;
  }
  if (!addIncomeBtn) {
    console.warn('Add Income button not found');
    return;
  }
  if (!form) {
    console.warn('Income form not found');
    return;
  }

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = `${y}-${m}-${d}`;

  addIncomeBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      form.reset();
      if (dateInput) dateInput.value = `${y}-${m}-${d}`;
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number.parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    if (Number.isNaN(amount) || amount <= 0) {
      alert('Enter a valid positive amount');
      return;
    }

    const transactions = JSON.parse(localStorage.getItem('budgetflow_transactions') || '[]');
    transactions.push({ type: 'income', amount, description, date, category });
    localStorage.setItem('budgetflow_transactions', JSON.stringify(transactions));

    form.reset();
    if (dateInput) dateInput.value = `${y}-${m}-${d}`;
    modal.style.display = 'none';
    alert('Income added!');
    window.location.reload(); // refresh to show updated data
  });
}

// Initialize Expense Modal
function initExpenseModal() {
  const modal = document.getElementById('expenseModal');
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const form = document.getElementById('expenseForm');
  const clearBtn = document.querySelector('#expenseModal .btn-clear');
  const cancelBtn = document.querySelector('#expenseModal .btn-cancel');

  if (!modal) {
    console.warn('Expense modal element missing');
    return;
  }
  if (!addExpenseBtn) {
    console.warn('Add Expense button not found');
    return;
  }
  if (!form) {
    console.warn('Expense form not found');
    return;
  }

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateInput = document.getElementById('expenseDate');
  if (dateInput) dateInput.value = `${y}-${m}-${d}`;

  addExpenseBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      form.reset();
      if (dateInput) dateInput.value = `${y}-${m}-${d}`;
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number.parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value;
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;

    if (Number.isNaN(amount) || amount <= 0) {
      alert('Enter a valid positive amount');
      return;
    }

    const transactions = JSON.parse(localStorage.getItem('budgetflow_transactions') || '[]');
    transactions.push({ type: 'expense', amount, description, date, category });
    localStorage.setItem('budgetflow_transactions', JSON.stringify(transactions));

    form.reset();
    if (dateInput) dateInput.value = `${y}-${m}-${d}`;
    modal.style.display = 'none';
    alert('Expense added!');
    window.location.reload(); // refresh to show updated data
  });
}

// ======================================================
// INIT PAGE
// ======================================================
function initPage() {

  setCurrentMonthYear();
  loadBudgets();
  loadTransactions();

  const monthlyTransactions = filterCurrentMonthTransactions();
  const { totalIncome, totalExpense, categorySpent } =
    calculateTotals(monthlyTransactions);

  updateSummary(totalIncome, totalExpense, categorySpent);
  renderChart(categorySpent);
  renderBudgetTable(categorySpent);
}

// ======================================================
// START
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  initPage();
  initSidebarNavigation();

  // Load modals (same as dashboard.js)
  loadModal(
    'incomeModal',
    'components/modal-income.html',
    'modal-container',
    fallbackIncomeModalHTML,
    initIncomeModal
  );
  loadModal(
    'expenseModal',
    'components/modal-expense.html',
    'modal-container',
    fallbackExpenseModalHTML,
    initExpenseModal
  );
});