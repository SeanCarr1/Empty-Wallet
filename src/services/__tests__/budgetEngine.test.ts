import { calculateSafeToSpend, calculateCategoryBudgetStatus } from '../budgetEngine';
import { Transaction, Budget } from '../../types';

describe('Budget Engine Service', () => {
  const mockBudgets: Budget[] = [
    {
      id: 'b-1',
      categoryId: 'cat-food',
      limitAmount: 15000,
      period: 'monthly',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      rollover: false,
    },
    {
      id: 'b-2',
      categoryId: 'cat-utilities',
      limitAmount: 10000,
      period: 'monthly',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      rollover: false,
    },
    {
      id: 'b-3',
      categoryId: 'cat-entertainment',
      limitAmount: 5000,
      period: 'monthly',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      rollover: false,
    },
  ];

  describe('calculateSafeToSpend', () => {
    // August 2026 has 31 days. Mid-month: August 15 (17 days remaining: 31 - 15 + 1 = 17)
    const midMonthDate = new Date('2026-08-15T12:00:00.000Z');

    it('should aggregate total budget across all provided budgets', () => {
      const result = calculateSafeToSpend([], mockBudgets, midMonthDate);
      // 15000 + 10000 + 5000 = 30000
      expect(result.totalBudget).toBe(30000);
      expect(result.totalSpent).toBe(0);
      expect(result.remainingBudget).toBe(30000);
      expect(result.isOverBudget).toBe(false);
    });

    it('should accurately calculate days remaining in billing cycle', () => {
      // Day 15 of 31-day month: 31 - 15 + 1 = 17 days
      const mid = calculateSafeToSpend([], mockBudgets, new Date('2026-08-15T12:00:00Z'));
      expect(mid.daysRemainingInCycle).toBe(17);

      // Day 1 of 31-day month: 31 - 1 + 1 = 31 days
      const start = calculateSafeToSpend([], mockBudgets, new Date('2026-08-01T12:00:00Z'));
      expect(start.daysRemainingInCycle).toBe(31);

      // Day 31 of 31-day month: 31 - 31 + 1 = 1 day
      const end = calculateSafeToSpend([], mockBudgets, new Date('2026-08-31T12:00:00Z'));
      expect(end.daysRemainingInCycle).toBe(1);

      // February in non-leap year (28 days) e.g. 2025-02-10: 28 - 10 + 1 = 19
      const feb = calculateSafeToSpend([], mockBudgets, new Date('2025-02-10T12:00:00Z'));
      expect(feb.daysRemainingInCycle).toBe(19);
    });

    it('should only include expense transactions within the current month', () => {
      const transactions: Transaction[] = [
        // Current month expense (August) -> included
        {
          id: 'tx-1',
          walletId: 'w-1',
          categoryId: 'cat-food',
          amount: 3000,
          type: 'expense',
          payee: 'Grocery Store',
          transactionDate: '2026-08-05',
          createdAt: '2026-08-05T08:00:00Z',
        },
        // Another current month expense -> included
        {
          id: 'tx-2',
          walletId: 'w-1',
          categoryId: 'cat-utilities',
          amount: 2000,
          type: 'expense',
          payee: 'Electric Bill',
          transactionDate: '2026-08-10',
          createdAt: '2026-08-10T08:00:00Z',
        },
        // Current month income -> excluded
        {
          id: 'tx-3',
          walletId: 'w-1',
          categoryId: null,
          amount: 50000,
          type: 'income',
          payee: 'Salary',
          transactionDate: '2026-08-01',
          createdAt: '2026-08-01T08:00:00Z',
        },
        // Current month transfer -> excluded
        {
          id: 'tx-4',
          walletId: 'w-1',
          destinationWalletId: 'w-2',
          amount: 10000,
          type: 'transfer',
          payee: 'Transfer to Savings',
          transactionDate: '2026-08-08',
          createdAt: '2026-08-08T08:00:00Z',
        },
        // Previous month expense -> excluded
        {
          id: 'tx-5',
          walletId: 'w-1',
          categoryId: 'cat-food',
          amount: 4000,
          type: 'expense',
          payee: 'July Groceries',
          transactionDate: '2026-07-25',
          createdAt: '2026-07-25T08:00:00Z',
        },
        // Next month expense -> excluded
        {
          id: 'tx-6',
          walletId: 'w-1',
          categoryId: 'cat-food',
          amount: 4000,
          type: 'expense',
          payee: 'Sept Groceries',
          transactionDate: '2026-09-02',
          createdAt: '2026-09-02T08:00:00Z',
        },
      ];

      const result = calculateSafeToSpend(transactions, mockBudgets, midMonthDate);
      expect(result.totalSpent).toBe(5000); // 3000 + 2000
      expect(result.remainingBudget).toBe(25000); // 30000 - 5000
    });

    it('should calculate daily allowance correctly based on remaining budget and days left', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          walletId: 'w-1',
          categoryId: 'cat-food',
          amount: 13000,
          type: 'expense',
          payee: 'Various',
          transactionDate: '2026-08-10',
          createdAt: '2026-08-10T08:00:00Z',
        },
      ];

      // Total Budget = 30,000, Spent = 13,000, Remaining = 17,000
      // Days remaining on Aug 15 = 17 -> dailyAllowance = 17000 / 17 = 1000
      const result = calculateSafeToSpend(transactions, mockBudgets, midMonthDate);
      expect(result.dailyAllowance).toBe(1000);
      expect(result.remainingBudget).toBe(17000);
      expect(result.percentSpent).toBeCloseTo((13000 / 30000) * 100, 2);
    });

    it('should set dailyAllowance to 0 and flag isOverBudget when spend exceeds budget', () => {
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          walletId: 'w-1',
          categoryId: 'cat-food',
          amount: 35000,
          type: 'expense',
          payee: 'Excessive Expenses',
          transactionDate: '2026-08-10',
          createdAt: '2026-08-10T08:00:00Z',
        },
      ];

      // Total Budget = 30,000, Spent = 35,000 -> Remaining = -5,000
      const result = calculateSafeToSpend(transactions, mockBudgets, midMonthDate);
      expect(result.remainingBudget).toBe(-5000);
      expect(result.isOverBudget).toBe(true);
      expect(result.dailyAllowance).toBe(0);
      expect(result.velocityStatus).toBe('critical');
    });

    it('should determine healthy velocityStatus when spending is on or below expected pace', () => {
      // Day 15 of 31: expected pace = (15 / 31) * 100 = 48.387%
      // Total budget = 30000
      // Spend 10000 (33.33% spent) -> within expected pace + 5% (53.39%)
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          walletId: 'w-1',
          amount: 10000,
          type: 'expense',
          payee: 'Food',
          transactionDate: '2026-08-10',
          createdAt: '2026-08-10T08:00:00Z',
        },
      ];

      const result = calculateSafeToSpend(transactions, mockBudgets, midMonthDate);
      expect(result.velocityStatus).toBe('healthy');
    });

    it('should determine caution velocityStatus when spending exceeds pace + 5% but within pace + 20%', () => {
      // Day 15 of 31: expected pace = 48.387%
      // Caution range: 48.387% + 5% (53.387%) to 48.387% + 20% (68.387%)
      // Spend 17000 of 30000 = 56.67% -> caution
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          walletId: 'w-1',
          amount: 17000,
          type: 'expense',
          payee: 'Pace test',
          transactionDate: '2026-08-12',
          createdAt: '2026-08-12T08:00:00Z',
        },
      ];

      const result = calculateSafeToSpend(transactions, mockBudgets, midMonthDate);
      expect(result.velocityStatus).toBe('caution');
    });

    it('should determine critical velocityStatus when spending exceeds expected pace + 20%', () => {
      // Day 15 of 31: expected pace = 48.387%
      // Pace + 20% = 68.387%
      // Spend 22000 of 30000 = 73.33% -> critical
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          walletId: 'w-1',
          amount: 22000,
          type: 'expense',
          payee: 'Pace test high',
          transactionDate: '2026-08-14',
          createdAt: '2026-08-14T08:00:00Z',
        },
      ];

      const result = calculateSafeToSpend(transactions, mockBudgets, midMonthDate);
      expect(result.velocityStatus).toBe('critical');
    });

    it('should calculate projected end-of-month spend accurately', () => {
      // Day 15: spent 15000 -> daily velocity = 15000 / 15 = 1000/day
      // Projected end spend = 1000 * 31 = 31000
      const transactions: Transaction[] = [
        {
          id: 'tx-1',
          walletId: 'w-1',
          amount: 15000,
          type: 'expense',
          payee: 'Pace test',
          transactionDate: '2026-08-10',
          createdAt: '2026-08-10T08:00:00Z',
        },
      ];

      const result = calculateSafeToSpend(transactions, mockBudgets, midMonthDate);
      expect(result.projectedEndSpend).toBe(31000);
    });

    it('should handle zero budgets gracefully without division by zero', () => {
      const result = calculateSafeToSpend([], [], midMonthDate);
      expect(result.totalBudget).toBe(0);
      expect(result.percentSpent).toBe(0);
      expect(result.dailyAllowance).toBe(0);
      expect(result.remainingBudget).toBe(0);
      expect(result.isOverBudget).toBe(false);
      expect(result.velocityStatus).toBe('healthy');
    });

    it('should work without explicit referenceDate (defaults to current date)', () => {
      const result = calculateSafeToSpend([], mockBudgets);
      expect(result.totalBudget).toBe(30000);
      expect(result.daysRemainingInCycle).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateCategoryBudgetStatus', () => {
    const referenceDate = new Date('2026-08-15T12:00:00Z');

    const transactions: Transaction[] = [
      // Food expense in month -> included
      {
        id: 'tx-1',
        walletId: 'w-1',
        categoryId: 'cat-food',
        amount: 3500,
        type: 'expense',
        payee: 'Restaurant',
        transactionDate: '2026-08-05',
        createdAt: '2026-08-05T08:00:00Z',
      },
      // Another food expense in month -> included
      {
        id: 'tx-2',
        walletId: 'w-1',
        categoryId: 'cat-food',
        amount: 1500,
        type: 'expense',
        payee: 'Groceries',
        transactionDate: '2026-08-12',
        createdAt: '2026-08-12T08:00:00Z',
      },
      // Food refund (income) -> ignored
      {
        id: 'tx-3',
        walletId: 'w-1',
        categoryId: 'cat-food',
        amount: 500,
        type: 'income',
        payee: 'Refund',
        transactionDate: '2026-08-10',
        createdAt: '2026-08-10T08:00:00Z',
      },
      // Different category expense -> ignored
      {
        id: 'tx-4',
        walletId: 'w-1',
        categoryId: 'cat-utilities',
        amount: 4000,
        type: 'expense',
        payee: 'Electric',
        transactionDate: '2026-08-10',
        createdAt: '2026-08-10T08:00:00Z',
      },
      // Food expense in previous month -> ignored
      {
        id: 'tx-5',
        walletId: 'w-1',
        categoryId: 'cat-food',
        amount: 5000,
        type: 'expense',
        payee: 'July Groceries',
        transactionDate: '2026-07-20',
        createdAt: '2026-07-20T08:00:00Z',
      },
    ];

    it('should calculate spent, remaining, and percentage for normal status (< 80%)', () => {
      // Food budget: 10,000; Total food expense in Aug: 3500 + 1500 = 5000 (50%)
      const status = calculateCategoryBudgetStatus('cat-food', 10000, transactions, referenceDate);
      expect(status.budgetLimit).toBe(10000);
      expect(status.spent).toBe(5000);
      expect(status.remaining).toBe(5000);
      expect(status.percentage).toBe(50);
      expect(status.isOverBudget).toBe(false);
      expect(status.warningLevel).toBe('normal');
    });

    it('should return warning status when spending is between 80% and 99.9%', () => {
      // Budget limit: 6,000; Spent: 5,000 -> 83.33%
      const status = calculateCategoryBudgetStatus('cat-food', 6000, transactions, referenceDate);
      expect(status.percentage).toBeCloseTo(83.33, 1);
      expect(status.isOverBudget).toBe(false);
      expect(status.warningLevel).toBe('warning');
    });

    it('should return warning status at exactly 80% spending', () => {
      // Budget limit: 6,250; Spent: 5,000 -> 80.0%
      const status = calculateCategoryBudgetStatus('cat-food', 6250, transactions, referenceDate);
      expect(status.percentage).toBe(80);
      expect(status.isOverBudget).toBe(false);
      expect(status.warningLevel).toBe('warning');
    });

    it('should return over status when spending reaches exactly 100%', () => {
      // Budget limit: 5,000; Spent: 5,000 -> 100%
      const status = calculateCategoryBudgetStatus('cat-food', 5000, transactions, referenceDate);
      expect(status.percentage).toBe(100);
      expect(status.remaining).toBe(0);
      expect(status.isOverBudget).toBe(false);
      expect(status.warningLevel).toBe('over');
    });

    it('should cap percentage at 100 and flag isOverBudget when spend exceeds limit', () => {
      // Budget limit: 4,000; Spent: 5,000 -> 125% -> capped to 100%
      const status = calculateCategoryBudgetStatus('cat-food', 4000, transactions, referenceDate);
      expect(status.spent).toBe(5000);
      expect(status.remaining).toBe(-1000);
      expect(status.percentage).toBe(100);
      expect(status.isOverBudget).toBe(true);
      expect(status.warningLevel).toBe('over');
    });

    it('should return zero spent when no transactions match category', () => {
      const status = calculateCategoryBudgetStatus('cat-transport', 5000, transactions, referenceDate);
      expect(status.spent).toBe(0);
      expect(status.remaining).toBe(5000);
      expect(status.percentage).toBe(0);
      expect(status.isOverBudget).toBe(false);
      expect(status.warningLevel).toBe('normal');
    });

    it('should handle zero budget limit safely', () => {
      const status = calculateCategoryBudgetStatus('cat-food', 0, transactions, referenceDate);
      expect(status.budgetLimit).toBe(0);
      expect(status.spent).toBe(5000);
      expect(status.percentage).toBe(0);
      expect(status.isOverBudget).toBe(true);
      expect(status.warningLevel).toBe('normal');
    });
  });
});
