import React from 'react';
import { View, Text } from 'react-native';
import { SafeToSpendMetrics } from '../../types';
import { formatCurrency } from '../../services/currency';
import { Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react-native';

interface SafeToSpendGaugeProps {
  metrics: SafeToSpendMetrics;
  currency: string;
}

export const SafeToSpendGauge: React.FC<SafeToSpendGaugeProps> = ({ metrics, currency }) => {
  const isHealthy = metrics.velocityStatus === 'healthy';
  const isCaution = metrics.velocityStatus === 'caution';
  const isCritical = metrics.velocityStatus === 'critical';

  const statusBg = isHealthy
    ? 'bg-primary/10 border-primary/20'
    : isCaution
    ? 'bg-accent-amber/10 border-accent-amber/20'
    : 'bg-expense/10 border-expense/20';

  const statusText = isHealthy
    ? 'text-primary'
    : isCaution
    ? 'text-accent-amber'
    : 'text-expense';

  const StatusIcon = isHealthy ? ShieldCheck : isCaution ? Sparkles : AlertTriangle;
  const statusLabel = isHealthy
    ? 'On Track'
    : isCaution
    ? 'High Pace'
    : metrics.isOverBudget
    ? 'Over Budget'
    : 'Pace Warning';

  return (
    <View className="w-full bg-background-card rounded-xl p-4 border border-background-border">
      {/* Header Badge */}
      <View className="flex-row items-center justify-between mb-2.5">
        <Text className="text-content-tertiary font-bold text-[10px] tracking-wider uppercase">
          Safe-to-Spend Daily Pace
        </Text>
        <View className={`flex-row items-center px-2 py-0.5 rounded-md border ${statusBg}`}>
          <StatusIcon size={11} color={isHealthy ? '#10B981' : isCaution ? '#F59E0B' : '#EF4444'} />
          <Text className={`text-[11px] font-bold ml-1 ${statusText}`}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Main Daily Allowance Value */}
      <View className="my-0.5">
        <View className="flex-row items-baseline">
          <Text className="text-3xl font-black text-content-primary tracking-tight tabular-nums">
            {formatCurrency(metrics.dailyAllowance, currency)}
          </Text>
          <Text className="text-content-tertiary text-xs font-semibold ml-1.5">/ day</Text>
        </View>
        <Text className="text-content-secondary text-[11px] mt-0.5">
          {metrics.daysRemainingInCycle} days remaining in current billing cycle
        </Text>
      </View>

      {/* Visual Budget Progress Bar */}
      <View className="mt-3">
        <View className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden flex-row">
          <View
            className={`h-full rounded-full ${
              isHealthy ? 'bg-primary' : isCaution ? 'bg-accent-amber' : 'bg-expense'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, metrics.percentSpent))}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-1.5">
          <Text className="text-content-tertiary text-[10px] font-medium tabular-nums">
            Spent {formatCurrency(metrics.totalSpent, currency)} ({metrics.percentSpent.toFixed(0)}%)
          </Text>
          <Text className="text-content-tertiary text-[10px] font-medium tabular-nums">
            Cap {formatCurrency(metrics.totalBudget, currency)}
          </Text>
        </View>
      </View>

      {/* Bottom Mini Metrics Breakdown */}
      <View className="flex-row items-center justify-between pt-2.5 mt-2.5 border-t border-background-border">
        <View>
          <Text className="text-content-tertiary text-[9px] uppercase font-bold tracking-wider">Remaining</Text>
          <Text className={`text-xs font-bold mt-0.5 tabular-nums ${metrics.remainingBudget < 0 ? 'text-expense' : 'text-content-primary'}`}>
            {formatCurrency(metrics.remainingBudget, currency)}
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-content-tertiary text-[9px] uppercase font-bold tracking-wider">Projected Month End</Text>
          <Text className="text-xs font-bold text-content-primary mt-0.5 tabular-nums">
            {formatCurrency(metrics.projectedEndSpend, currency)}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-content-tertiary text-[9px] uppercase font-bold tracking-wider">Status</Text>
          <Text className={`text-xs font-bold mt-0.5 ${statusText}`}>
            {isHealthy ? 'Optimized' : isCaution ? 'Caution' : 'Critical'}
          </Text>
        </View>
      </View>
    </View>
  );
};
