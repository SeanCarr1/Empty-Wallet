import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { Wallet } from '../types';

export const DATABASE_NAME = 'empty_wallet.db';

const expoDb = SQLite.openDatabaseSync(DATABASE_NAME);
export const db = drizzle(expoDb, { schema });

/**
 * Initializes database tables and seed data if the database is newly created.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // 1. Create Tables using raw SQLite DDL to ensure immediate execution on fresh run
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'cash',
        currency TEXT NOT NULL DEFAULT 'PHP',
        balance REAL NOT NULL DEFAULT 0,
        icon TEXT NOT NULL DEFAULT 'Wallet',
        color TEXT NOT NULL DEFAULT '#10B981',
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'expense',
        is_default INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY NOT NULL,
        category_id TEXT NOT NULL,
        limit_amount REAL NOT NULL,
        period TEXT NOT NULL DEFAULT 'monthly',
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        rollover INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        wallet_id TEXT NOT NULL,
        destination_wallet_id TEXT,
        category_id TEXT,
        subscription_id TEXT,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        payee TEXT NOT NULL,
        note TEXT,
        transaction_date TEXT NOT NULL,
        tags TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (wallet_id) REFERENCES wallets (id)
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY NOT NULL,
        wallet_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        billing_cycle TEXT NOT NULL DEFAULT 'monthly',
        next_billing_date TEXT NOT NULL,
        auto_log INTEGER NOT NULL DEFAULT 0,
        reminder_enabled INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (wallet_id) REFERENCES wallets (id),
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL NOT NULL DEFAULT 0,
        target_date TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'Target',
        color TEXT NOT NULL DEFAULT '#8B5CF6'
      );
    `);

    // 2. Check if Categories exist, otherwise seed default categories
    const existingCats = expoDb.getAllSync<{ count: number }>('SELECT count(*) as count FROM categories;');
    if (existingCats[0]?.count === 0) {
      const stmt = expoDb.prepareSync(
        'INSERT INTO categories (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, ?)'
      );
      for (const cat of DEFAULT_CATEGORIES) {
        stmt.executeSync([cat.id, cat.name, cat.icon, cat.color, cat.type, cat.isDefault ? 1 : 0]);
      }
      stmt.finalizeSync();
    }

    // 3. Check if Wallets exist, otherwise seed default wallets (Cash & Primary Bank)
    const existingWallets = expoDb.getAllSync<{ count: number }>('SELECT count(*) as count FROM wallets;');
    if (existingWallets[0]?.count === 0) {
      const now = new Date().toISOString();
      const defaultWallets: Wallet[] = [
        {
          id: 'wallet_cash',
          name: 'Cash',
          type: 'cash',
          currency: 'PHP',
          balance: 2500,
          icon: 'Banknote',
          color: '#10B981',
          isArchived: false,
          createdAt: now,
        },
        {
          id: 'wallet_main_bank',
          name: 'Primary Bank',
          type: 'bank',
          currency: 'PHP',
          balance: 35000,
          icon: 'Landmark',
          color: '#3B82F6',
          isArchived: false,
          createdAt: now,
        },
        {
          id: 'wallet_credit_card',
          name: 'Credit Card',
          type: 'credit',
          currency: 'PHP',
          balance: -4200,
          icon: 'CreditCard',
          color: '#F43F5E',
          isArchived: false,
          createdAt: now,
        }
      ];

      const stmt = expoDb.prepareSync(
        'INSERT INTO wallets (id, name, type, currency, balance, icon, color, is_archived, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      for (const w of defaultWallets) {
        stmt.executeSync([w.id, w.name, w.type, w.currency, w.balance, w.icon, w.color, w.isArchived ? 1 : 0, w.createdAt]);
      }
      stmt.finalizeSync();

      // Seed a few initial demo transactions so the app looks alive immediately
      const demoTxStmt = expoDb.prepareSync(
        'INSERT INTO transactions (id, wallet_id, destination_wallet_id, category_id, subscription_id, amount, type, payee, note, transaction_date, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      demoTxStmt.executeSync([
        'tx_demo_1',
        'wallet_main_bank',
        null,
        'cat_salary',
        null,
        45000,
        'income',
        'Company Payroll',
        'Monthly salary payout',
        yesterday,
        'salary,work',
        now,
      ]);
      demoTxStmt.executeSync([
        'tx_demo_2',
        'wallet_cash',
        null,
        'cat_food_dining',
        null,
        350,
        'expense',
        'Cafe Latte & Pastry',
        'Morning breakfast',
        todayStr,
        'coffee,breakfast',
        now,
      ]);
      demoTxStmt.executeSync([
        'tx_demo_3',
        'wallet_main_bank',
        null,
        'cat_groceries',
        null,
        2850,
        'expense',
        'Supermarket Weekly Run',
        'Produce & pantry essentials',
        yesterday,
        'groceries',
        now,
      ]);
      demoTxStmt.finalizeSync();

      // Seed initial sample monthly budget
      const budgetStmt = expoDb.prepareSync(
        'INSERT INTO budgets (id, category_id, limit_amount, period, start_date, end_date, rollover) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      budgetStmt.executeSync([
        'b_food',
        'cat_food_dining',
        8000,
        'monthly',
        `${todayStr.slice(0, 7)}-01`,
        `${todayStr.slice(0, 7)}-28`,
        0
      ]);
      budgetStmt.executeSync([
        'b_groceries',
        'cat_groceries',
        12000,
        'monthly',
        `${todayStr.slice(0, 7)}-01`,
        `${todayStr.slice(0, 7)}-28`,
        0
      ]);
      budgetStmt.executeSync([
        'b_transport',
        'cat_transport',
        4000,
        'monthly',
        `${todayStr.slice(0, 7)}-01`,
        `${todayStr.slice(0, 7)}-28`,
        0
      ]);
      budgetStmt.finalizeSync();
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}
