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
import { WalletCard } from '../../src/components/wallets/WalletCard';
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
        className="flex-1 px-5 pt-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        {/* Top Header with App Logo */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/logo.jpg')}
              className="w-10 h-10 rounded-2xl mr-3 border border-background-border"
              resizeMode="cover"
            />
            <View>
              <Text className="text-content-secondary font-medium text-[11px] tracking-wider uppercase">
                Empty-Wallet Total Balance
              </Text>
              <Text className="text-2xl font-extrabold text-content-primary tracking-tight mt-0.5">
                {formatCurrency(totalBalance, currency)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.selection();
              router.push('/modal/manage-wallets');
            }}
            className="flex-row items-center bg-background-card border border-background-border px-3.5 py-2 rounded-2xl"
          >
            <ArrowRightLeft size={16} color="#10B981" />
            <Text className="text-content-primary font-semibold text-xs ml-2">Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Wallets Horizontal Carousel */}
        <View className="mb-5">
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-content-secondary font-semibold text-xs uppercase tracking-wider">
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-1">
            {wallets.map((w) => (
              <WalletCard key={w.id} wallet={w} />
            ))}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                router.push('/modal/manage-wallets');
              }}
              className="min-w-[130px] p-4 rounded-2xl border border-dashed border-background-border items-center justify-center bg-background-card/40"
            >
              <Plus size={20} color="#64748B" />
              <Text className="text-content-tertiary font-semibold text-xs mt-2">New Wallet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Safe-to-Spend Velocity Gauge */}
        <View className="mb-5">
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
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-content-secondary font-semibold text-xs uppercase tracking-wider">
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
            <View className="bg-background-card rounded-2xl p-8 items-center justify-center border border-background-border">
              <Sparkles size={32} color="#64748B" />
              <Text className="text-content-primary font-bold text-base mt-3">No Transactions Yet</Text>
              <Text className="text-content-secondary text-xs text-center mt-1 mb-4">
                Log your first expense or income to start tracking your wallet pace.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/modal/quick-add')}
                className="bg-primary px-5 py-2.5 rounded-xl"
              >
                <Text className="text-background font-bold text-xs">Add First Transaction</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={tx.categoryId ? categoryMap.get(tx.categoryId) : undefined}
                wallet={walletMap.get(tx.walletId)}
                currency={currency}
                onDelete={deleteTransaction}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
