import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const wallets = sqliteTable('wallets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').$type<'cash' | 'bank' | 'credit' | 'savings'>().notNull().default('cash'),
  currency: text('currency').notNull().default('PHP'),
  balance: real('balance').notNull().default(0),
  icon: text('icon').notNull().default('Wallet'),
  color: text('color').notNull().default('#10B981'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  color: text('color').notNull(),
  type: text('type').$type<'expense' | 'income'>().notNull().default('expense'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
});

export const budgets = sqliteTable('budgets', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id).notNull(),
  limitAmount: real('limit_amount').notNull(),
  period: text('period').$type<'monthly' | 'weekly' | 'custom'>().notNull().default('monthly'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  rollover: integer('rollover', { mode: 'boolean' }).notNull().default(false),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  walletId: text('wallet_id').references(() => wallets.id).notNull(),
  destinationWalletId: text('destination_wallet_id'),
  categoryId: text('category_id'),
  subscriptionId: text('subscription_id'),
  amount: real('amount').notNull(),
  type: text('type').$type<'expense' | 'income' | 'transfer'>().notNull(),
  payee: text('payee').notNull(),
  payer: text('payer'),
  paymentType: text('payment_type').$type<'cash' | 'debit_card' | 'credit_card' | 'transfer' | 'web_payment'>(),
  note: text('note'),
  transactionDate: text('transaction_date').notNull(),
  transactionTime: text('transaction_time'),
  tags: text('tags'),
  createdAt: text('created_at').notNull(),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  walletId: text('wallet_id').references(() => wallets.id).notNull(),
  categoryId: text('category_id').references(() => categories.id).notNull(),
  name: text('name').notNull(),
  amount: real('amount').notNull(),
  billingCycle: text('billing_cycle').$type<'daily' | 'weekly' | 'monthly' | 'yearly'>().notNull().default('monthly'),
  nextBillingDate: text('next_billing_date').notNull(),
  autoLog: integer('auto_log', { mode: 'boolean' }).notNull().default(false),
  reminderEnabled: integer('reminder_enabled', { mode: 'boolean' }).notNull().default(true),
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').notNull().default(0),
  targetDate: text('target_date').notNull(),
  icon: text('icon').notNull().default('Target'),
  color: text('color').notNull().default('#8B5CF6'),
});
