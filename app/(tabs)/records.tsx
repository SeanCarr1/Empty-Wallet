import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { Transaction, TransactionType, PaymentType } from '../../src/types';
import { formatCurrency } from '../../src/services/currency';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { Icon } from '../../src/components/ui/Icon';
import { triggerHaptic } from '../../src/services/haptics';
import { Search, SlidersHorizontal, ArrowUpDown, X, Check, Filter, Sparkles, Plus, CreditCard, Banknote, Landmark, Globe } from 'lucide-react-native';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function RecordsScreen() {
  const router = useRouter();
  const { transactions, deleteTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { wallets } = useWalletStore();
  const currency = useSettingsStore((s) => s.currency);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | 'all'>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Modal State
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map((w) => [w.id, w])), [wallets]);

  const PAYMENT_TYPE_LABELS: Record<PaymentType, { label: string; icon: string }> = {
    cash: { label: 'Cash', icon: 'Banknote' },
    debit_card: { label: 'Debit Card', icon: 'CreditCard' },
    credit_card: { label: 'Credit Card', icon: 'CreditCard' },
    transfer: { label: 'Bank Transfer', icon: 'Landmark' },
    web_payment: { label: 'Web Payment', icon: 'Globe' },
  };

  // Filtered and Sorted Transactions
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((tx) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const payeeMatch = tx.payee.toLowerCase().includes(query);
        const payerMatch = tx.payer?.toLowerCase().includes(query);
        const noteMatch = tx.note?.toLowerCase().includes(query);
        const cat = tx.categoryId ? categoryMap.get(tx.categoryId)?.name.toLowerCase() : '';
        const catMatch = cat?.includes(query);

        if (!payeeMatch && !payerMatch && !noteMatch && !catMatch) return false;
      }

      // 2. Record Type
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // 3. Category Filter
      if (selectedCategories.length > 0) {
        if (!tx.categoryId || !selectedCategories.includes(tx.categoryId)) return false;
      }

      // 4. Payment Type Filter
      if (selectedPaymentType !== 'all' && tx.paymentType !== selectedPaymentType) return false;

      // 5. Amount Range
      const min = parseFloat(minAmount);
      const max = parseFloat(maxAmount);
      if (!isNaN(min) && tx.amount < min) return false;
      if (!isNaN(max) && tx.amount > max) return false;

      return true;
    });

    // Sort Result
    result.sort((a, b) => {
      if (sortOption === 'newest') {
        const timeA = `${a.transactionDate}T${a.transactionTime || '00:00'}`;
        const timeB = `${b.transactionDate}T${b.transactionTime || '00:00'}`;
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      }
      if (sortOption === 'oldest') {
        const timeA = `${a.transactionDate}T${a.transactionTime || '00:00'}`;
        const timeB = `${b.transactionDate}T${b.transactionTime || '00:00'}`;
        return new Date(timeA).getTime() - new Date(timeB).getTime();
      }
      if (sortOption === 'highest') return b.amount - a.amount;
      if (sortOption === 'lowest') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [
    transactions,
    searchQuery,
    selectedType,
    selectedCategories,
    selectedPaymentType,
    minAmount,
    maxAmount,
    sortOption,
    categoryMap,
  ]);

  // Aggregate sums
  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const activeFilterCount =
    (selectedType !== 'all' ? 1 : 0) +
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedPaymentType !== 'all' ? 1 : 0) +
    (minAmount || maxAmount ? 1 : 0);

  const handleClearFilters = () => {
    triggerHaptic.light();
    setSelectedType('all');
    setSelectedCategories([]);
    setSelectedPaymentType('all');
    setMinAmount('');
    setMaxAmount('');
    setSearchQuery('');
  };

  const toggleCategory = (catId: string) => {
    triggerHaptic.selection();
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-5 pt-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-2xl font-bold text-content-primary">Records Ledger</Text>
            <Text className="text-content-secondary text-xs mt-0.5">
              {filteredTransactions.length} transactions found
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.medium();
              router.push('/modal/quick-add');
            }}
            className="w-10 h-10 rounded-2xl bg-primary items-center justify-center shadow-md shadow-primary/20"
          >
            <Plus size={22} color="#090A0F" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Search Bar & Filter Button */}
        <View className="flex-row items-center space-x-2 mb-3">
          <View className="flex-1 flex-row items-center bg-background-card border border-background-border rounded-2xl px-3.5 py-2.5 mr-2">
            <Search size={16} color="#64748B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search payee, note, category..."
              placeholderTextColor="#64748B"
              className="flex-1 ml-2 text-content-primary text-xs font-medium"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.selection();
              setFilterModalOpen(true);
            }}
            className={`flex-row items-center px-3.5 py-2.5 rounded-2xl border ${
              activeFilterCount > 0
                ? 'bg-primary/20 border-primary'
                : 'bg-background-card border-background-border'
            }`}
          >
            <SlidersHorizontal size={16} color={activeFilterCount > 0 ? '#10B981' : '#94A3B8'} />
            {activeFilterCount > 0 && (
              <View className="w-4 h-4 rounded-full bg-primary items-center justify-center ml-1.5">
                <Text className="text-[10px] font-bold text-background">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Summary Pill Bar */}
        <View className="flex-row items-center justify-between bg-background-card p-3 rounded-2xl border border-background-border mb-3">
          <View className="flex-row items-center">
            <Text className="text-content-tertiary text-xs font-semibold">In: </Text>
            <Text className="text-primary text-xs font-bold mr-3">
              +{formatCurrency(totalFilteredIncome, currency)}
            </Text>
            <Text className="text-content-tertiary text-xs font-semibold">Out: </Text>
            <Text className="text-expense text-xs font-bold">
              -{formatCurrency(totalFilteredExpense, currency)}
            </Text>
          </View>

          {activeFilterCount > 0 && (
            <TouchableOpacity onPress={handleClearFilters}>
              <Text className="text-primary text-xs font-semibold">Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Records List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {filteredTransactions.length === 0 ? (
            <View className="bg-background-card rounded-3xl p-8 items-center justify-center border border-background-border my-6">
              <Sparkles size={36} color="#64748B" />
              <Text className="text-content-primary font-bold text-base mt-3">No Records Found</Text>
              <Text className="text-content-secondary text-xs text-center mt-1 mb-4">
                Try adjusting your search keywords or filter criteria.
              </Text>
              <TouchableOpacity
                onPress={handleClearFilters}
                className="bg-background-elevated px-4 py-2 rounded-xl border border-background-border"
              >
                <Text className="text-primary font-bold text-xs">Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTransactions.map((tx) => (
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
        </ScrollView>

        {/* FILTER & SORT MODAL */}
        <Modal visible={filterModalOpen} animationType="slide" transparent>
          <View className="flex-1 bg-black/70 justify-end">
            <View className="bg-background-card rounded-t-3xl p-6 border-t border-background-border max-h-[85%]">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-content-primary">Filter & Sort Records</Text>
                <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
                  <X size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. Sort Order */}
                <Text className="text-content-secondary text-xs font-semibold uppercase mb-2">Sort By</Text>
                <View className="flex-row flex-wrap mb-4">
                  {[
                    { id: 'newest', label: 'Newest Time' },
                    { id: 'oldest', label: 'Oldest Time' },
                    { id: 'highest', label: 'Highest Amount' },
                    { id: 'lowest', label: 'Lowest Amount' },
                  ].map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSortOption(s.id as SortOption)}
                      className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                        sortOption === s.id
                          ? 'bg-primary/20 border-primary'
                          : 'bg-background-elevated border-background-border'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          sortOption === s.id ? 'text-primary' : 'text-content-primary'
                        }`}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 2. Record Type */}
                <Text className="text-content-secondary text-xs font-semibold uppercase mb-2">Record Type</Text>
                <View className="flex-row mb-4">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'expense', label: 'Expense' },
                    { id: 'income', label: 'Income' },
                    { id: 'transfer', label: 'Transfer' },
                  ].map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setSelectedType(t.id as any)}
                      className={`flex-1 py-2 rounded-xl mr-1.5 items-center border ${
                        selectedType === t.id
                          ? 'bg-primary/20 border-primary'
                          : 'bg-background-elevated border-background-border'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          selectedType === t.id ? 'text-primary' : 'text-content-secondary'
                        }`}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 3. Payment Method */}
                <Text className="text-content-secondary text-xs font-semibold uppercase mb-2">Payment Method</Text>
                <View className="flex-row flex-wrap mb-4">
                  <TouchableOpacity
                    onPress={() => setSelectedPaymentType('all')}
                    className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                      selectedPaymentType === 'all'
                        ? 'bg-primary/20 border-primary'
                        : 'bg-background-elevated border-background-border'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${selectedPaymentType === 'all' ? 'text-primary' : 'text-content-primary'}`}>
                      All Methods
                    </Text>
                  </TouchableOpacity>
                  {(Object.keys(PAYMENT_TYPE_LABELS) as PaymentType[]).map((pt) => {
                    const item = PAYMENT_TYPE_LABELS[pt];
                    const isSelected = selectedPaymentType === pt;
                    return (
                      <TouchableOpacity
                        key={pt}
                        onPress={() => setSelectedPaymentType(pt)}
                        className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                          isSelected
                            ? 'bg-primary/20 border-primary'
                            : 'bg-background-elevated border-background-border'
                        }`}
                      >
                        <Text className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-content-primary'}`}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 4. Category Filter Chips */}
                <Text className="text-content-secondary text-xs font-semibold uppercase mb-2">Categories</Text>
                <View className="flex-row flex-wrap mb-4">
                  {categories.map((c) => {
                    const isSelected = selectedCategories.includes(c.id);
                    return (
                      <TouchableOpacity
                        key={c.id}
                        onPress={() => toggleCategory(c.id)}
                        className={`flex-row items-center px-2.5 py-1.5 rounded-xl mr-2 mb-2 border ${
                          isSelected
                            ? 'bg-primary/20 border-primary'
                            : 'bg-background-elevated border-background-border'
                        }`}
                      >
                        <Icon name={c.icon} size={14} color={isSelected ? '#10B981' : c.color} />
                        <Text
                          className={`text-xs font-semibold ml-1.5 ${
                            isSelected ? 'text-primary' : 'text-content-primary'
                          }`}
                        >
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 5. Amount Range */}
                <Text className="text-content-secondary text-xs font-semibold uppercase mb-2">Amount Range ({currency})</Text>
                <View className="flex-row space-x-2 mb-6">
                  <TextInput
                    value={minAmount}
                    onChangeText={setMinAmount}
                    keyboardType="numeric"
                    placeholder="Min ₱"
                    placeholderTextColor="#64748B"
                    className="flex-1 bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-xs font-semibold mr-2"
                  />
                  <TextInput
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    keyboardType="numeric"
                    placeholder="Max ₱"
                    placeholderTextColor="#64748B"
                    className="flex-1 bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-xs font-semibold"
                  />
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View className="flex-row space-x-3 pt-3 border-t border-background-border/50">
                <TouchableOpacity
                  onPress={handleClearFilters}
                  className="flex-1 bg-background-elevated py-3.5 rounded-xl items-center mr-2"
                >
                  <Text className="text-content-secondary font-semibold text-xs">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic.success();
                    setFilterModalOpen(false);
                  }}
                  className="flex-1 bg-primary py-3.5 rounded-xl items-center"
                >
                  <Text className="text-background font-bold text-xs">Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
