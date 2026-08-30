import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { TransactionType, PaymentType } from '../../src/types';
import { formatCurrency } from '../../src/services/currency';
import { TransactionItem } from '../../src/components/transactions/TransactionItem';
import { Icon } from '../../src/components/ui/Icon';
import { triggerHaptic } from '../../src/services/haptics';
import { MACRO_CATEGORY_GROUPS } from '../../src/constants/categories';
import { Search, SlidersHorizontal, X, Sparkles, Plus } from 'lucide-react-native';

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

  const groupedCategories = useMemo(() => {
    const groups: { group: (typeof MACRO_CATEGORY_GROUPS)[number]; items: typeof categories }[] = [];
    for (const macroGroup of MACRO_CATEGORY_GROUPS) {
      if (selectedType !== 'all' && macroGroup.type !== 'both' && macroGroup.type !== selectedType) {
        continue;
      }
      const items = categories.filter(
        (c) =>
          (c.group || (c.type === 'income' ? 'income' : 'others')) === macroGroup.id &&
          (selectedType === 'all' || c.type === selectedType)
      );
      if (items.length > 0) {
        groups.push({ group: macroGroup, items });
      }
    }
    return groups;
  }, [categories, selectedType]);

  const toggleGroup = (groupCatIds: string[]) => {
    triggerHaptic.selection();
    const allSelected = groupCatIds.every((id) => selectedCategories.includes(id));
    if (allSelected) {
      setSelectedCategories((prev) => prev.filter((id) => !groupCatIds.includes(id)));
    } else {
      setSelectedCategories((prev) => Array.from(new Set([...prev, ...groupCatIds])));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold text-content-primary">Ledger Records</Text>
            <Text className="text-content-secondary text-xs mt-0.5">
              {filteredTransactions.length} entries indexed
            </Text>
          </View>

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

        {/* Search Bar & Filter Button */}
        <View className="flex-row items-center space-x-2 mb-3">
          <View className="flex-1 flex-row items-center bg-background-card border border-background-border rounded-lg px-3 py-2 mr-2">
            <Search size={15} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search payee, note, category..."
              placeholderTextColor="#6B7280"
              className="flex-1 ml-2 text-content-primary text-xs font-medium"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={15} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.selection();
              setFilterModalOpen(true);
            }}
            className={`flex-row items-center px-3 py-2 rounded-lg border ${
              activeFilterCount > 0
                ? 'bg-primary/15 border-primary'
                : 'bg-background-card border-background-border'
            }`}
          >
            <SlidersHorizontal size={15} color={activeFilterCount > 0 ? '#10B981' : '#9CA3AF'} />
            {activeFilterCount > 0 && (
              <View className="w-4 h-4 rounded-full bg-primary items-center justify-center ml-1.5">
                <Text className="text-[9px] font-bold text-[#0F1012]">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Summary Pill Bar */}
        <View className="flex-row items-center justify-between bg-background-card px-3.5 py-2.5 rounded-xl border border-background-border mb-3">
          <View className="flex-row items-center">
            <Text className="text-content-tertiary text-xs font-medium">In: </Text>
            <Text className="text-primary text-xs font-bold mr-3 font-mono">
              +{formatCurrency(totalFilteredIncome, currency)}
            </Text>
            <Text className="text-content-tertiary text-xs font-medium">Out: </Text>
            <Text className="text-expense text-xs font-bold font-mono">
              -{formatCurrency(totalFilteredExpense, currency)}
            </Text>
          </View>

          {activeFilterCount > 0 && (
            <TouchableOpacity onPress={handleClearFilters}>
              <Text className="text-primary text-xs font-semibold">Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Records List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredTransactions.length === 0 ? (
            <View className="bg-background-card rounded-xl p-6 items-center justify-center border border-background-border my-4">
              <Sparkles size={32} color="#6B7280" />
              <Text className="text-content-primary font-bold text-sm mt-2.5">No Records Found</Text>
              <Text className="text-content-secondary text-xs text-center mt-1 mb-3.5">
                Try adjusting your search keywords or filter criteria.
              </Text>
              <TouchableOpacity
                onPress={handleClearFilters}
                className="bg-background-elevated px-3.5 py-1.5 rounded-lg border border-background-border"
              >
                <Text className="text-primary font-semibold text-xs">Clear All Filters</Text>
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
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-background-card rounded-t-xl p-5 border-t border-background-border max-h-[85%]">
              <View className="flex-row items-center justify-between mb-3.5">
                <Text className="text-lg font-bold text-content-primary">Filter & Sort Records</Text>
                <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 1. Sort Order */}
                <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2">Sort By</Text>
                <View className="flex-row flex-wrap mb-3.5">
                  {[
                    { id: 'newest', label: 'Newest Time' },
                    { id: 'oldest', label: 'Oldest Time' },
                    { id: 'highest', label: 'Highest Amount' },
                    { id: 'lowest', label: 'Lowest Amount' },
                  ].map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSortOption(s.id as SortOption)}
                      className={`px-3 py-1.5 rounded-lg mr-2 mb-2 border ${
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
                <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2">Record Type</Text>
                <View className="flex-row mb-3.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'expense', label: 'Expense' },
                    { id: 'income', label: 'Income' },
                    { id: 'transfer', label: 'Transfer' },
                  ].map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setSelectedType(t.id as any)}
                      className={`flex-1 py-2 rounded-lg mr-1.5 items-center border ${
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
                <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2">Payment Method</Text>
                <View className="flex-row flex-wrap mb-3.5">
                  <TouchableOpacity
                    onPress={() => setSelectedPaymentType('all')}
                    className={`px-3 py-1.5 rounded-lg mr-2 mb-2 border ${
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
                        className={`px-3 py-1.5 rounded-lg mr-2 mb-2 border ${
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

                {/* 4. Category Filter Chips Organized by Macro Groups */}
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider">
                    Categories ({selectedCategories.length} selected)
                  </Text>
                  {selectedCategories.length > 0 && (
                    <TouchableOpacity onPress={() => setSelectedCategories([])}>
                      <Text className="text-primary text-[11px] font-semibold">Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="mb-3.5">
                  {groupedCategories.map(({ group, items }) => {
                    const groupCatIds = items.map((i) => i.id);
                    const selectedInGroupCount = items.filter((i) =>
                      selectedCategories.includes(i.id)
                    ).length;
                    const allGroupSelected =
                      items.length > 0 && selectedInGroupCount === items.length;

                    return (
                      <View key={group.id} className="mb-3 bg-background-elevated/40 p-2.5 rounded-xl border border-background-border/60">
                        {/* Group Header */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => toggleGroup(groupCatIds)}
                          className="flex-row items-center justify-between mb-2 pb-1.5 border-b border-background-border/40"
                        >
                          <View className="flex-row items-center">
                            <View
                              className="w-5 h-5 rounded-md items-center justify-center mr-1.5"
                              style={{ backgroundColor: `${group.color}20` }}
                            >
                              <Icon name={group.icon} size={12} color={group.color} />
                            </View>
                            <Text className="text-xs font-bold text-content-secondary">
                              {group.name}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Text className="text-[10px] text-content-tertiary font-mono mr-1.5">
                              {selectedInGroupCount > 0
                                ? `${selectedInGroupCount}/${items.length}`
                                : `${items.length}`}
                            </Text>
                            <Text
                              className={`text-[10px] font-bold ${
                                allGroupSelected ? 'text-primary' : 'text-content-tertiary'
                              }`}
                            >
                              {allGroupSelected ? 'All' : 'Select'}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Category Chips */}
                        <View className="flex-row flex-wrap">
                          {items.map((c) => {
                            const isSelected = selectedCategories.includes(c.id);
                            return (
                              <TouchableOpacity
                                key={c.id}
                                onPress={() => toggleCategory(c.id)}
                                className={`flex-row items-center px-2.5 py-1.5 rounded-lg mr-1.5 mb-1.5 border ${
                                  isSelected
                                    ? 'bg-primary/20 border-primary'
                                    : 'bg-background-elevated border-background-border'
                                }`}
                              >
                                <Icon
                                  name={c.icon}
                                  size={12}
                                  color={isSelected ? '#10B981' : c.color}
                                />
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
                      </View>
                    );
                  })}
                </View>

                {/* 5. Amount Range */}
                <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2">Amount Range ({currency})</Text>
                <View className="flex-row space-x-2 mb-5">
                  <TextInput
                    value={minAmount}
                    onChangeText={setMinAmount}
                    keyboardType="numeric"
                    placeholder="Min ₱"
                    placeholderTextColor="#6B7280"
                    className="flex-1 bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-xs font-semibold mr-2"
                  />
                  <TextInput
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    keyboardType="numeric"
                    placeholder="Max ₱"
                    placeholderTextColor="#6B7280"
                    className="flex-1 bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-xs font-semibold"
                  />
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View className="flex-row space-x-3 pt-3 border-t border-background-border">
                <TouchableOpacity
                  onPress={handleClearFilters}
                  className="flex-1 bg-background-elevated py-2.5 rounded-lg items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold text-xs">Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic.success();
                    setFilterModalOpen(false);
                  }}
                  className="flex-1 bg-primary py-2.5 rounded-lg items-center active:opacity-80"
                >
                  <Text className="text-[#0F1012] font-bold text-xs">Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
