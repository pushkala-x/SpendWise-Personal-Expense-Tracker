export type Category = 
  | 'Food & Dining' 
  | 'Transport' 
  | 'Shopping' 
  | 'Bills & Utilities' 
  | 'Entertainment' 
  | 'Groceries' 
  | 'Income' 
  | 'Other';

export interface Transaction {
  id: string;
  date: string; // ISO string
  description: string;
  amount: number; // positive for income, negative for expense
  category: Category;
  paymentMethod: string;
}

export interface Budget {
  category: Category;
  limit: number;
}

export interface MonthlyInsight {
  totalSpent: number;
  totalIncome: number;
  savings: number;
  topCategory: Category;
}
