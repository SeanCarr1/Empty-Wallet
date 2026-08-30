import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency, formatCompactCurrency } from '../../services/currency';
import { ArrowDownLeft, ArrowUpRight, Wallet, Percent } from 'lucide-react-native';

interface HorizontalCashFlowChartProps {
  income: number;
  expense: number;
  currency: string;
}

export const HorizontalCashFlowChart: React.FC<HorizontalCashFlowChartProps> = ({
  income,
  expense,
  currency,
}) => {
  const total = income + expense;
  const incomePercent = total > 0 ? (income / total) * 100 : 50;
  const expensePercent = total > 0 ? (expense / total) * 100 : 50;

  const netSavings = income - expense;
  const savingsRate = income > 0 ? Math.max(0, (netSavings / income) * 100) : 0;

  return (
    <View className="w-full bg-background-card p-5 rounded-3xl border border-background-border">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-content-primary font-bold text-base">Cash Flow Distribution</Text>
        <View className="flex-row items-center bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
          <Percent size={11} color="#10B981" />
          <Text className="text-primary font-semibold text-xs ml-1">
            {savingsRate.toFixed(0)}% Saved
          </Text>
        </View>
      </View>

      {/* Horizontal Stacked Bar */}
      <View className="my-2">
        <View className="h-5 w-full bg-background-elevated rounded-full overflow-hidden flex-row border border-background-border/50">
          {income > 0 && (
            <View
              className="h-full bg-primary items-center justify-center"
              style={{ width: `${incomePercent}%` }}
            />
          )}
          {expense > 0 && (
            <View
              className="h-full bg-expense items-center justify-center"
              style={{ width: `${expensePercent}%` }}
            />
          )}
          {total === 0 && (
            <View className="h-full w-full bg-background-elevated items-center justify-center">
              <Text className="text-content-muted text-[10px]">No Cash Flow Recorded</Text>
            </View>
          )}
        </View>

        {/* Percentage Marks Under Bar */}
        <View className="flex-row justify-between mt-1.5 px-0.5">
          <Text className="text-primary text-xs font-semibold">
            {income > 0 ? `${incomePercent.toFixed(0)}% Inflow` : ''}
          </Text>
          <Text className="text-expense text-xs font-semibold">
            {expense > 0 ? `${expensePercent.toFixed(0)}% Outflow` : ''}
          </Text>
        </View>
      </View>

      {/* Metric Breakdown Cards */}
      <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-background-border/40">
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <ArrowDownLeft size={13} color="#10B981" />
            <Text className="text-content-tertiary text-[11px] font-semibold uppercase ml-1">Total In</Text>
          </View>
          <Text className="text-primary font-bold text-sm">
            {formatCurrency(income, currency)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-0.5">
            <ArrowUpRight size={13} color="#F43F5E" />
            <Text className="text-content-tertiary text-[11px] font-semibold uppercase ml-1">Total Out</Text>
          </View>
          <Text className="text-expense font-bold text-sm">
            {formatCurrency(expense, currency)}
          </Text>
        </View>

        <View className="flex-1 items-end">
          <View className="flex-row items-center mb-0.5">
            <Wallet size={13} color={netSavings >= 0 ? '#10B981' : '#F43F5E'} />
            <Text className="text-content-tertiary text-[11px] font-semibold uppercase ml-1">Net Cash</Text>
          </View>
          <Text className={`font-bold text-sm ${netSavings >= 0 ? 'text-primary' : 'text-expense'}`}>
            {formatCurrency(netSavings, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};
