const income = 5000;
const expenses = 3200;
const balance = income - expenses;

document.getElementById("totalIncome").innerText = "R" + income;
document.getElementById("totalExpense").innerText = "R" + expenses;
document.getElementById("balance").innerText = "R" + balance;

// Chart
const ctx = document.getElementById('financeChart').getContext('2d');

const financeChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Income', 'Expenses'],
    datasets: [{
      data: [income, expenses],
      backgroundColor: ['#28a745', '#dc3545']
    }]
  }
});

// Transactions
const transactions = [
  { type: "Income", amount: 5000 },
  { type: "Expense", amount: 1200 },
  { type: "Expense", amount: 2000 }
];

const list = document.getElementById("transactionList");

transactions.forEach(t => {
  const li = document.createElement("li");
  li.textContent = `${t.type} - R${t.amount}`;
  list.appendChild(li);
});
