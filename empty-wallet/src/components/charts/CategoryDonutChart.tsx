import React from 'react';
import { View, Text } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { formatCurrency, formatCompactCurrency } from '../../services/currency';
import { Category } from '../../types';

export interface CategorySpendItem {
  category: Category;
  amount: number;
  percentage: number;
}

interface CategoryDonutChartProps {
  data: CategorySpendItem[];
  totalSpent: number;
  currency: string;
  size?: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  totalSpent,
  currency,
  size = 200,
}) => {
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // If no spending data, show empty state ring
  if (data.length === 0 || totalSpent === 0) {
    return (
      <View className="items-center justify-center my-3">
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#212329"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
        </Svg>
        <View className="absolute items-center">
          <Text className="text-content-tertiary text-xs font-medium">No Expenses</Text>
          <Text className="text-content-primary font-bold text-lg">{formatCurrency(0, currency)}</Text>
        </View>
      </View>
    );
  }

  // Calculate SVG arc paths for each slice
  let startAngle = -90; // Start at 12 o'clock

  const slices = data.map((item) => {
    const angle = (item.percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    // Single item takes full 360
    const pathData =
      angle >= 359.9
        ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 0 ${center} ${center + radius} A ${radius} ${radius} 0 1 0 ${center} ${center - radius}`
        : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

    startAngle = endAngle;

    return {
      path: pathData,
      color: item.category.color,
      category: item.category,
      percentage: item.percentage,
      amount: item.amount,
    };
  });

  return (
    <View className="items-center justify-center my-3">
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, index) => (
            <Path
              key={`slice-${index}`}
              d={slice.path}
              stroke={slice.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </G>
      </Svg>

      <View className="absolute items-center">
        <Text className="text-content-tertiary text-[11px] font-semibold uppercase tracking-wider">
          Total Spent
        </Text>
        <Text className="text-content-primary font-bold text-xl mt-0.5">
          {formatCompactCurrency(totalSpent, currency)}
        </Text>
      </View>
    </View>
  );
};

export const CategoryLegend: React.FC<{ data: CategorySpendItem[], currency: string }> = ({ data, currency }) => (
  <View className="mt-4 w-full px-4">
    {data.map((item, index) => (
      <View key={index} className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.category.color }} />
          <Text className="text-content-primary font-medium text-sm">{item.category.name}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-content-secondary font-bold text-sm mr-3">{item.percentage.toFixed(1)}%</Text>
          <Text className="text-content-primary font-bold text-sm">{formatCurrency(item.amount, currency)}</Text>
        </View>
      </View>
    ))}
  </View>
);

