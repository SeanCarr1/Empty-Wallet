import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import { Transaction } from '../../types';
import { formatCurrency } from '../../services/currency';
import { triggerHaptic } from '../../services/haptics';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { subDays, parseISO, isAfter, format } from 'date-fns';

type Timeframe = '7D' | '30D' | '90D' | 'ALL';

interface BalanceTrendLineChartProps {
  transactions: Transaction[];
  currentTotalBalance: number;
  currency: string;
  isSparkline?: boolean;
}

export const BalanceTrendLineChart: React.FC<BalanceTrendLineChartProps> = ({
  transactions,
  currentTotalBalance,
  currency,
  isSparkline = false,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('30D');

  const daysCount = timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : timeframe === '90D' ? 90 : 365;
  const cutoffDate = subDays(new Date(), daysCount);

  // Compute daily balance trend points
  const points = useMemo(() => {
    const sorted = [...transactions]
      .filter((t) => timeframe === 'ALL' || isAfter(parseISO(t.transactionDate), cutoffDate))
      .sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());

    const allSortedDesc = [...transactions].sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );

    const dateDeltas = new Map<string, number>();
    for (const t of allSortedDesc) {
      const delta = t.type === 'income' ? t.amount : t.type === 'expense' ? -t.amount : 0;
      dateDeltas.set(t.transactionDate, (dateDeltas.get(t.transactionDate) || 0) + delta);
    }

    const intervals = Math.min(daysCount, 15);
    const dayStep = Math.max(1, Math.floor(daysCount / intervals));

    let runningBack = currentTotalBalance;
    const historyPoints: { label: string; balance: number }[] = [];

    for (let i = 0; i <= daysCount; i += dayStep) {
      const d = subDays(new Date(), i);
      const dStr = format(d, 'yyyy-MM-dd');
      historyPoints.push({
        label: format(d, daysCount <= 7 ? 'EEE' : 'MMM d'),
        balance: runningBack,
      });

      const deltaOnDay = dateDeltas.get(dStr) || 0;
      runningBack -= deltaOnDay;
    }

    return historyPoints.reverse();
  }, [transactions, currentTotalBalance, timeframe]);

  const height = isSparkline ? 90 : 160;
  const width = Dimensions.get('window').width - (isSparkline ? 60 : 64);

  const values = points.map((p) => p.balance);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const svgPoints = points.map((p, index) => {
    const x = (index / (points.length - 1 || 1)) * width;
    const y = height - ((p.balance - minVal) / range) * (height - 30) - 15;
    return { x, y, label: p.label, balance: p.balance };
  });

  let pathD = '';
  if (svgPoints.length > 0) {
    pathD = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 0; i < svgPoints.length - 1; i++) {
      const current = svgPoints[i];
      const next = svgPoints[i + 1];
      const controlX = (current.x + next.x) / 2;
      pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
  }

  const fillD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const startBalance = points[0]?.balance || currentTotalBalance;
  const netDelta = currentTotalBalance - startBalance;
  const isPositive = netDelta >= 0;

  if (isSparkline) {
    return (
      <View className="bg-background-card p-4 rounded-3xl border border-background-border mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider">30-Day Balance Trajectory</Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-content-primary font-bold text-lg">
                {formatCurrency(currentTotalBalance, currency)}
              </Text>
              <View className="flex-row items-center ml-2">
                {isPositive ? <TrendingUp size={13} color="#2A9D60" /> : <TrendingDown size={13} color="#DC4C38" />}
                <Text className={`text-xs font-bold ml-1 ${isPositive ? 'text-primary' : 'text-expense'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(netDelta, currency)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#2A9D60" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#2A9D60" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>
          <Path d={fillD} fill="url(#sparkGradient)" />
          <Path d={pathD} stroke="#2A9D60" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </Svg>
      </View>
    );
  }

  return (
    <View className="w-full bg-background-card p-5 rounded-3xl border border-background-border mb-5">
      {/* Header & Timeframe Switcher */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-content-primary font-bold text-base">Net Balance Progression</Text>
          <View className="flex-row items-center mt-0.5">
            {isPositive ? <TrendingUp size={13} color="#2A9D60" /> : <TrendingDown size={13} color="#DC4C38" />}
            <Text className={`text-xs font-bold ml-1 ${isPositive ? 'text-primary' : 'text-expense'}`}>
              {isPositive ? '+' : ''}{formatCurrency(netDelta, currency)} ({timeframe})
            </Text>
          </View>
        </View>

        {/* Timeframe Chips */}
        <View className="flex-row bg-background-elevated p-1 rounded-xl border border-background-border">
          {(['7D', '30D', '90D', 'ALL'] as const).map((tf) => (
            <TouchableOpacity
              key={tf}
              onPress={() => {
                triggerHaptic.selection();
                setTimeframe(tf);
              }}
              className={`px-2.5 py-1 rounded-lg ${
                timeframe === tf ? 'bg-primary' : ''
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  timeframe === tf ? 'text-content-primary' : 'text-content-secondary'
                }`}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SVG Interactive Line Chart */}
      <View className="my-2">
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#2A9D60" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#2A9D60" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line x1="0" y1={height - 20} x2={width} y2={height - 20} stroke="#3B3632" strokeDasharray="3 3" />
          <Line x1="0" y1={20} x2={width} y2={20} stroke="#3B3632" strokeDasharray="3 3" />

          {/* Area Fill & Line */}
          <Path d={fillD} fill="url(#balanceGradient)" />
          <Path d={pathD} stroke="#2A9D60" strokeWidth={2.8} fill="none" strokeLinecap="round" />

          {/* End Dot */}
          {svgPoints.length > 0 && (
            <Circle
              cx={svgPoints[svgPoints.length - 1].x}
              cy={svgPoints[svgPoints.length - 1].y}
              r={4.5}
              fill="#2A9D60"
              stroke="#1D1B19"
              strokeWidth={2}
            />
          )}
        </Svg>

        {/* X-Axis Date Labels */}
        <View className="flex-row justify-between mt-2 px-1">
          <Text className="text-content-tertiary text-[10px]">{points[0]?.label}</Text>
          <Text className="text-content-tertiary text-[10px]">{points[Math.floor(points.length / 2)]?.label}</Text>
          <Text className="text-content-tertiary text-[10px]">{points[points.length - 1]?.label}</Text>
        </View>
      </View>
    </View>
  );
};
