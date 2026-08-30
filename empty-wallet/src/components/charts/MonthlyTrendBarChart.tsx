import React from 'react';
import { View, Text } from 'react-native';
import { formatCompactCurrency } from '../../services/currency';

export interface MonthlyTrendData {
  monthLabel: string;
  income: number;
  expense: number;
}

interface MonthlyTrendBarChartProps {
  data: MonthlyTrendData[];
  currency: string;
  height?: number;
}

export const MonthlyTrendBarChart: React.FC<MonthlyTrendBarChartProps> = ({
  data,
  currency,
  height = 150,
}) => {
  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.income, d.expense))
  );

  const gridLines = [maxVal, maxVal / 2, 0];

  return (
    <View className="w-full bg-background-card p-4 rounded-xl border border-background-border">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-content-primary font-bold text-sm">Monthly Cash Flow</Text>
        <View className="flex-row items-center space-x-3">
          <View className="flex-row items-center mr-3">
            <View className="w-2 h-2 rounded-sm bg-[#10B981] mr-1.5" />
            <Text className="text-content-tertiary text-xs">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-sm bg-[#EF4444] mr-1.5" />
            <Text className="text-content-tertiary text-xs">Expense</Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-end justify-between pt-2" style={{ height }}>
        {gridLines.map((val, i) => (
           <View key={i} className="absolute w-full border-t border-background-border" style={{ top: (i / 2) * (height - 30) }} />
        ))}
        {data.map((item, index) => {
          const incomeHeight = (item.income / maxVal) * (height - 40);
          const expenseHeight = (item.expense / maxVal) * (height - 40);

          return (
            <View key={`month-${index}`} className="flex-1 items-center px-1">
              <View className="items-center mb-1">
                 <Text className="text-[8px] text-content-tertiary">{formatCompactCurrency(item.income, currency)}</Text>
                 <Text className="text-[8px] text-content-tertiary">{formatCompactCurrency(item.expense, currency)}</Text>
              </View>
              <View className="flex-row items-end justify-center w-full" style={{ height: height - 40 }}>
                <View className="w-2.5 bg-[#10B981] rounded-t-sm mx-0.5" style={{ height: Math.max(2, incomeHeight) }} />
                <View className="w-2.5 bg-[#EF4444] rounded-t-sm mx-0.5" style={{ height: Math.max(2, expenseHeight) }} />
              </View>
              <Text className="text-content-tertiary text-[11px] font-medium mt-2">{item.monthLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

