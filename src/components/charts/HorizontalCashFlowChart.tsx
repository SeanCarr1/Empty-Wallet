import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '../../services/currency';
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
    <View className="w-full bg-background-card p-4 rounded-xl border border-background-border">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-content-primary font-bold text-sm">Cash Flow Distribution</Text>
        <View className="flex-row items-center bg-[#10B981]/10 px-2 py-0.5 rounded-md border border-[#10B981]/25">
          <Percent size={11} color="#10B981" />
          <Text className="text-[#10B981] font-bold text-[11px] ml-1">
            {savingsRate.toFixed(0)}% Saved
          </Text>
        </View>
      </View>

      {/* Horizontal Stacked Bar */}
      <View className="my-2">
        <View className="h-3.5 w-full bg-background-elevated rounded-md overflow-hidden flex-row border border-background-border">
          {income > 0 && (
            <View
              className="h-full bg-[#10B981]"
              style={{ width: `${incomePercent}%` }}
            />
          )}
          {expense > 0 && (
            <View
              className="h-full bg-[#EF4444]"
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
          <Text className="text-[#10B981] text-xs font-semibold">
            {income > 0 ? `${incomePercent.toFixed(0)}% Inflow` : ''}
          </Text>
          <Text className="text-[#EF4444] text-xs font-semibold">
            {expense > 0 ? `${expensePercent.toFixed(0)}% Outflow` : ''}
          </Text>
        </View>
      </View>

      {/* Metric Breakdown Cards */}
      <View className="flex-row items-center justify-between pt-3 mt-2 border-t border-background-border">
        <View className="flex-1">
          <View className="flex-row items-center mb-0.5">
            <ArrowDownLeft size={13} color="#10B981" />
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider ml-1">Total In</Text>
          </View>
          <Text className="text-[#10B981] font-bold text-sm">
            {formatCurrency(income, currency)}
          </Text>
        </View>

        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-0.5">
            <ArrowUpRight size={13} color="#EF4444" />
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider ml-1">Total Out</Text>
          </View>
          <Text className="text-[#EF4444] font-bold text-sm">
            {formatCurrency(expense, currency)}
          </Text>
        </View>

        <View className="flex-1 items-end">
          <View className="flex-row items-center mb-0.5">
            <Wallet size={13} color={netSavings >= 0 ? '#10B981' : '#EF4444'} />
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider ml-1">Net Cash</Text>
          </View>
          <Text className={`font-bold text-sm ${netSavings >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {formatCurrency(netSavings, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

