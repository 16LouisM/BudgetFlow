// dashboard.js

// ======================
// Global variables
// ======================
let income = 0, expenses = 0, balance = 0;
let transactions = [];
let categoryBudgets = {}; // used for budget limit

// DOM elements
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');
const transactionListEl = document.getElementById('transactionList');
const overviewMonthEl = document.getElementById('overviewMonth');
const budgetLimitEl = document.getElementById('budgetLimit');
const budgetRemainingEl = document.getElementById('budgetRemaining');
const budgetProgressEl = document.getElementById('budgetProgress');
const miniCalendarEl = document.querySelector('.mini-calendar');

// ======================
// Helper functions
// ======================
function formatDisplayDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${year}/${month}/${day}`; // full date: YYYY/MM/DD
}

function setCurrentMonthYear() {
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  if (overviewMonthEl) overviewMonthEl.textContent = `${month} ${year}`;
}

// Load transactions from localStorage
function loadTransactions() {
  const stored = localStorage.getItem('budgetflow_transactions');
  if (stored) {
    transactions = JSON.parse(stored);
    income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  } else {
    transactions = [];
    income = 0;
    expenses = 0;
  }
}

// Load budgets from localStorage (to get total budget limit)
function loadBudgets() {
  const stored = localStorage.getItem('budgetflow_budgets');
  if (stored) {
    categoryBudgets = JSON.parse(stored);
  } else {
    categoryBudgets = {};
  }
}

// Update summary cards and monthly overview
function updateUI() {
  totalIncomeEl.textContent = 'R' + income.toLocaleString();
  totalExpenseEl.textContent = 'R' + expenses.toLocaleString();
  balance = income - expenses;
  balanceEl.textContent = 'R' + balance.toLocaleString();

  // Budget overview
  const totalBudget = Object.values(categoryBudgets).reduce((a, b) => a + b, 0);
  const totalSpent = expenses;
  const remaining = totalBudget - totalSpent;
  budgetLimitEl.textContent = 'R' + totalBudget.toLocaleString();
  budgetRemainingEl.textContent = 'R' + remaining.toLocaleString();

  // Progress bar (percentage of budget used)
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  if (budgetProgressEl) {
    budgetProgressEl.style.width = Math.min(percentUsed, 100) + '%';
  }

  // Update transaction list
  transactionListEl.innerHTML = '';
  if (transactions.length === 0) {
    transactionListEl.innerHTML = '<li>No transactions yet. Add some!</li>';
  } else {
    // Show last 10 transactions, newest first
    transactions.slice().reverse().slice(0, 10).forEach(t => {
      const li = document.createElement('li');
      const sign = t.type === 'income' ? '+' : '-';
      const amountClass = t.type === 'income' ? 'income-amount' : 'expense-amount';
      li.innerHTML = `
        <div class="transaction-item">
          <span class="transaction-desc">${t.description}</span>
          <span class="transaction-date">${formatDisplayDate(t.date)}</span>
          <span class="${amountClass}">${sign}R${t.amount.toLocaleString()}</span>
        </div>
      `;
      transactionListEl.appendChild(li);
    });
  }

  // Update mini calendar (mark days with transactions)
  renderMiniCalendar();
}

// ======================
// Render mini calendar (1-31) with indicators for days with transactions and current day
// ======================
function renderMiniCalendar() {
  if (!miniCalendarEl) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayDate = now.getDate();

  // Get set of days that have any transaction (income or expense)
  const daysWithTransactions = new Set();
  transactions.forEach(t => {
    if (t.date) {
      const [y, m, d] = t.date.split('-').map(Number);
      if (y === year && m === month) {
        daysWithTransactions.add(d);
      }
    }
  });

  let html = '';
  for (let day = 1; day <= daysInMonth; day++) {
    let classes = [];
    if (daysWithTransactions.has(day)) {
      classes.push('has-transaction');
    }
    if (day === todayDate) {
      classes.push('current-day');
    }
    const className = classes.join(' ');
    html += `<span class="${className}">${day}</span>`;
  }
  miniCalendarEl.innerHTML = html;
}

// ======================
// Navigation
// ======================
document.getElementById('monthlyBreakdownBtn')?.addEventListener('click', () => {
  window.location.href = 'monthly-breakdown.html';
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  // Clear any session data if needed, then redirect to login
  window.location.href = 'login.html';
});

// ======================
// Modal loading (income, expense)
// ======================

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
  // Check if modal already exists
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

// ======================
// Main initialization
// ======================
document.addEventListener('DOMContentLoaded', () => {
  setCurrentMonthYear();
  loadBudgets();
  loadTransactions();
  updateUI();

  // Load modals
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