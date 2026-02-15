const income = 0;
const expenses = 0;
const balance = income - expenses;

document.getElementById("totalIncome").innerText = "R" + income;
document.getElementById("totalExpense").innerText = "R" + expenses;
document.getElementById("balance").innerText = "R" + balance;

// =====================
// Chart
// =====================
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

// =====================
// Transactions
// =====================
const transactions = [];

const list = document.getElementById("transactionList");

if (list) {
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
}

// =====================
// Sidebar Ripple Effect
// =====================
document.querySelectorAll(".sidebar ul li").forEach(item => {

  // Ripple click effect
  item.addEventListener("click", function (e) {

    // Remove active from others
    document.querySelectorAll(".sidebar ul li")
      .forEach(li => li.classList.remove("active"));

    // Add active to clicked item
    this.classList.add("active");

    const ripple = document.createElement("span");
    ripple.classList.add("ripple");

    const rect = this.getBoundingClientRect();
    ripple.style.left = e.clientX - rect.left + "px";
    ripple.style.top = e.clientY - rect.top + "px";

    this.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });

});
