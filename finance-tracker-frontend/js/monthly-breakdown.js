// ======================================================
// BudgetFlow - Monthly Breakdown
// Complete Production Version
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
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
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

  const totalBudget = Object.values(categoryBudgets).reduce((a,b)=>a+b,0);
  const totalSpent = Object.values(categorySpent).reduce((a,b)=>a+b,0);
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

  if (budget === 0) return { status:'No budget', className:'' };
  if (remaining < 0) return { status:'Exceeded', className:'exceeded' };
  if (percentUsed >= 80) return { status:'Warning', className:'warning' };

  return { status:'On track', className:'good' };
}

// ======================================================
// RENDER TABLE
// ======================================================
function renderBudgetTable(categorySpent) {

  let html = '';
  let highest = { name:'', spent:0 };

  expenseCategories.forEach(cat => {
    const spent = categorySpent[cat];
    const budget = categoryBudgets[cat] || 0;
    const remaining = budget - spent;
    const status = calculateBudgetStatus(spent, budget);

    if (spent > highest.spent)
      highest = { name:cat, spent };

    html += `
      <tr>
        <td>${cat}</td>
        <td>${budget ? 'R'+budget.toLocaleString() : '-'}</td>
        <td>R${spent.toLocaleString()}</td>
        <td class="${remaining < 0 ? 'exceeded':''}">
          ${budget ? 'R'+remaining.toLocaleString() : '-'}
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
    type:'pie',
    data:{
      labels,
      datasets:[{
        data,
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
// SIDEBAR NAVIGATION
// ======================================================
function initSidebarNavigation() {

  document.getElementById('dashboardBtn')?.addEventListener('click', ()=>{
    window.location.href = 'dashboard.html';
  });

  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{
    localStorage.removeItem('budgetflow_loggedInUser');
    window.location.href = 'login.html';
  });

  document.getElementById('addIncomeBtn')?.addEventListener('click', ()=>{
    const modal = document.getElementById('incomeModal');
    if (modal) modal.style.display = 'flex';
  });

  document.getElementById('addExpenseBtn')?.addEventListener('click', ()=>{
    const modal = document.getElementById('expenseModal');
    if (modal) modal.style.display = 'flex';
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
document.addEventListener('DOMContentLoaded', ()=>{
  initPage();
  initSidebarNavigation();
});
