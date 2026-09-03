export type Role = "admin" | "member";

export type AccountType = "Cash" | "Bank" | "Savings" | "UPI" | "Wallet" | "Other";

export const ACCOUNT_TYPES: AccountType[] = ["Cash", "Bank", "Savings", "UPI", "Wallet", "Other"];

export type ExpenseCategory =
  | "Food" | "Groceries" | "Travel" | "Fuel" | "Shopping" | "Medical" | "Education"
  | "Electricity" | "Water" | "Internet" | "Mobile" | "Rent" | "EMI"
  | "Entertainment" | "Family" | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food", "Groceries", "Travel", "Fuel", "Shopping", "Medical", "Education",
  "Electricity", "Water", "Internet", "Mobile", "Rent", "EMI",
  "Entertainment", "Family", "Other",
];

export type IncomeType = "Salary" | "Business" | "Freelance" | "Rental" | "Interest" | "Bonus" | "Other";

export const INCOME_TYPES: IncomeType[] = ["Salary", "Business", "Freelance", "Rental", "Interest", "Bonus", "Other"];

export type LoanType =
  | "Home Loan" | "Personal Loan" | "Vehicle Loan" | "Education Loan"
  | "Credit Card" | "Borrowed Money" | "Other";

export const LOAN_TYPES: LoanType[] = [
  "Home Loan", "Personal Loan", "Vehicle Loan", "Education Loan",
  "Credit Card", "Borrowed Money", "Other",
];

export type LoanStatus = "Active" | "Completed" | "Closed";
export type PaymentStatus = "Paid" | "Pending" | "Overdue";
export type Frequency = "One Time" | "Monthly" | "Quarterly" | "Yearly";

export interface Profile {
  id: string;
  family_id: string;
  full_name: string;
  email: string;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  family_id: string;
  owner_id: string | null;
  account_name: string;
  account_type: AccountType;
  opening_balance: number;
  current_balance: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  family_id: string;
  user_id: string;
  account_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  family_id: string;
  user_id: string;
  account_id: string;
  amount: number;
  income_type: IncomeType;
  description: string | null;
  income_date: string;
  created_at: string;
  updated_at: string;
}

export interface Loan {
  id: string;
  family_id: string;
  loan_name: string;
  loan_type: LoanType;
  lender_name: string | null;
  original_amount: number;
  remaining_amount: number;
  interest_rate: number;
  emi_amount: number;
  start_date: string | null;
  end_date: string | null;
  next_payment_date: string | null;
  status: LoanStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  family_id: string;
  account_id: string | null;
  amount: number;
  payment_date: string;
  payment_type: string;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  family_id: string;
  category: string;
  budget_amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface RecurringPayment {
  id: string;
  family_id: string;
  payment_name: string;
  amount: number;
  category: string;
  due_date: string;
  frequency: Frequency;
  account_id: string | null;
  status: "Upcoming" | "Paid" | "Overdue";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  family_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  status: "Active" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
}

export interface FamilySettings {
  family_id: string;
  upcoming_days: number;
  emergency_reserve: number;
  updated_at: string;
}
