// ==========================
// DASHBOARD.JS (Full Version)
// ==========================

// ==========================
// UTILITY FUNCTIONS
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

// ==========================
// DOM CONTENT LOADED
// ==========================
document.addEventListener('DOMContentLoaded', () => {

  // ==========================
  // 🔐 SESSION PROTECTION
  // ==========================
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const currentUser = localStorage.getItem("currentUser");

  if (isLoggedIn !== "true" || !currentUser) {
    window.location.href = "login.html";
    return;
  }

  const TRANSACTION_KEY = `budgetflow_transactions_${currentUser}`;

  // ==========================
  // GLOBAL VARIABLES
  // ==========================
  let transactions = [];
  let selectedDate = new Date();
  let currentDate = new Date();

  const incomeCategories = [
    'Allowance', 'NSFAS/Bursary/Scholarship', 'Side-Hustle', 'Gift',
    'Internship/Stipend', 'Savings', 'Stokvel', 'Other'
  ];

  const expenseCategories = [
    'Groceries', 'Transport', 'Internet', 'Entertainment', 'Dining Out',
    'Health', 'Shopping', 'Education', 'Personal Care',
    'Bills & Utilities', 'Other'
  ];

  // ==========================
  // DOM ELEMENTS
  // ==========================
  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpenseEl = document.getElementById('totalExpense');
  const balanceEl = document.getElementById('balance');
  const transactionListEl = document.getElementById('transactionList');
  const overviewMonthEl = document.getElementById('overviewMonth');
  const miniCalendarEl = document.querySelector('.mini-calendar');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const modalContainer = document.getElementById("modal-container");

  // ==========================
  // LOGOUT
  // ==========================
  // ==========================
  // LOGOUT
  // ==========================
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("Logout clicked");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      window.location.replace("login.html");
    });
  } else {
    console.warn("Logout button not found in dashboard");
  }

  // ==========================
  // MONTHLY BREAKDOWN NAVIGATION
  // ==========================
  document.getElementById("monthlyBreakdownBtn")?.addEventListener("click", () => {
    window.location.href = "monthly-breakdown.html";
  });

  // ==========================
  // STORAGE
  // ==========================
  function loadTransactions() {
    const stored = localStorage.getItem(TRANSACTION_KEY);
    transactions = stored ? JSON.parse(stored) : [];
  }

  function saveTransactions() {
    localStorage.setItem(TRANSACTION_KEY, JSON.stringify(transactions));
  }

  // ==========================
  // MONTH DISPLAY & NAVIGATION
  // ==========================
  function updateMonthDisplay() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    overviewMonthEl.textContent =
      `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

    if (nextMonthBtn) {
      const next = new Date(selectedDate);
      next.setMonth(selectedDate.getMonth() + 1);
      nextMonthBtn.disabled = next > currentDate;
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

  // ==========================
  // UPDATE UI (Cards, Transactions, Calendar)
  // ==========================
  function updateUI() {
    const filtered = filterTransactionsByMonth();
    const { totalIncome, totalExpense } = calculateTotals(filtered);
    const balance = totalIncome - totalExpense;

    totalIncomeEl.textContent = 'R' + totalIncome.toLocaleString();
    totalExpenseEl.textContent = 'R' + totalExpense.toLocaleString();
    balanceEl.textContent = 'R' + balance.toLocaleString();

    // Transaction list (last 10, newest first)
    transactionListEl.innerHTML = '';
    if (filtered.length === 0) {
      transactionListEl.innerHTML = '<li>No transactions yet. Add some!</li>';
    } else {
      filtered.slice().reverse().slice(0, 10).forEach(t => {
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

    // Mini calendar
    renderMiniCalendar(filtered);
  }

  // ==========================
  // MINI CALENDAR
  // ==========================
  function renderMiniCalendar(filtered) {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const isCurrentMonth =
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear();

    const daysWithTransactions = new Set();
    filtered.forEach(t => {
      const [, , d] = t.date.split('-').map(Number);
      daysWithTransactions.add(d);
    });

    let html = '';
    for (let day = 1; day <= daysInMonth; day++) {
      let classes = [];
      if (daysWithTransactions.has(day)) classes.push('has-transaction');
      if (isCurrentMonth && day === today.getDate()) classes.push('current-day');
      if (isCurrentMonth && day > today.getDate()) classes.push('future-day');
      html += `<span class="${classes.join(' ')}">${day}</span>`;
    }
    miniCalendarEl.innerHTML = html;
  }

  function changeMonth(delta) {
    selectedDate.setMonth(selectedDate.getMonth() + delta);
    if (selectedDate > currentDate) selectedDate = new Date(currentDate);
    updateMonthDisplay();
    updateUI();
  }

  prevMonthBtn?.addEventListener('click', () => changeMonth(-1));
  nextMonthBtn?.addEventListener('click', () => changeMonth(1));

  // ==========================
  // MODAL SYSTEM (Injected – matches monthly breakdown)
  // ==========================
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
    const modal = document.querySelector('.modal');

    clearBtn.onclick = () => {
      const dateInput = document.getElementById("modalDate");
      dateInput.value = today;
      document.getElementById("modalCategory").value = '';
      document.getElementById("modalDescription").value = '';
      document.getElementById("modalAmount").value = '';
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
        alert('Please fill all fields correctly.');
        return;
      }

      transactions.push({
        type,
        amount,
        description,
        date,
        category
      });

      saveTransactions();
      updateUI();
      modalContainer.innerHTML = "";
    };

    // Close when clicking outside modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modalContainer.innerHTML = "";
    });
  }

  // ==========================
  // BUTTON EVENT LISTENERS (Add Income/Expense)
  // ==========================
  document.getElementById('addIncomeBtn')?.addEventListener('click', () => openTransactionModal('income'));
  document.getElementById('addExpenseBtn')?.addEventListener('click', () => openTransactionModal('expense'));

  // ==========================
  // INITIAL LOAD
  // ==========================
  loadTransactions();
  updateMonthDisplay();
  updateUI();

}); // end DOMContentLoaded