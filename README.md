# SpendWise: Smart Personal Expense Tracker

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-yellow.svg)](https://opensource.org/licenses/Apache-2.0)

## 📊 Overview
SpendWise is a professional-grade personal finance management application designed for students, freelancers, and professionals to take control of their financial health. It provides real-time insights, automated budgeting, and data-driven visualizations.

### 🌟 Key Features
- **Smart Dashboard**: Instant visualization of income vs. expenses with dynamic line charts.
- **Category Analytics**: Interactive donut charts to identify top spending areas.
- **Budget Monitoring**: Real-time progress bars for category-wise budget limits with overspending alerts.
- **Transaction Management**: Effortless logging with category tags and payment method tracking.
- **Data Export**: One-click CSV export for monthly financial auditing.
- **Local Persistence**: Securely stores your data in the browser's local storage.

## 🛠 Tech Stack
- **Frontend**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Charts**: Recharts (D3-based)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📂 Project Structure
```
/
├── src/
│   ├── App.tsx          # Main Dashboard & Application Logic
│   ├── types.ts         # TypeScript Interfaces for Data Models
│   ├── utils.ts         # Synthetic Data Engine & Formatting
│   └── index.css        # Global Design Tokens & Tailwind Config
├── public/              # Static Assets
└── README.md            # Documentation
```

## 🚀 Getting Started
1. **Clone the Repo**: `git clone https://github.com/your-username/spendwise.git`
2. **Install Deps**: `npm install`
3. **Run Dev Server**: `npm run dev`
4. **Build for Production**: `npm run build`

## 📈 Proof of Work
This project demonstrates proficiency in:
- **State Management**: Complex React hooks for filtering and real-time computation.
- **Data Visualization**: Transforming raw transaction arrays into meaningful charts.
- **Responsive UI/UX**: Mobile-first design focusing on accessibility and visual hierarchy.
- **Performance Optimization**: Use of `useMemo` for heavy analytical calculations.

---
*Built as a proof of work for Personal Finance Analytics and Full-Stack Development roles.*
