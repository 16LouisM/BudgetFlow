# BudgetFlow -- Smart Student Finance Tracker

## Overview

**BudgetFlow** is a web-based personal finance management system
designed specifically for students. The application helps students track
their **income, expenses, and budgets** while providing a clear monthly
financial overview through charts and summaries.

Many students struggle with managing limited funds such as allowances,
bursaries, or part‑time job income. BudgetFlow provides a simple and
intuitive platform that allows users to monitor spending habits and stay
within their budgets.

------------------------------------------------------------------------

# Features

## User Authentication

-   User Registration
-   Secure Login
-   JWT Authentication
-   Session management

## Dashboard

The dashboard provides a quick overview of the user's financial status
including: - Total Income - Total Expenses - Remaining Balance - Quick
access to financial actions

## Income Management

Users can add and manage income sources such as: - Allowance - Part-time
job - Bursary - Scholarships - Gifts - Other income

Features: - Add income entries - Edit income entries - Delete income
entries

## Expense Management

Students can record daily spending including categories like: - Food -
Transport - Rent / Accommodation - Books & Study Materials -
Entertainment - Data / Internet - Other expenses

Features: - Add expenses - Edit expenses - Delete expenses

## Monthly Breakdown

The **Monthly Breakdown page** provides a detailed analysis of: - Total
income for the month - Total expenses for the month - Remaining
balance - Spending patterns

## Charts & Visualization

BudgetFlow includes visual analytics using charts: - Pie Chart --
Expense category distribution - Bar Chart -- Monthly income vs expenses

Charts help students easily understand where their money goes.

## Budget Limits

Users can set **monthly budget limits**. The system will: - Track
spending against the budget - Alert the user when they exceed their
limit

## Alerts & Notifications

The system provides warnings when: - Spending approaches the monthly
limit - Budget has been exceeded

------------------------------------------------------------------------

# Tech Stack

## Frontend

-   HTML5
-   CSS3
-   JavaScript
-   Chart.js

## Backend

-   Node.js / Express.js\
    OR\
-   Java Spring Boot

## Database

-   MySQL\
    OR\
-   PostgreSQL

## Authentication

-   JSON Web Tokens (JWT)

------------------------------------------------------------------------

# Project Structure

    BudgetFlow
    │
    ├── frontend
    │   ├── html
    │   │   ├── dashboard.html
    │   │   ├── login.html
    │   │   ├── register.html
    │   │   └── monthly-breakdown.html
    │   │
    │   ├── css
    │   │   ├── dashboard.css
    │   │   └── style.css
    │   │
    │   └── js
    │       ├── dashboard.js
    │       ├── monthly-breakdown.js
    │       └── auth-backend.js
    │
    ├── backend
    │   ├── controllers
    │   ├── models
    │   ├── routes
    │   └── server.js
    │
    └── database
        └── schema.sql

------------------------------------------------------------------------

# Installation

## 1. Clone the Repository

    git clone https://github.com/yourusername/budgetflow.git
    cd budgetflow

## 2. Install Backend Dependencies

If using Node.js:

    npm install

## 3. Start the Server

    npm start

Server will run on:

    http://localhost:3000

------------------------------------------------------------------------

# Future Improvements

Possible future enhancements: - Mobile responsive improvements - AI
spending insights - Export reports (PDF / Excel) - Bank API
integration - Dark mode support - Student financial tips section

------------------------------------------------------------------------

# Author

**Mashele Louis**\
Diploma in Information Technology\
Vaal University of Technology

------------------------------------------------------------------------

# License

This project is licensed under the **MIT License**.
