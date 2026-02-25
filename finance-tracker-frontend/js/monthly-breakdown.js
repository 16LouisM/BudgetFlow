// ======================================================
// BudgetFlow - Monthly Breakdown (Production Clean)
// ======================================================

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
// STORAGE
// ======================================================
function loadBudgets() {
  categoryBudgets = JSON.parse(localStorage.getItem('budgetflow_budgets')) || {};
}

function saveBudgets() {
  localStorage.setItem('budgetflow_budgets', JSON.stringify(categoryBudgets));
}

function loadTransactions() {
  transactions = JSON.parse(localStorage.getItem('budgetflow_transactions')) || [];
}

function saveTransactions() {
  localStorage.setItem('budgetflow_transactions', JSON.stringify(transactions));
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
// TABLE
// ======================================================
function renderBudgetTable(categorySpent) {
  let html = '';
  let highest = { name:'', spent:0 };

  expenseCategories.forEach(cat => {
    const spent = categorySpent[cat] || 0;
    const budget = categoryBudgets[cat] || 0;
    const remaining = budget - spent;

    if (spent > highest.spent)
      highest = { name:cat, spent };

    html += `
      <tr>
        <td>${cat}</td>
        <td>${budget ? 'R'+budget.toLocaleString() : '-'}</td>
        <td>R${spent.toLocaleString()}</td>
        <td class="${remaining<0?'exceeded':''}">
          ${budget ? 'R'+remaining.toLocaleString() : '-'}
        </td>
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
    type:'pie',
    data:{
      labels: expenseCategories,
      datasets:[{
        data: expenseCategories.map(cat=>categorySpent[cat]||0),
        backgroundColor:[
          '#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF',
          '#FF9F40','#E7E9ED','#76A346','#C45850','#6A4C9C','#8B4513'
        ]
      }]
    },
    options:{ responsive:true }
  });
}

// ======================================================
// REFRESH VIEW (NEW)
// ======================================================
function refreshMonthlyView() {
  const monthly = filterCurrentMonthTransactions();
  const { totalIncome, totalExpense, categorySpent } =
    calculateTotals(monthly);

  updateSummary(totalIncome, totalExpense, categorySpent);
  renderChart(categorySpent);
  renderBudgetTable(categorySpent);
}

// ======================================================
// MODALS (CLEANED)
// ======================================================
function initIncomeModal() {
  const modal = document.getElementById('incomeModal');
  const form = document.getElementById('incomeForm');
  const addBtn = document.getElementById('addIncomeBtn');

  addBtn?.addEventListener('click', ()=> modal.style.display='flex');

  form?.addEventListener('submit',(e)=>{
    e.preventDefault();

    const amount = Number.parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;

    if (Number.isNaN(amount) || amount <= 0) return alert('Invalid amount');

    transactions.push({ type:'income', amount, description, date, category });
    saveTransactions();

    modal.style.display='none';
    form.reset();

    refreshMonthlyView();
  });
}

function initExpenseModal() {
  const modal = document.getElementById('expenseModal');
  const form = document.getElementById('expenseForm');
  const addBtn = document.getElementById('addExpenseBtn');

  addBtn?.addEventListener('click', ()=> modal.style.display='flex');

  form?.addEventListener('submit',(e)=>{
    e.preventDefault();

    const amount = Number.parseFloat(document.getElementById('expenseAmount').value);
    const description = document.getElementById('expenseDescription').value;
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;

    if (Number.isNaN(amount) || amount <= 0) return alert('Invalid amount');

    transactions.push({ type:'expense', amount, description, date, category });
    saveTransactions();

    modal.style.display='none';
    form.reset();

    refreshMonthlyView();
  });
}

// ======================================================
// INIT
// ======================================================
function initPage() {
  setCurrentMonthYear();
  loadBudgets();
  loadTransactions();
  refreshMonthlyView();
}

document.addEventListener('DOMContentLoaded', ()=>{
  initPage();
});