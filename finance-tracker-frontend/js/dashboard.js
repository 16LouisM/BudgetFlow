// dashboard.js
let income = 0, expenses = 0, balance = 0;
let transactions = [];
let financeChart;

const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');
const transactionListEl = document.getElementById('transactionList');
const ctx = document.getElementById('financeChart')?.getContext('2d');

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
  totalIncomeEl.textContent = 'R' + income;
  totalExpenseEl.textContent = 'R' + expenses;
  balance = income - expenses;
  balanceEl.textContent = 'R' + balance;
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
      li.textContent = `${t.type === 'income' ? '💰' : '💸'} ${t.type}: R${t.amount} - ${t.description} (${formatDate(t.date)})`;
      transactionListEl.appendChild(li);
    });
  }
}

// Fallback modal HTML as a string (in case fetch fails)
const fallbackModalHTML = `
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

function loadModal(modalPath, containerId, callback) {
  fetch(modalPath)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(html => {
      document.getElementById(containerId).innerHTML = html;
      callback();
    })
    .catch(error => {
      console.warn('Fetch failed, using fallback modal. Error:', error);
      // Inject fallback HTML so functionality still works
      document.getElementById(containerId).innerHTML = fallbackModalHTML;
      callback();
    });
}

function initModal() {
  const modal = document.getElementById('incomeModal');
  const addIncomeBtn = document.getElementById('addIncomeBtn');
  const form = document.getElementById('incomeForm');
  const clearBtn = document.querySelector('.btn-clear');
  const cancelBtn = document.querySelector('.btn-cancel');

  if (!modal || !addIncomeBtn || !form) {
    console.error('Modal elements missing');
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

  cancelBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  clearBtn?.addEventListener('click', () => {
    form.reset();
    if (dateInput) dateInput.value = `${y}-${m}-${d}`;
  });

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

    income += amount;
    transactions.push({ type: 'income', amount, description, date, category });
    updateUI();
    form.reset();
    if (dateInput) dateInput.value = `${y}-${m}-${d}`;
    modal.style.display = 'none';
    alert('Income added!');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  updateUI();
  // Adjust path: if dashboard.html is in root, use 'components/modal-income.html'
  // If in pages/, use '../components/modal-income.html'
  loadModal('components/modal-income.html', 'modal-container', initModal);
});