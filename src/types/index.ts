export type TransactionType = 'expense' | 'income' | 'transfer';

export type WalletType = 'cash' | 'bank' | 'credit' | 'savings';

export type BudgetPeriod = 'monthly' | 'weekly' | 'custom';

export type SubscriptionCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  balance: number;
  icon: string;
  color: string;
  isArchived: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  destinationWalletId?: string | null; // For transfers
  categoryId?: string | null;
  subscriptionId?: string | null;
  amount: number;
  type: TransactionType;
  payee: string;
  note?: string | null;
  transactionDate: string; // ISO string YYYY-MM-DD
  tags?: string | null; // Comma-separated or JSON
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limitAmount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  rollover: boolean;
}

export interface Subscription {
  id: string;
  walletId: string;
  categoryId: string;
  name: string;
  amount: number;
  billingCycle: SubscriptionCycle;
  nextBillingDate: string; // YYYY-MM-DD
  autoLog: boolean;
  reminderEnabled: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  icon: string;
  color: string;
}

export interface SafeToSpendMetrics {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  dailyAllowance: number;
  daysRemainingInCycle: number;
  percentSpent: number;
  projectedEndSpend: number;
  isOverBudget: boolean;
  velocityStatus: 'healthy' | 'caution' | 'critical';
}
