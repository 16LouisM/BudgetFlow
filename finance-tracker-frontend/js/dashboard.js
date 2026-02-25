// dashboard.js

// ==========================
// Utility Functions (Outer Scope)
// ==========================

function formatDisplayDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${year}/${month}/${day}`;
}

function calculateTotals(filteredTransactions) {
  let totalIncome = 0;
  let totalExpense = 0;

  filteredTransactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  return { totalIncome, totalExpense };
}

document.addEventListener('DOMContentLoaded', () => {

  // ==========================
  // 🔐 SESSION PROTECTION
  // ==========================
  const session = JSON.parse(localStorage.getItem("budgetflow_session"));

  if (!session) {
    window.location.replace("login.html");
    return;
  }

  const userEmail = session.email;

  // Per-user storage keys
  const TRANSACTION_KEY = `budgetflow_transactions_${userEmail}`;
  const BUDGET_KEY = `budgetflow_budgets_${userEmail}`;

  // ==========================
  // Global variables
  // ==========================
  let transactions = [];
  let categoryBudgets = {};
  let selectedDate = new Date();
  let currentDate = new Date();

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
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');

  // ==========================
  // LOGOUT (SECURE)
  // ==========================
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("budgetflow_session");
    window.location.replace("login.html");
  });

  // ==========================
  // Storage functions
  // ==========================
  function loadTransactions() {
    const stored = localStorage.getItem(TRANSACTION_KEY);
    transactions = stored ? JSON.parse(stored) : [];
  }

  function saveTransactions() {
    localStorage.setItem(TRANSACTION_KEY, JSON.stringify(transactions));
  }

  function loadBudgets() {
    const stored = localStorage.getItem(BUDGET_KEY);
    categoryBudgets = stored ? JSON.parse(stored) : {};
  }

  // ==========================
  // Helpers
  // ==========================
  function updateMonthDisplay() {
    const monthNames = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];

    const month = monthNames[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();

    if (overviewMonthEl)
      overviewMonthEl.textContent = `${month} ${year}`;

    if (nextMonthBtn) {
      const nextMonthDate = new Date(selectedDate);
      nextMonthDate.setMonth(selectedDate.getMonth() + 1);
      nextMonthBtn.disabled = nextMonthDate > currentDate;
    }
  }

  function filterTransactionsByMonth() {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    return transactions.filter(t => {
      if (!t.date) return false;
      const [y, m] = t.date.split('-').map(Number);
      return y === year && m === month;
    });
  }

  function updateUI() {

    const filtered = filterTransactionsByMonth();
    const { totalIncome, totalExpense } = calculateTotals(filtered);
    const balance = totalIncome - totalExpense;

    totalIncomeEl.textContent = 'R' + totalIncome.toLocaleString();
    totalExpenseEl.textContent = 'R' + totalExpense.toLocaleString();
    balanceEl.textContent = 'R' + balance.toLocaleString();

    const totalBudget = Object.values(categoryBudgets)
      .reduce((a, b) => a + b, 0);

    const remaining = totalBudget - totalExpense;

    if (budgetLimitEl)
      budgetLimitEl.textContent = 'R' + totalBudget.toLocaleString();

    if (budgetRemainingEl)
      budgetRemainingEl.textContent = 'R' + remaining.toLocaleString();

    if (budgetProgressEl) {
      const percentUsed = totalBudget > 0
        ? (totalExpense / totalBudget) * 100
        : 0;

      budgetProgressEl.style.width =
        Math.min(percentUsed, 100) + '%';
    }

    transactionListEl.innerHTML = '';

    if (filtered.length === 0) {
      transactionListEl.innerHTML =
        '<li>No transactions yet. Add some!</li>';
    } else {
      filtered.slice().reverse().slice(0, 10).forEach(t => {
        const li = document.createElement('li');
        const sign = t.type === 'income' ? '+' : '-';
        const amountClass =
          t.type === 'income'
            ? 'income-amount'
            : 'expense-amount';

        li.innerHTML = `
          <div class="transaction-item">
            <span>${t.description}</span>
            <span>${formatDisplayDate(t.date)}</span>
            <span class="${amountClass}">
              ${sign}R${t.amount.toLocaleString()}
            </span>
          </div>
        `;

        transactionListEl.appendChild(li);
      });
    }

    renderMiniCalendar(filtered);
  }

  function renderMiniCalendar(filtered) {
    if (!miniCalendarEl) return;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    const daysWithTransactions = new Set();

    filtered.forEach(t => {
      if (t.date) {
        const [y, m, d] = t.date.split('-').map(Number);
        if (y === year && m === month)
          daysWithTransactions.add(d);
      }
    });

    let html = '';

    for (let day = 1; day <= daysInMonth; day++) {
      let classes = [];
      if (daysWithTransactions.has(day))
        classes.push('has-transaction');

      html += `<span class="${classes.join(' ')}">${day}</span>`;
    }

    miniCalendarEl.innerHTML = html;
  }

  function changeMonth(delta) {
    selectedDate.setMonth(selectedDate.getMonth() + delta);
    if (selectedDate > currentDate)
      selectedDate = new Date(currentDate);

    updateMonthDisplay();
    updateUI();
  }

  prevMonthBtn?.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn?.addEventListener('click', () => changeMonth(1));

  // ==========================
  // Add Income
  // ==========================
  document.getElementById('addIncomeBtn')
    ?.addEventListener('click', () => {

      const amount = Number.parseFloat(prompt("Enter income amount:"));
      if (Number.isNaN(amount) || amount <= 0) return;

      const description = prompt("Description:");
      const date = new Date()
        .toISOString().split('T')[0];

      transactions.push({
        type: 'income',
        amount,
        description,
        date
      });

      saveTransactions();
      updateUI();
    });

  // ==========================
  // Add Expense
  // ==========================
  document.getElementById('addExpenseBtn')
    ?.addEventListener('click', () => {

      const amount = Number.parseFloat(prompt("Enter expense amount:"));
      if (Number.isNaN(amount) || amount <= 0) return;

      const description = prompt("Description:");
      const date = new Date()
        .toISOString().split('T')[0];

      transactions.push({
        type: 'expense',
        amount,
        description,
        date
      });

      saveTransactions();
      updateUI();
    });

  // ==========================
  // INITIAL LOAD
  // ==========================
  loadBudgets();
  loadTransactions();
  updateMonthDisplay();
  updateUI();

});