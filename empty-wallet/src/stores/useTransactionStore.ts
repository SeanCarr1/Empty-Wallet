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
  updateTransaction: (
    id: string,
    updatedData: Omit<Transaction, 'id' | 'createdAt'>
  ) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: () => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const rows = db.getAllSync<any>(
        'SELECT * FROM transactions ORDER BY transaction_date DESC, transaction_time DESC, created_at DESC;'
      );
      const mapped: Transaction[] = rows.map((r) => ({
        id: r.id,
        walletId: r.wallet_id,
        destinationWalletId: r.destination_wallet_id,
        categoryId: r.category_id,
        subscriptionId: r.subscription_id,
        amount: Number(r.amount) || 0,
        type: r.type,
        payee: r.payee,
        payer: r.payer,
        paymentType: r.payment_type,
        note: r.note,
        transactionDate: r.transaction_date,
        transactionTime: r.transaction_time,
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
      const amt = Number(tx.amount) || 0;

      // 1. Insert transaction with safe parameterized binding
      db.runSync(
        'INSERT INTO transactions (id, wallet_id, destination_wallet_id, category_id, subscription_id, amount, type, payee, payer, payment_type, note, transaction_date, transaction_time, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
        [
          id,
          tx.walletId ?? '',
          tx.destinationWalletId ?? null,
          tx.categoryId ?? null,
          tx.subscriptionId ?? null,
          amt,
          tx.type ?? 'expense',
          tx.payee ?? '',
          tx.payer ?? null,
          tx.paymentType ?? 'cash',
          tx.note ?? null,
          tx.transactionDate ?? '',
          tx.transactionTime ?? null,
          tx.tags ?? null,
          now,
        ]
      );

      // 2. Adjust wallet balance
      if (tx.type === 'expense') {
        db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [amt, tx.walletId]);
      } else if (tx.type === 'income') {
        db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [amt, tx.walletId]);
      } else if (tx.type === 'transfer' && tx.destinationWalletId) {
        db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [amt, tx.walletId]);
        db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [amt, tx.destinationWalletId]);
      }

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

      const amt = Number(txToDelete.amount) || 0;

      // Reverse wallet balance impact
      if (txToDelete.type === 'expense') {
        db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [amt, txToDelete.walletId]);
      } else if (txToDelete.type === 'income') {
        db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [amt, txToDelete.walletId]);
      } else if (txToDelete.type === 'transfer' && txToDelete.destinationWalletId) {
        db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [amt, txToDelete.walletId]);
        db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [amt, txToDelete.destinationWalletId]);
      }

      db.runSync('DELETE FROM transactions WHERE id = ?;', [id]);

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

      for (let i = 0; i < txs.length; i++) {
        const tx = txs[i];
        const id = `tx_batch_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`;
        const amt = Number(tx.amount) || 0;

        db.runSync(
          'INSERT INTO transactions (id, wallet_id, destination_wallet_id, category_id, subscription_id, amount, type, payee, payer, payment_type, note, transaction_date, transaction_time, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
          [
            id,
            tx.walletId ?? '',
            tx.destinationWalletId ?? null,
            tx.categoryId ?? null,
            tx.subscriptionId ?? null,
            amt,
            tx.type ?? 'expense',
            tx.payee ?? '',
            tx.payer ?? null,
            tx.paymentType ?? 'cash',
            tx.note ?? null,
            tx.transactionDate ?? '',
            tx.transactionTime ?? null,
            tx.tags ?? null,
            now,
          ]
        );

        // Update wallet balance
        if (tx.type === 'expense') {
          db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [amt, tx.walletId]);
        } else if (tx.type === 'income') {
          db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [amt, tx.walletId]);
        }
      }

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

  updateTransaction: (id, updatedData) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const oldTx = get().transactions.find((t) => t.id === id);
      if (!oldTx) return;

      const oldAmt = Number(oldTx.amount) || 0;
      const newAmt = Number(updatedData.amount) || 0;

      // 1. Reverse old effect
      if (oldTx.type === 'expense') {
        db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [oldAmt, oldTx.walletId]);
      } else if (oldTx.type === 'income') {
        db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [oldAmt, oldTx.walletId]);
      } else if (oldTx.type === 'transfer' && oldTx.destinationWalletId) {
        db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [oldAmt, oldTx.walletId]);
        db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [oldAmt, oldTx.destinationWalletId]);
      }

      // 2. Apply new effect
      if (updatedData.type === 'expense') {
        db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [newAmt, updatedData.walletId]);
      } else if (updatedData.type === 'income') {
        db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [newAmt, updatedData.walletId]);
      } else if (updatedData.type === 'transfer' && updatedData.destinationWalletId) {
        db.runSync('UPDATE wallets SET balance = balance - ? WHERE id = ?;', [newAmt, updatedData.walletId]);
        db.runSync('UPDATE wallets SET balance = balance + ? WHERE id = ?;', [newAmt, updatedData.destinationWalletId]);
      }

      // 3. Update row
      db.runSync(
        'UPDATE transactions SET wallet_id = ?, destination_wallet_id = ?, category_id = ?, subscription_id = ?, amount = ?, type = ?, payee = ?, payer = ?, payment_type = ?, note = ?, transaction_date = ?, transaction_time = ?, tags = ? WHERE id = ?;',
        [
          updatedData.walletId ?? '',
          updatedData.destinationWalletId ?? null,
          updatedData.categoryId ?? null,
          updatedData.subscriptionId ?? null,
          newAmt,
          updatedData.type ?? 'expense',
          updatedData.payee ?? '',
          updatedData.payer ?? null,
          updatedData.paymentType ?? 'cash',
          updatedData.note ?? null,
          updatedData.transactionDate ?? '',
          updatedData.transactionTime ?? null,
          updatedData.tags ?? null,
          id,
        ]
      );

      get().fetchTransactions();
      useWalletStore.getState().fetchWallets();
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  },
}));
