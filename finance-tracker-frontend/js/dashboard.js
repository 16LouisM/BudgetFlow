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
    window.location.href = "login.html";
    return;
  }

  const userEmail = session.email;

  const TRANSACTION_KEY = `budgetflow_transactions_${userEmail}`;

  let transactions = [];
  let selectedDate = new Date();
  let currentDate = new Date();

  const totalIncomeEl = document.getElementById('totalIncome');
  const totalExpenseEl = document.getElementById('totalExpense');
  const balanceEl = document.getElementById('balance');
  const transactionListEl = document.getElementById('transactionList');
  const overviewMonthEl = document.getElementById('overviewMonth');
  const miniCalendarEl = document.querySelector('.mini-calendar');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');

  // ==========================
  // LOGOUT
  // ==========================
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("budgetflow_session");
    window.location.href = "login.html";
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
  // MONTH DISPLAY
  // ==========================
  function updateMonthDisplay() {
    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
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
  // UPDATE UI
  // ==========================
  function updateUI() {

    const filtered = filterTransactionsByMonth();
    const { totalIncome, totalExpense } = calculateTotals(filtered);
    const balance = totalIncome - totalExpense;

    totalIncomeEl.textContent = 'R' + totalIncome.toLocaleString();
    totalExpenseEl.textContent = 'R' + totalExpense.toLocaleString();
    balanceEl.textContent = 'R' + balance.toLocaleString();

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
            <span class="transaction-desc">${t.description}</span>
            <span class="transaction-date">${formatDisplayDate(t.date)}</span>
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

      if (daysWithTransactions.has(day))
        classes.push('has-transaction');

      if (isCurrentMonth && day === today.getDate())
        classes.push('current-day');

      if (
        isCurrentMonth &&
        day > today.getDate()
      )
        classes.push('future-day');

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
  // MODAL SYSTEM
  // ==========================
  const modalContainer = document.getElementById("modal-container");

  function openTransactionModal(type) {

    const today = new Date().toISOString().split("T")[0];

    modalContainer.innerHTML = `
      <div class="modal" style="display:flex;">
        <div class="modal-content">
          <h2>Add ${type === 'income' ? 'Income' : 'Expense'}</h2>

          <div class="form-group">
            <label>Amount</label>
            <input type="number" id="modalAmount" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <input type="text" id="modalDescription" />
          </div>

          <div class="form-group">
            <label>Date</label>
            <input type="date" id="modalDate" value="${today}" />
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" id="cancelModal">Cancel</button>
            <button class="btn-add" id="saveTransaction">Add</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("cancelModal").onclick = () => {
      modalContainer.innerHTML = "";
    };

    document.getElementById("saveTransaction").onclick = () => {

      const amount = Number.parseFloat(document.getElementById("modalAmount").value);
      const description = document.getElementById("modalDescription").value;
      const date = document.getElementById("modalDate").value;

      if (!amount || amount <= 0) return;

      transactions.push({
        type,
        amount,
        description,
        date
      });

      saveTransactions();
      updateUI();
      modalContainer.innerHTML = "";
    };
  }

  document.getElementById('addIncomeBtn')
    ?.addEventListener('click', () => openTransactionModal('income'));

  document.getElementById('addExpenseBtn')
    ?.addEventListener('click', () => openTransactionModal('expense'));

  // ==========================
  // INITIAL LOAD
  // ==========================
  loadTransactions();
  updateMonthDisplay();
  updateUI();

});