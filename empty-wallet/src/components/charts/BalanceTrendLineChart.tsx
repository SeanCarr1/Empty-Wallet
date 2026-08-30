import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
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
  const [selectedPoint, setSelectedPoint] = useState<{ date: string; balance: number; x: number; y: number } | null>(null);

  const daysCount = timeframe === '7D' ? 7 : timeframe === '30D' ? 30 : timeframe === '90D' ? 90 : 365;
  const cutoffDate = subDays(new Date(), daysCount);

  const points = useMemo(() => {
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
    const historyPoints: { date: string; label: string; balance: number }[] = [];

    for (let i = 0; i <= daysCount; i += dayStep) {
      const d = subDays(new Date(), i);
      const dStr = format(d, 'yyyy-MM-dd');
      historyPoints.push({
        date: format(d, 'MMM dd, yyyy'),
        label: format(d, daysCount <= 7 ? 'EEE' : 'MMM d'),
        balance: runningBack,
      });

      const deltaOnDay = dateDeltas.get(dStr) || 0;
      runningBack -= deltaOnDay;
    }

    return historyPoints.reverse();
  }, [transactions, currentTotalBalance, timeframe]);

  const height = isSparkline ? 90 : 200;
  const screenWidth = Dimensions.get('window').width;
  const width = Math.min(screenWidth - 48, 400);

  const values = points.map((p) => p.balance);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = (maxVal - minVal) || 1;

  const svgPoints = points.map((p, index) => {
    const x = (index / (points.length - 1 || 1)) * width;
    const y = height - ((p.balance - minVal) / range) * (height - 60) - 40;
    return { x, y, label: p.label, balance: p.balance, date: p.date };
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
  const deltaPercent = startBalance !== 0 ? (netDelta / startBalance) * 100 : 0;

  const handlePointPress = (point: typeof svgPoints[0]) => {
    triggerHaptic.selection();
    setSelectedPoint(point);
  };

  if (isSparkline) {
    return (
      <View className="bg-[#17181C] p-4 rounded-xl border border-[#2A2D35] mb-4 w-full">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-[#A1A1AA] font-bold text-[10px] uppercase tracking-wider">30-Day Balance Trajectory</Text>
            <Text className={`text-[10px] font-bold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {isPositive ? '+' : ''}{deltaPercent.toFixed(1)}%
            </Text>
          </View>
          <Text className="text-[#E4E4E7] font-bold text-sm font-mono">{formatCurrency(currentTotalBalance, currency)}</Text>
        </View>

        <View className="relative h-[90px]">
          <Svg width={width} height={90}>
            <Defs>
              <LinearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                <Stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </LinearGradient>
            </Defs>
            <Path d={fillD} fill="url(#sparkGradient)" />
            <Path d={pathD} stroke="#10B981" strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <Circle cx={svgPoints[svgPoints.length - 1].x} cy={svgPoints[svgPoints.length - 1].y} r={4} fill="#10B981" />
          </Svg>
        </View>
        
        <View className="flex-row justify-between mt-2">
            <Text className="text-[#71717A] text-[9px]">30 days ago</Text>
            <Text className="text-[#71717A] text-[9px]">Today</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="w-full bg-[#0F1012] p-4 rounded-xl border border-[#212329] mb-4" onStartShouldSetResponder={() => true} onResponderRelease={() => setSelectedPoint(null)}>
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-[#A1A1AA] font-bold text-xs uppercase tracking-wider">Net Balance Progression</Text>
          <Text className={`text-xl font-bold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
             {isPositive ? '+' : ''}{formatCurrency(netDelta, currency)}
          </Text>
        </View>
        <View className="flex-row bg-[#17181C] p-0.5 rounded-lg border border-[#2A2D35]">
          {(['7D', '30D', '90D', 'ALL'] as const).map((tf) => (
            <TouchableOpacity key={tf} onPress={() => { triggerHaptic.selection(); setTimeframe(tf); }} className={`px-3 py-1.5 rounded-md ${timeframe === tf ? 'bg-[#2A2D35]' : ''}`}>
              <Text className={`text-xs font-bold ${timeframe === tf ? 'text-white' : 'text-[#71717A]'}`}>{tf}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="relative">
        {selectedPoint && (
          <View style={{ position: 'absolute', left: selectedPoint.x - 50, top: selectedPoint.y - 60, zIndex: 10 }} className="bg-[#212329] p-2 rounded-lg border border-[#2A2D35] shadow-lg">
            <Text className="text-[10px] text-[#A1A1AA]">{selectedPoint.date}</Text>
            <Text className="text-sm font-bold text-white">{formatCurrency(selectedPoint.balance, currency)}</Text>
          </View>
        )}

        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          {[0, 0.5, 1].map((pos, i) => (
             <Line key={i} x1="0" y1={(height - 40) * pos + 20} x2={width} y2={(height - 40) * pos + 20} stroke="#17181C" strokeDasharray="4 4" />
          ))}

          <Path d={fillD} fill="url(#balanceGradient)" />
          <Path d={pathD} stroke="#10B981" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {svgPoints.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={6} fill="transparent" onPress={() => handlePointPress(p)} />
          ))}

          {svgPoints.length > 0 && (
            <Circle
              cx={svgPoints[svgPoints.length - 1].x}
              cy={svgPoints[svgPoints.length - 1].y}
              r={5}
              fill="#10B981"
              stroke="#0F1012"
              strokeWidth={3}
            />
          )}
        </Svg>
      </View>

      <View className="flex-row justify-between mt-4 px-2">
        <Text className="text-[#71717A] text-[10px]">{points[0]?.label}</Text>
        <Text className="text-[#71717A] text-[10px]">{points[Math.floor(points.length / 2)]?.label}</Text>
        <Text className="text-[#71717A] text-[10px]">{points[points.length - 1]?.label}</Text>
      </View>
    </View>
  );
};

