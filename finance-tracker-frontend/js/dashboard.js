const income = 0;
const expenses = 0;
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
const transactions = [];

const list = document.getElementById("transactionList");
if (transactions.length === 0) {
  const li = document.createElement("li");
  li.textContent = "No transactions yet.";
  list.appendChild(li);
} else {
  transactions.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.type} - R${t.amount}`;
    list.appendChild(li);
  });
}