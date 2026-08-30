import { create } from 'zustand';
import { Transaction } from '../types';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../db/client';
import { useWalletStore } from './useWalletStore';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  fetchTransactions: () => void;
  addTransaction: (
    tx: Omit<Transaction, 'id' | 'createdAt'>
  ) => void;
  deleteTransaction: (id: string) => void;
  batchAddTransactions: (
    txs: Omit<Transaction, 'id' | 'createdAt'>[]
  ) => void;
  getRecentTransactions: (limit?: number) => Transaction[];
  getTransactionsByMonth: (yearMonth: string) => Transaction[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: () => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const rows = db.getAllSync<any>(
        'SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC;'
      );
      const mapped: Transaction[] = rows.map((r) => ({
        id: r.id,
        walletId: r.wallet_id,
        destinationWalletId: r.destination_wallet_id,
        categoryId: r.category_id,
        subscriptionId: r.subscription_id,
        amount: r.amount,
        type: r.type,
        payee: r.payee,
        note: r.note,
        transactionDate: r.transaction_date,
        tags: r.tags,
        createdAt: r.created_at,
      }));
      set({ transactions: mapped, isLoading: false });
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  },

  addTransaction: (tx) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      db.withTransactionSync(() => {
        // 1. Insert transaction
        const stmt = db.prepareSync(
          'INSERT INTO transactions (id, wallet_id, destination_wallet_id, category_id, subscription_id, amount, type, payee, note, transaction_date, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        stmt.executeSync([
          id,
          tx.walletId,
          tx.destinationWalletId || null,
          tx.categoryId || null,
          tx.subscriptionId || null,
          tx.amount,
          tx.type,
          tx.payee,
          tx.note || null,
          tx.transactionDate,
          tx.tags || null,
          now,
        ]);
        stmt.finalizeSync();

        // 2. Adjust wallet balance
        if (tx.type === 'expense') {
          const wStmt = db.prepareSync('UPDATE wallets SET balance = balance - ? WHERE id = ?');
          wStmt.executeSync([tx.amount, tx.walletId]);
          wStmt.finalizeSync();
        } else if (tx.type === 'income') {
          const wStmt = db.prepareSync('UPDATE wallets SET balance = balance + ? WHERE id = ?');
          wStmt.executeSync([tx.amount, tx.walletId]);
          wStmt.finalizeSync();
        }
      });

      get().fetchTransactions();
      useWalletStore.getState().fetchWallets();
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  },

  deleteTransaction: (id) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const txToDelete = get().transactions.find((t) => t.id === id);
      if (!txToDelete) return;

      db.withTransactionSync(() => {
        // Reverse wallet balance impact
        if (txToDelete.type === 'expense') {
          const wStmt = db.prepareSync('UPDATE wallets SET balance = balance + ? WHERE id = ?');
          wStmt.executeSync([txToDelete.amount, txToDelete.walletId]);
          wStmt.finalizeSync();
        } else if (txToDelete.type === 'income') {
          const wStmt = db.prepareSync('UPDATE wallets SET balance = balance - ? WHERE id = ?');
          wStmt.executeSync([txToDelete.amount, txToDelete.walletId]);
          wStmt.finalizeSync();
        }

        const stmt = db.prepareSync('DELETE FROM transactions WHERE id = ?');
        stmt.executeSync([id]);
        stmt.finalizeSync();
      });

      get().fetchTransactions();
      useWalletStore.getState().fetchWallets();
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  },

  batchAddTransactions: (txs) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const now = new Date().toISOString();

      db.withTransactionSync(() => {
        const stmt = db.prepareSync(
          'INSERT INTO transactions (id, wallet_id, destination_wallet_id, category_id, subscription_id, amount, type, payee, note, transaction_date, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );

        for (let i = 0; i < txs.length; i++) {
          const tx = txs[i];
          const id = `tx_batch_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`;
          stmt.executeSync([
            id,
            tx.walletId,
            tx.destinationWalletId || null,
            tx.categoryId || null,
            tx.subscriptionId || null,
            tx.amount,
            tx.type,
            tx.payee,
            tx.note || null,
            tx.transactionDate,
            tx.tags || null,
            now,
          ]);

          // Update wallet balance
          if (tx.type === 'expense') {
            const wStmt = db.prepareSync('UPDATE wallets SET balance = balance - ? WHERE id = ?');
            wStmt.executeSync([tx.amount, tx.walletId]);
            wStmt.finalizeSync();
          } else if (tx.type === 'income') {
            const wStmt = db.prepareSync('UPDATE wallets SET balance = balance + ? WHERE id = ?');
            wStmt.executeSync([tx.amount, tx.walletId]);
            wStmt.finalizeSync();
          }
        }
        stmt.finalizeSync();
      });

      get().fetchTransactions();
      useWalletStore.getState().fetchWallets();
    } catch (err) {
      console.error('Error batch adding transactions:', err);
    }
  },

  getRecentTransactions: (limit = 10) => {
    return get().transactions.slice(0, limit);
  },

  getTransactionsByMonth: (yearMonth) => {
    return get().transactions.filter((tx) => tx.transactionDate.startsWith(yearMonth));
  },
}));
