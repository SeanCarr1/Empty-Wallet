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

  return (
    <View className="w-full bg-background-card p-4 rounded-xl border border-background-border">
      {/* Header & Legend */}
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
                  className="w-2.5 bg-[#10B981] rounded-t-sm mx-0.5"
                  style={{ height: Math.max(4, incomeHeight) }}
                />
                {/* Expense Bar */}
                <View
                  className="w-2.5 bg-[#EF4444] rounded-t-sm mx-0.5"
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

