import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useBudgetStore } from '../../src/stores/useBudgetStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { calculateSafeToSpend } from '../../src/services/budgetEngine';
import { formatCurrency } from '../../src/services/currency';
import { WalletGrid } from '../../src/components/wallets/WalletGrid';
import { SafeToSpendGauge } from '../../src/components/velocity/SafeToSpendGauge';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { BalanceTrendLineChart } from '../../src/components/charts/BalanceTrendLineChart';
import { Plus, ArrowRightLeft, Sparkles } from 'lucide-react-native';
import { triggerHaptic } from '../../src/services/haptics';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const { wallets, fetchWallets, getTotalBalance } = useWalletStore();
  const { transactions, fetchTransactions, deleteTransaction } = useTransactionStore();
  const { budgets, fetchBudgets } = useBudgetStore();
  const { categories, fetchCategories } = useCategoryStore();
  const currency = useSettingsStore((s) => s.currency);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchWallets();
    fetchTransactions();
    fetchBudgets();
    fetchCategories();
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const totalBalance = getTotalBalance();
  const safeToSpendMetrics = calculateSafeToSpend(transactions, budgets);
  const recentTransactions = transactions.slice(0, 6);

  const categoryMap = React.useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const walletMap = React.useMemo(() => {
    return new Map(wallets.map((w) => [w.id, w]));
  }, [wallets]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1 px-4 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {/* Top Header with App Logo, Net Balance & Quick Actions */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/logo.jpg')}
              className="w-9 h-9 rounded-lg mr-3 border border-background-border"
              resizeMode="cover"
            />
            <View>
              <Text className="text-content-tertiary font-bold text-[10px] tracking-wider uppercase">
                Net Balance
              </Text>
              <Text className="text-2xl font-extrabold text-content-primary tracking-tight font-mono">
                {formatCurrency(totalBalance, currency)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                router.push('/modal/manage-wallets?tab=transfer');
              }}
              className="flex-row items-center bg-background-card border border-background-border px-2.5 py-1.5 rounded-lg mr-1.5"
            >
              <ArrowRightLeft size={14} color="#10B981" />
              <Text className="text-content-primary font-semibold text-xs ml-1.5">Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.medium();
                router.push('/modal/quick-add');
              }}
              className="flex-row items-center bg-primary px-3 py-1.5 rounded-lg active:opacity-80"
            >
              <Plus size={15} color="#0F1012" strokeWidth={2.8} />
              <Text className="text-[#0F1012] font-bold text-xs ml-1">Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wallets Horizontal Strip */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider">
              Wallets & Accounts
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.selection();
                router.push('/modal/manage-wallets');
              }}
            >
              <Text className="text-primary text-xs font-semibold">Manage</Text>
            </TouchableOpacity>
          </View>

          <WalletGrid />
        </View>

        {/* Safe-to-Spend Velocity Gauge */}
        <View className="mb-4">
          <SafeToSpendGauge metrics={safeToSpendMetrics} currency={currency} />
        </View>

        {/* Balance Trend Sparkline Graph */}
        <View className="mb-2">
          <BalanceTrendLineChart
            transactions={transactions}
            currentTotalBalance={totalBalance}
            currency={currency}
            isSparkline={true}
          />
        </View>

        {/* Recent Transactions Section */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider">
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.selection();
                router.push('/records');
              }}
            >
              <Text className="text-primary text-xs font-semibold">View All Records</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View className="bg-background-card rounded-xl p-6 items-center justify-center border border-background-border">
              <Sparkles size={28} color="#6B7280" />
              <Text className="text-content-primary font-bold text-sm mt-2.5">No Transactions Yet</Text>
              <Text className="text-content-secondary text-xs text-center mt-1 mb-3.5">
                Log your first expense or income to start tracking your wallet pace.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/modal/quick-add')}
                className="bg-primary px-4 py-2 rounded-lg"
              >
                <Text className="text-[#0F1012] font-bold text-xs">Add First Transaction</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <TouchableOpacity
                key={tx.id}
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: '/modal/quick-add', params: { id: tx.id } })}
              >
                <TransactionItem
                  transaction={tx}
                  category={tx.categoryId ? categoryMap.get(tx.categoryId) : undefined}
                  wallet={walletMap.get(tx.walletId)}
                  currency={currency}
                  onDelete={deleteTransaction}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
