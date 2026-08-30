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
  height = 160,
}) => {
  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.income, d.expense))
  );

  return (
    <View className="w-full bg-background-card p-5 rounded-3xl border border-background-border/70">
      {/* Header & Legend */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-content-primary font-bold text-base">Monthly Cash Flow</Text>
        <View className="flex-row items-center space-x-3">
          <View className="flex-row items-center mr-3">
            <View className="w-2.5 h-2.5 rounded-full bg-primary mr-1.5" />
            <Text className="text-content-tertiary text-xs">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-expense mr-1.5" />
            <Text className="text-content-tertiary text-xs">Expense</Text>
          </View>
        </View>
      </View>

      {/* Bar Chart Area */}
      <View className="flex-row items-end justify-between pt-2" style={{ height }}>
        {data.map((item, index) => {
          const incomeHeight = (item.income / maxVal) * (height - 30);
          const expenseHeight = (item.expense / maxVal) * (height - 30);

          return (
            <View key={`month-${index}`} className="flex-1 items-center px-1">
              <View className="flex-row items-end justify-center w-full" style={{ height: height - 30 }}>
                {/* Income Bar */}
                <View
                  className="w-2.5 bg-primary rounded-t-md mx-0.5"
                  style={{ height: Math.max(4, incomeHeight) }}
                />
                {/* Expense Bar */}
                <View
                  className="w-2.5 bg-expense rounded-t-md mx-0.5"
                  style={{ height: Math.max(4, expenseHeight) }}
                />
              </View>
              {/* Month Label */}
              <Text className="text-content-tertiary text-[11px] font-medium mt-2">
                {item.monthLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
