import { Transaction, Category } from './types';

const CATEGORIES: Category[] = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Groceries',
  'Income',
  'Other'
];

const DESCRIPTIONS: Record<Category, string[]> = {
  'Food & Dining': ['Zomato Order', 'Starbucks Coffee', 'Lunch with Friends', 'Burger King', 'Fine Dining'],
  'Transport': ['Uber Ride', 'Metro Recharge', 'Petrol Refill', 'Ola Cabs'],
  'Shopping': ['Amazon.in purchase', 'Flipkart Sneakers', 'Myntra Shirt', 'H&M Jacket'],
  'Bills & Utilities': ['Airtel Mobile Recharge', 'BESCOM Bill', 'ACT Fibernet', 'Electricity Bill'],
  'Entertainment': ['Netflix Subscription', 'PVR Cinemas', 'BookMyShow', 'Spotify Premium'],
  'Groceries': ['Big Bazaar', 'Reliance Fresh', 'D-Mart Groceries', 'Local Market'],
  'Income': ['Monthly Salary', 'Freelance Project', 'Dividend Payout', 'Side Hustle'],
  'Other': ['ATM Withdrawal', 'Misc Repair', 'Charity', 'Gift']
};

export function generateSyntheticData(count: number = 30): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const isIncome = category === 'Income';
    
    // Random date within last 3 months
    const date = new Date();
    date.setDate(now.getDate() - Math.floor(Math.random() * 90));

    const descs = DESCRIPTIONS[category];
    const description = descs[Math.floor(Math.random() * descs.length)];
    
    const amount = isIncome 
      ? Math.floor(Math.random() * 50000) + 10000 
      : (Math.floor(Math.random() * 2000) + 100) * -1;

    transactions.push({
      id: Math.random().toString(36).substr(2, 9),
      date: date.toISOString(),
      description,
      amount,
      category,
      paymentMethod: isIncome ? 'Bank Transfer' : ['UPI', 'Credit Card', 'Cash'][Math.floor(Math.random() * 3)]
    });
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
