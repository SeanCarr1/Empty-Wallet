import { SafeToSpendMetrics, Transaction, Budget } from '../types';
import { getDaysInMonth, getDate, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

/**
 * Calculates real-time Safe-to-Spend metrics for the current billing cycle.
 */
export function calculateSafeToSpend(
  transactions: Transaction[],
  budgets: Budget[],
  referenceDate: Date = new Date()
): SafeToSpendMetrics {
  const currentDay = getDate(referenceDate);
  const totalDays = getDaysInMonth(referenceDate);
  const daysRemainingInCycle = Math.max(1, totalDays - currentDay + 1);

  // Total active budget across all category budgets
  const totalBudget = budgets.reduce((sum, b) => sum + b.limitAmount, 0);

  // Calculate current month's total expense transactions
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  const totalSpent = transactions
    .filter((tx) => {
      if (tx.type !== 'expense') return false;
      const txDate = parseISO(tx.transactionDate);
      return isWithinInterval(txDate, { start: monthStart, end: monthEnd });
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingBudget = totalBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;

  // Daily Allowance: remaining money divided by remaining days
  const dailyAllowance = remainingBudget > 0 ? remainingBudget / daysRemainingInCycle : 0;

  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Projected spend at end of month based on daily velocity so far
  const dailyVelocitySoFar = currentDay > 0 ? totalSpent / currentDay : 0;
  const projectedEndSpend = dailyVelocitySoFar * totalDays;

  // Velocity status assessment
  let velocityStatus: 'healthy' | 'caution' | 'critical' = 'healthy';
  const expectedPacePercentage = (currentDay / totalDays) * 100;

  if (isOverBudget || percentSpent > expectedPacePercentage + 20) {
    velocityStatus = 'critical';
  } else if (percentSpent > expectedPacePercentage + 5) {
    velocityStatus = 'caution';
  } else {
    velocityStatus = 'healthy';
  }

  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    dailyAllowance,
    daysRemainingInCycle,
    percentSpent,
    projectedEndSpend,
    isOverBudget,
    velocityStatus,
  };
}

/**
 * Calculates budget status for an individual category.
 */
export function calculateCategoryBudgetStatus(
  categoryId: string,
  budgetLimit: number,
  transactions: Transaction[],
  referenceDate: Date = new Date()
) {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  const spent = transactions
    .filter((tx) => {
      if (tx.type !== 'expense' || tx.categoryId !== categoryId) return false;
      const txDate = parseISO(tx.transactionDate);
      return isWithinInterval(txDate, { start: monthStart, end: monthEnd });
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remaining = budgetLimit - spent;
  const percentage = budgetLimit > 0 ? Math.min(100, (spent / budgetLimit) * 100) : 0;
  const isOverBudget = spent > budgetLimit;

  return {
    budgetLimit,
    spent,
    remaining,
    percentage,
    isOverBudget,
    warningLevel: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'normal',
  };
}
