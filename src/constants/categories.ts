import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  {
    id: 'cat_food_dining',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#F43F5E', // Rose
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#10B981', // Emerald
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_transport',
    name: 'Transportation',
    icon: 'Car',
    color: '#3B82F6', // Blue
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_bills_utilities',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#F59E0B', // Amber
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_housing_rent',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#8B5CF6', // Purple
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#EC4899', // Pink
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#06B6D4', // Cyan
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_health',
    name: 'Health & Wellness',
    icon: 'HeartPulse',
    color: '#14B8A6', // Teal
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_subscriptions',
    name: 'Subscriptions',
    icon: 'CreditCard',
    color: '#6366F1', // Indigo
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_education',
    name: 'Education & Books',
    icon: 'GraduationCap',
    color: '#F97316', // Orange
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_travel',
    name: 'Travel & Vacation',
    icon: 'Plane',
    color: '#0EA5E9', // Sky
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat_other_expense',
    name: 'Miscellaneous',
    icon: 'MoreHorizontal',
    color: '#64748B', // Slate
    type: 'expense',
    isDefault: true,
  },

  // Income Categories
  {
    id: 'cat_salary',
    name: 'Salary & Wages',
    icon: 'Briefcase',
    color: '#10B981', // Emerald
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_freelance',
    name: 'Freelance & Side Gig',
    icon: 'Laptop',
    color: '#06B6D4', // Cyan
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_investments',
    name: 'Investments & Dividends',
    icon: 'TrendingUp',
    color: '#8B5CF6', // Purple
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_gifts',
    name: 'Gifts & Allowance',
    icon: 'Gift',
    color: '#EC4899', // Pink
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_other_income',
    name: 'Other Income',
    icon: 'PlusCircle',
    color: '#3B82F6', // Blue
    type: 'income',
    isDefault: true,
  },
];
