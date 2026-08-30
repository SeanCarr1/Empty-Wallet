import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { formatCurrency } from '../../src/services/currency';
import { CategoryDonutChart, CategorySpendItem } from '../../src/components/charts/CategoryDonutChart';
import { MonthlyTrendBarChart, MonthlyTrendData } from '../../src/components/charts/MonthlyTrendBarChart';
import { HorizontalCashFlowChart } from '../../src/components/charts/HorizontalCashFlowChart';
import { BalanceTrendLineChart } from '../../src/components/charts/BalanceTrendLineChart';
import { triggerHaptic } from '../../src/services/haptics';
import { Download, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react-native';
import { format, subMonths, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function AnalyticsScreen() {
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { getTotalBalance } = useWalletStore();
  const currency = useSettingsStore((s) => s.currency);

  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const totalNetBalance = getTotalBalance();

  const targetDate = useMemo(() => subMonths(new Date(), selectedMonthOffset), [selectedMonthOffset]);
  const currentMonthStart = useMemo(() => startOfMonth(targetDate), [targetDate]);
  const currentMonthEnd = useMemo(() => endOfMonth(targetDate), [targetDate]);

  // Filter transactions for target month
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const d = parseISO(tx.transactionDate);
      return isWithinInterval(d, { start: currentMonthStart, end: currentMonthEnd });
    });
  }, [transactions, currentMonthStart, currentMonthEnd]);

  // Aggregate stats
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Category breakdown
  const categorySpendData: CategorySpendItem[] = useMemo(() => {
    const map = new Map<string, number>();

    for (const tx of monthTransactions) {
      if (tx.type === 'expense') {
        const catId = tx.categoryId || 'cat_other_expense';
        map.set(catId, (map.get(catId) || 0) + tx.amount);
      }
    }

    const items: CategorySpendItem[] = [];
    map.forEach((amount, catId) => {
      const cat = categoryMap.get(catId) || {
        id: catId,
        name: 'Other',
        icon: 'MoreHorizontal',
        color: '#64748B',
        type: 'expense',
      };
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      items.push({ category: cat, amount, percentage });
    });

    return items.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, totalExpense, categoryMap]);

  // 6-Month Cash Flow Trend
  const trendData: MonthlyTrendData[] = useMemo(() => {
    const list: MonthlyTrendData[] = [];
    for (let i = 5; i >= 0; i--) {
      const mDate = subMonths(new Date(), i);
      const mStart = startOfMonth(mDate);
      const mEnd = endOfMonth(mDate);
      const label = format(mDate, 'MMM');

      const inc = transactions
        .filter(
          (tx) =>
            tx.type === 'income' &&
            isWithinInterval(parseISO(tx.transactionDate), { start: mStart, end: mEnd })
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      const exp = transactions
        .filter(
          (tx) =>
            tx.type === 'expense' &&
            isWithinInterval(parseISO(tx.transactionDate), { start: mStart, end: mEnd })
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      list.push({ monthLabel: label, income: inc, expense: exp });
    }
    return list;
  }, [transactions]);

  const handleExportCSV = async () => {
    try {
      triggerHaptic.selection();
      const csvHeader = 'ID,Date,Time,Type,PaymentType,Payee,Payer,Amount,Category,Wallet,Note\n';
      const csvRows = transactions
        .map(
          (t) =>
            `"${t.id}","${t.transactionDate}","${t.transactionTime || ''}","${t.type}","${t.paymentType || ''}","${t.payee.replace(/"/g, '""')}","${(t.payer || '').replace(/"/g, '""')}","${t.amount}","${t.categoryId || ''}","${t.walletId}","${(t.note || '').replace(/"/g, '""')}"`
        )
        .join('\n');

      const fullCsv = csvHeader + csvRows;

      await Share.share({
        title: 'Empty-Wallet-Transactions.csv',
        message: fullCsv,
      });
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-5 pt-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-content-primary">Financial Insights</Text>
            <Text className="text-content-secondary text-xs mt-0.5">
              Cash flow ratios, balance curves & category slices
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportCSV}
            className="flex-row items-center bg-background-card border border-background-border px-3.5 py-2 rounded-2xl"
          >
            <Download size={16} color="#10B981" />
            <Text className="text-content-primary font-semibold text-xs ml-2">Export CSV</Text>
          </TouchableOpacity>
        </View>

        {/* Month Selector Pills */}
        <View className="flex-row mb-4">
          {[0, 1, 2].map((offset) => {
            const mDate = subMonths(new Date(), offset);
            const isSelected = selectedMonthOffset === offset;
            const label = offset === 0 ? 'This Month' : format(mDate, 'MMMM yyyy');

            return (
              <TouchableOpacity
                key={offset}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic.selection();
                  setSelectedMonthOffset(offset);
                }}
                className={`px-3.5 py-2 rounded-xl mr-2 border ${
                  isSelected
                    ? 'bg-primary/20 border-primary'
                    : 'bg-background-card border-background-border'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-primary' : 'text-content-secondary'
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {/* Top 3 Summary Cards */}
          <View className="flex-row space-x-2.5 mb-5">
            <View className="flex-1 bg-background-card p-3.5 rounded-2xl border border-background-border mr-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-content-tertiary text-[10px] font-semibold uppercase">Income</Text>
                <ArrowDownRight size={14} color="#10B981" />
              </View>
              <Text className="text-primary font-bold text-base mt-0.5">
                {formatCurrency(totalIncome, currency)}
              </Text>
            </View>

            <View className="flex-1 bg-background-card p-3.5 rounded-2xl border border-background-border mr-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-content-tertiary text-[10px] font-semibold uppercase">Expense</Text>
                <ArrowUpRight size={14} color="#F43F5E" />
              </View>
              <Text className="text-expense font-bold text-base mt-0.5">
                {formatCurrency(totalExpense, currency)}
              </Text>
            </View>

            <View className="flex-1 bg-background-card p-3.5 rounded-2xl border border-background-border">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-content-tertiary text-[10px] font-semibold uppercase">Savings %</Text>
                <Award size={14} color="#8B5CF6" />
              </View>
              <Text className="text-accent-purple font-bold text-base mt-0.5">
                {savingsRate.toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* 1. HORIZONTAL CASH FLOW GRAPH */}
          <View className="mb-5">
            <HorizontalCashFlowChart income={totalIncome} expense={totalExpense} currency={currency} />
          </View>

          {/* 2. BALANCE TREND LINE GRAPH */}
          <View className="mb-2">
            <BalanceTrendLineChart
              transactions={transactions}
              currentTotalBalance={totalNetBalance}
              currency={currency}
            />
          </View>

          {/* 3. CATEGORY BREAKDOWN DONUT CHART */}
          <View className="bg-background-card p-5 rounded-3xl border border-background-border mb-5">
            <Text className="text-content-primary font-bold text-base mb-1">Spending by Category</Text>
            <Text className="text-content-tertiary text-xs mb-3">
              Distribution for {format(targetDate, 'MMMM yyyy')}
            </Text>

            <CategoryDonutChart
              data={categorySpendData}
              totalSpent={totalExpense}
              currency={currency}
              size={190}
            />

            {/* Category Legend List */}
            <View className="mt-4 border-t border-background-border/50 pt-3">
              {categorySpendData.slice(0, 6).map((item) => (
                <View
                  key={item.category.id}
                  className="flex-row items-center justify-between py-2 border-b border-background-border/20"
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-3 h-3 rounded-full mr-2.5"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <Text className="text-content-primary text-xs font-semibold">
                      {item.category.name}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Text className="text-content-primary font-bold text-xs mr-2">
                      {formatCurrency(item.amount, currency)}
                    </Text>
                    <Text className="text-content-tertiary text-[11px] w-10 text-right">
                      {item.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 4. MONTHLY 6-MONTH COMPARISON BARS */}
          <View className="mb-4">
            <MonthlyTrendBarChart data={trendData} currency={currency} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
