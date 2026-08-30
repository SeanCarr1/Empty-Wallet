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
    ? 'bg-primary/10 border-primary/25'
    : isCaution
    ? 'bg-accent-amber/10 border-accent-amber/25'
    : 'bg-expense/10 border-expense/25';

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
    <View className="w-full bg-background-card rounded-3xl p-5 border border-background-border shadow-sm">
      {/* Header Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-content-tertiary font-semibold text-xs tracking-wider uppercase">
          Safe-to-Spend Daily Pace
        </Text>
        <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${statusBg}`}>
          <StatusIcon size={12} color={isHealthy ? '#2A9D60' : isCaution ? '#D97706' : '#DC4C38'} />
          <Text className={`text-xs font-bold ml-1.5 ${statusText}`}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Main Daily Allowance Value */}
      <View className="my-1">
        <View className="flex-row items-baseline">
          <Text className="text-4xl font-extrabold text-content-primary tracking-tight">
            {formatCurrency(metrics.dailyAllowance, currency)}
          </Text>
          <Text className="text-content-tertiary text-xs font-semibold ml-2">/ day</Text>
        </View>
        <Text className="text-content-secondary text-xs mt-1">
          {metrics.daysRemainingInCycle} days remaining in current billing cycle
        </Text>
      </View>

      {/* Visual Budget Progress Bar */}
      <View className="mt-4">
        <View className="h-2 w-full bg-background-elevated rounded-full overflow-hidden flex-row">
          <View
            className={`h-full rounded-full ${
              isHealthy ? 'bg-primary' : isCaution ? 'bg-accent-amber' : 'bg-expense'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, metrics.percentSpent))}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="text-content-tertiary text-[11px] font-medium">
            Spent {formatCurrency(metrics.totalSpent, currency)} ({metrics.percentSpent.toFixed(0)}%)
          </Text>
          <Text className="text-content-tertiary text-[11px] font-medium">
            Cap {formatCurrency(metrics.totalBudget, currency)}
          </Text>
        </View>
      </View>

      {/* Bottom Mini Metrics Breakdown */}
      <View className="flex-row items-center justify-between pt-3 mt-3 border-t border-background-border/50">
        <View>
          <Text className="text-content-tertiary text-[10px] uppercase font-bold tracking-wider">Remaining</Text>
          <Text className={`text-sm font-bold mt-0.5 ${metrics.remainingBudget < 0 ? 'text-expense' : 'text-content-primary'}`}>
            {formatCurrency(metrics.remainingBudget, currency)}
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-content-tertiary text-[10px] uppercase font-bold tracking-wider">Projected Month End</Text>
          <Text className="text-sm font-bold text-content-primary mt-0.5">
            {formatCurrency(metrics.projectedEndSpend, currency)}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-content-tertiary text-[10px] uppercase font-bold tracking-wider">Status</Text>
          <Text className={`text-sm font-bold mt-0.5 ${statusText}`}>
            {isHealthy ? 'Optimized' : isCaution ? 'Caution' : 'Critical'}
          </Text>
        </View>
      </View>
    </View>
  );
};
