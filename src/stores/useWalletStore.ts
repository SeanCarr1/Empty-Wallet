import { create } from 'zustand';
import { Wallet, WalletType } from '../types';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../db/client';

interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;
  fetchWallets: () => void;
  addWallet: (wallet: Omit<Wallet, 'id' | 'createdAt' | 'isArchived'>) => void;
  updateWallet: (id: string, updates: Partial<Omit<Wallet, 'id' | 'createdAt'>>) => void;
  deleteWallet: (id: string) => void;
  transferFunds: (fromWalletId: string, toWalletId: string, amount: number, note?: string) => void;
  getTotalBalance: () => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  isLoading: false,

  fetchWallets: () => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const rows = db.getAllSync<any>(
        'SELECT * FROM wallets WHERE is_archived = 0 ORDER BY created_at ASC;'
      );
      const mapped: Wallet[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type as WalletType,
        currency: r.currency,
        balance: r.balance,
        icon: r.icon,
        color: r.color,
        isArchived: Boolean(r.is_archived),
        createdAt: r.created_at,
      }));
      set({ wallets: mapped, isLoading: false });
    } catch (err) {
      console.error('Error fetching wallets:', err);
    }
  },

  addWallet: (newWallet) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const id = `wallet_${Date.now()}`;
      const now = new Date().toISOString();

      const stmt = db.prepareSync(
        'INSERT INTO wallets (id, name, type, currency, balance, icon, color, is_archived, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.executeSync([
        id,
        newWallet.name,
        newWallet.type,
        newWallet.currency || 'PHP',
        newWallet.balance,
        newWallet.icon || 'Wallet',
        newWallet.color || '#10B981',
        0,
        now,
      ]);
      stmt.finalizeSync();

      get().fetchWallets();
    } catch (err) {
      console.error('Error adding wallet:', err);
    }
  },

  updateWallet: (id, updates) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const current = get().wallets.find((w) => w.id === id);
      if (!current) return;

      const updated = { ...current, ...updates };
      const stmt = db.prepareSync(
        'UPDATE wallets SET name = ?, type = ?, currency = ?, balance = ?, icon = ?, color = ? WHERE id = ?'
      );
      stmt.executeSync([
        updated.name,
        updated.type,
        updated.currency,
        updated.balance,
        updated.icon,
        updated.color,
        id,
      ]);
      stmt.finalizeSync();

      get().fetchWallets();
    } catch (err) {
      console.error('Error updating wallet:', err);
    }
  },

  deleteWallet: (id) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      // Soft delete
      const stmt = db.prepareSync('UPDATE wallets SET is_archived = 1 WHERE id = ?');
      stmt.executeSync([id]);
      stmt.finalizeSync();

      get().fetchWallets();
    } catch (err) {
      console.error('Error deleting wallet:', err);
    }
  },

  transferFunds: (fromWalletId, toWalletId, amount, note) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const now = new Date().toISOString();
      const todayStr = now.split('T')[0];
      const txId = `tx_transfer_${Date.now()}`;

      // Deduct from source, add to destination
      db.withTransactionSync(() => {
        const deductStmt = db.prepareSync('UPDATE wallets SET balance = balance - ? WHERE id = ?');
        deductStmt.executeSync([amount, fromWalletId]);
        deductStmt.finalizeSync();

        const addStmt = db.prepareSync('UPDATE wallets SET balance = balance + ? WHERE id = ?');
        addStmt.executeSync([amount, toWalletId]);
        addStmt.finalizeSync();

        const txStmt = db.prepareSync(
          'INSERT INTO transactions (id, wallet_id, destination_wallet_id, amount, type, payee, note, transaction_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        txStmt.executeSync([
          txId,
          fromWalletId,
          toWalletId,
          amount,
          'transfer',
          'Wallet Transfer',
          note || null,
          todayStr,
          now,
        ]);
        txStmt.finalizeSync();
      });

      get().fetchWallets();
    } catch (err) {
      console.error('Error transferring funds:', err);
    }
  },

  getTotalBalance: () => {
    return get().wallets.reduce((acc, w) => acc + w.balance, 0);
  },
}));
