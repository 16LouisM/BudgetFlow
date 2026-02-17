// dashboard.js

// ======================
// Global variables
// ======================
let income = 0, expenses = 0, balance = 0;
let transactions = [];
let financeChart;

// DOM elements
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');
const transactionListEl = document.getElementById('transactionList');
const ctx = document.getElementById('financeChart')?.getContext('2d');

// ======================
// Helper functions
// ======================
function formatDate(dateString) {
  if (!dateString) return 'No date';
  const [year, month, day] = dateString.split('-');
  return `${year}/${month}/${day}`;
}

function initChart() {
  if (!ctx) return;
  if (financeChart) financeChart.destroy();
  financeChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [income, expenses],
        backgroundColor: ['#28a745', '#dc3545']
      }]
    },
    options: { responsive: true }
  });
}

function updateUI() {
  totalIncomeEl.textContent = 'R' + income.toLocaleString();
  totalExpenseEl.textContent = 'R' + expenses.toLocaleString();
  balance = income - expenses;
  balanceEl.textContent = 'R' + balance.toLocaleString();
  if (financeChart) {
    financeChart.data.datasets[0].data = [income, expenses];
    financeChart.update();
  }
  transactionListEl.innerHTML = '';
  if (transactions.length === 0) {
    transactionListEl.innerHTML = '<li>No transactions yet. Add some!</li>';
  } else {
    transactions.slice().reverse().forEach(t => {
      const li = document.createElement('li');
      const icon = t.type === 'income' ? '💰' : '💸';
      const typeLabel = t.type === 'income' ? 'Income' : 'Expense';
      li.textContent = `${icon} ${typeLabel}: R${t.amount} - ${t.description} (${formatDate(t.date)})`;
      transactionListEl.appendChild(li);
    });
  }
}

// Load transactions from localStorage (persist between pages)
function loadTransactions() {
  const stored = localStorage.getItem('budgetflow_transactions');
  if (stored) {
    transactions = JSON.parse(stored);
    // Recalculate totals from transactions array
    income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  } else {
    transactions = [];
    income = 0;
    expenses = 0;
  }
}

// Save transactions to localStorage
function saveTransactions() {
  localStorage.setItem('budgetflow_transactions', JSON.stringify(transactions));
}

// ======================
// Fallback modal HTML for Income
// ======================
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

// ======================
// Fallback modal HTML for Expense
// ======================
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

// ======================
// Generic modal loader (appends without destroying)
// ======================
function loadModal(modalPath, containerId, fallbackHTML, callback) {
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
      console.warn('Fetch failed, using fallback modal. Error:', error);
      document.getElementById(containerId).insertAdjacentHTML('beforeend', fallbackHTML);
      if (callback) callback();
    });
}

// ======================
// Income Modal initialization
// ======================
function initIncomeModal() {
  const modal = document.getElementById('incomeModal');
  const addIncomeBtn = document.getElementById('addIncomeBtn');
  const form = document.getElementById('incomeForm');
  const clearBtn = document.querySelector('#incomeModal .btn-clear');
  const cancelBtn = document.querySelector('#incomeModal .btn-cancel');

  if (!modal || !addIncomeBtn || !form) {
    console.error('Income modal elements missing');
    return;
  }

  // Set today's date
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

    // Add to local data
    income += amount;
    transactions.push({ type: 'income', amount, description, date, category });
    saveTransactions();
    updateUI();

    // Reset form
    form.reset();
    if (dateInput) dateInput.value = `${y}-${m}-${d}`;
    modal.style.display = 'none';
    alert('Income added!');
  });
}

// ======================
// Expense Modal initialization
// ======================
function initExpenseModal() {
  const modal = document.getElementById('expenseModal');
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const form = document.getElementById('expenseForm');
  const clearBtn = document.querySelector('#expenseModal .btn-clear');
  const cancelBtn = document.querySelector('#expenseModal .btn-cancel');

  if (!modal || !addExpenseBtn || !form) {
    console.error('Expense modal elements missing');
    return;
  }

  // Set today's date
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

    // Add to local data
    expenses += amount;
    transactions.push({ type: 'expense', amount, description, date, category });
    saveTransactions();
    updateUI();

    // Reset form
    form.reset();
    if (dateInput) dateInput.value = `${y}-${m}-${d}`;
    modal.style.display = 'none';
    alert('Expense added!');
  });
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
// Main initialization
// ======================
document.addEventListener('DOMContentLoaded', () => {
  // Load saved transactions
  loadTransactions();

  // Initialize chart and UI
  initChart();
  updateUI();

  // Load and initialize modals
  loadModal(
    'components/modal-income.html',
    'modal-container',
    fallbackIncomeModalHTML,
    initIncomeModal
  );

  loadModal(
    'components/modal-expense.html',
    'modal-container',
    fallbackExpenseModalHTML,
    initExpenseModal
  );
});