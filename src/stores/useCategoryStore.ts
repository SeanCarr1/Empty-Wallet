import { create } from 'zustand';
import { Category } from '../types';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../db/client';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => void;
  addCategory: (cat: Omit<Category, 'id' | 'isDefault'>) => void;
  getExpenseCategories: () => Category[];
  getIncomeCategories: () => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  isLoading: false,

  fetchCategories: () => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const rows = db.getAllSync<any>('SELECT * FROM categories ORDER BY name ASC;');
      if (rows.length > 0) {
        const mapped: Category[] = rows.map((r) => ({
          id: r.id,
          name: r.name,
          icon: r.icon,
          color: r.color,
          type: r.type,
          isDefault: Boolean(r.is_default),
        }));
        set({ categories: mapped });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  },

  addCategory: (cat) => {
    try {
      const db = SQLite.openDatabaseSync(DATABASE_NAME);
      const id = `cat_custom_${Date.now()}`;
      const stmt = db.prepareSync(
        'INSERT INTO categories (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, ?);'
      );
      stmt.executeSync([id, cat.name, cat.icon, cat.color, cat.type, 0]);
      stmt.finalizeSync();
      get().fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
    }
  },

  getExpenseCategories: () => {
    return get().categories.filter((c) => c.type === 'expense');
  },

  getIncomeCategories: () => {
    return get().categories.filter((c) => c.type === 'income');
  },
}));
