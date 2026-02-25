// ============================================
// BudgetFlow Storage Layer (Professional Version)
// Handles per-user data separation
// ============================================

const Storage = {

    // =============================
    // AUTH
    // =============================
    setCurrentUser(email) {
        localStorage.setItem("currentUser", email);
        localStorage.setItem("isLoggedIn", "true");
    },

    getCurrentUser() {
        return localStorage.getItem("currentUser");
    },

    logout() {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isLoggedIn");
    },

    isLoggedIn() {
        return localStorage.getItem("isLoggedIn") === "true";
    },

    // =============================
    // TRANSACTIONS
    // =============================
    getTransactions() {
        const user = this.getCurrentUser();
        if (!user) return [];

        const data = localStorage.getItem(`budgetflow_transactions_${user}`);
        return data ? JSON.parse(data) : [];
    },

    saveTransactions(transactions) {
        const user = this.getCurrentUser();
        if (!user) return;

        localStorage.setItem(
            `budgetflow_transactions_${user}`,
            JSON.stringify(transactions)
        );
    },

    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.push(transaction);
        this.saveTransactions(transactions);
    },

    // =============================
    // BUDGETS
    // =============================
    getBudgets() {
        const user = this.getCurrentUser();
        if (!user) return {};

        const data = localStorage.getItem(`budgetflow_budgets_${user}`);
        return data ? JSON.parse(data) : {};
    },

    saveBudgets(budgets) {
        const user = this.getCurrentUser();
        if (!user) return;

        localStorage.setItem(
            `budgetflow_budgets_${user}`,
            JSON.stringify(budgets)
        );
    }
};