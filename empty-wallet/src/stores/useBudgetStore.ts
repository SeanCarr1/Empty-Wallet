import { create } from 'zustand';
import { Budget, Goal, Subscription } from '../types';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../db/client';

interface BudgetState {
  budgets: Budget[];
  goals: Goal[];
  subscriptions: Subscription[];
  isLoading: boolean;
  fetchBudgets: () => void;
  fetchGoals: () => void;
  fetchSubscriptions: () => void;
  fetchAllBudgetingData: () => void;
  
  // Budgets
  setCategoryBudget: (categoryId: string, limitAmount: number, period?: 'monthly' | 'weekly') => void;
  deleteBudget: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  deleteGoal: (id: string) => void;

  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  goals: [],
  subscriptions: [],
  isLoading: false,

  fetchBudgets: () => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const rows = db.getAllSync<any>('SELECT * FROM budgets;');
      const mapped: Budget[] = rows.map((r) => ({
        id: r.id,
        categoryId: r.category_id,
        limitAmount: r.limit_amount,
        period: r.period,
        startDate: r.start_date,
        endDate: r.end_date,
        rollover: Boolean(r.rollover),
      }));
      set({ budgets: mapped });
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  },

  fetchGoals: () => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const rows = db.getAllSync<any>('SELECT * FROM goals;');
      const mapped: Goal[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        targetAmount: r.target_amount,
        currentAmount: r.current_amount,
        targetDate: r.target_date,
        icon: r.icon,
        color: r.color,
      }));
      set({ goals: mapped });
    } catch (err) {
      console.error('Error fetching goals:', err);
    }
  },

  fetchSubscriptions: () => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const rows = db.getAllSync<any>('SELECT * FROM subscriptions;');
      const mapped: Subscription[] = rows.map((r) => ({
        id: r.id,
        walletId: r.wallet_id,
        categoryId: r.category_id,
        name: r.name,
        amount: r.amount,
        billingCycle: r.billing_cycle,
        nextBillingDate: r.next_billing_date,
        autoLog: Boolean(r.auto_log),
        reminderEnabled: Boolean(r.reminder_enabled),
      }));
      set({ subscriptions: mapped });
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    }
  },

  fetchAllBudgetingData: () => {
    get().fetchBudgets();
    get().fetchGoals();
    get().fetchSubscriptions();
  },

  setCategoryBudget: (categoryId, limitAmount, period = 'monthly') => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const now = new Date();
      const yearMonth = now.toISOString().slice(0, 7);
      const startDate = `${yearMonth}-01`;
      const endDate = `${yearMonth}-28`;

      // Check if existing budget for category
      const existing = db.getAllSync<any>(
        'SELECT id FROM budgets WHERE category_id = ?;',
        [categoryId]
      );

      if (existing.length > 0) {
        const stmt = db.prepareSync(
          'UPDATE budgets SET limit_amount = ?, period = ? WHERE category_id = ?;'
        );
        stmt.executeSync([limitAmount, period, categoryId]);
        stmt.finalizeSync();
      } else {
        const id = `budget_${Date.now()}`;
        const stmt = db.prepareSync(
          'INSERT INTO budgets (id, category_id, limit_amount, period, start_date, end_date, rollover) VALUES (?, ?, ?, ?, ?, ?, ?);'
        );
        stmt.executeSync([id, categoryId, limitAmount, period, startDate, endDate, 0]);
        stmt.finalizeSync();
      }

      get().fetchBudgets();
    } catch (err) {
      console.error('Error setting budget:', err);
    }
  },

  deleteBudget: (id) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const stmt = db.prepareSync('DELETE FROM budgets WHERE id = ?;');
      stmt.executeSync([id]);
      stmt.finalizeSync();
      get().fetchBudgets();
    } catch (err) {
      console.error('Error deleting budget:', err);
    }
  },

  addGoal: (goal) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const id = `goal_${Date.now()}`;
      const stmt = db.prepareSync(
        'INSERT INTO goals (id, name, target_amount, current_amount, target_date, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?);'
      );
      stmt.executeSync([
        id,
        goal.name,
        goal.targetAmount,
        0,
        goal.targetDate,
        goal.icon || 'Target',
        goal.color || '#8B5CF6',
      ]);
      stmt.finalizeSync();
      get().fetchGoals();
    } catch (err) {
      console.error('Error adding goal:', err);
    }
  },

  contributeToGoal: (goalId, amount) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const stmt = db.prepareSync(
        'UPDATE goals SET current_amount = current_amount + ? WHERE id = ?;'
      );
      stmt.executeSync([amount, goalId]);
      stmt.finalizeSync();
      get().fetchGoals();
    } catch (err) {
      console.error('Error contributing to goal:', err);
    }
  },

  deleteGoal: (id) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const stmt = db.prepareSync('DELETE FROM goals WHERE id = ?;');
      stmt.executeSync([id]);
      stmt.finalizeSync();
      get().fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  },

  addSubscription: (sub) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const id = `sub_${Date.now()}`;
      const stmt = db.prepareSync(
        'INSERT INTO subscriptions (id, wallet_id, category_id, name, amount, billing_cycle, next_billing_date, auto_log, reminder_enabled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);'
      );
      stmt.executeSync([
        id,
        sub.walletId,
        sub.categoryId,
        sub.name,
        sub.amount,
        sub.billingCycle,
        sub.nextBillingDate,
        sub.autoLog ? 1 : 0,
        sub.reminderEnabled ? 1 : 0,
      ]);
      stmt.finalizeSync();
      get().fetchSubscriptions();
    } catch (err) {
      console.error('Error adding subscription:', err);
    }
  },

  deleteSubscription: (id) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const stmt = db.prepareSync('DELETE FROM subscriptions WHERE id = ?;');
      stmt.executeSync([id]);
      stmt.finalizeSync();
      get().fetchSubscriptions();
    } catch (err) {
      console.error('Error deleting subscription:', err);
    }
  },
}));
