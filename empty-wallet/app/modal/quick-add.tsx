import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { TransactionType, PaymentType } from '../../src/types';
import { formatCurrency } from '../../src/services/currency';
import { Icon } from '../../src/components/ui/Icon';
import { triggerHaptic } from '../../src/services/haptics';
import { MACRO_CATEGORY_GROUPS } from '../../src/constants/categories';
import { X, Calendar, Clock, ChevronDown, Check, User, CreditCard, Search, Trash2, Delete, ArrowRightLeft } from 'lucide-react-native';
import { format } from 'date-fns';

export default function QuickAddModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionStore();
  const { wallets } = useWalletStore();
  const { categories, getExpenseCategories, getIncomeCategories } = useCategoryStore();
  const currency = useSettingsStore((s) => s.currency);

  const existingTx = useMemo(() => transactions.find((t) => t.id === id), [transactions, id]);

  const [type, setType] = useState<TransactionType>(existingTx?.type || 'expense');
  const [amountStr, setAmountStr] = useState<string>(existingTx?.amount ? existingTx.amount.toString() : '');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(existingTx?.walletId || wallets[0]?.id || 'wallet_cash');
  const [destinationWalletId, setDestinationWalletId] = useState<string>(existingTx?.destinationWalletId || wallets[1]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(existingTx?.categoryId || 'cat_food_dining');
  const [dateStr, setDateStr] = useState<string>(existingTx?.transactionDate || format(new Date(), 'yyyy-MM-dd'));
  const [timeStr, setTimeStr] = useState<string>(existingTx?.transactionTime || format(new Date(), 'HH:mm'));
  const [payee, setPayee] = useState<string>(existingTx?.payee || '');
  const [payer, setPayer] = useState<string>(existingTx?.payer || '');
  const [note, setNote] = useState<string>(existingTx?.note || '');
  const [paymentType, setPaymentType] = useState<PaymentType>(existingTx?.paymentType || 'cash');

  // Modals
  const [keypadModalOpen, setKeypadModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [destWalletModalOpen, setDestWalletModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    if (existingTx) {
      setType(existingTx.type);
      setAmountStr(existingTx.amount.toString());
      setSelectedWalletId(existingTx.walletId);
      if (existingTx.destinationWalletId) setDestinationWalletId(existingTx.destinationWalletId);
      if (existingTx.categoryId) setSelectedCategoryId(existingTx.categoryId);
      if (existingTx.transactionDate) setDateStr(existingTx.transactionDate);
      if (existingTx.transactionTime) setTimeStr(existingTx.transactionTime);
      if (existingTx.payee) setPayee(existingTx.payee);
      if (existingTx.payer) setPayer(existingTx.payer);
      if (existingTx.note) setNote(existingTx.note);
      if (existingTx.paymentType) setPaymentType(existingTx.paymentType);
    }
  }, [existingTx]);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];
  const destWallet = wallets.find((w) => w.id === destinationWalletId) || wallets[1];
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const evaluatedAmount = useMemo(() => {
    try {
      const sanitized = amountStr.replace(/[^0-9.+-]/g, '');
      if (!sanitized) return 0;
      const tokens = sanitized.match(/([+-]?[0-9.]+)/g);
      if (!tokens) return 0;
      const total = tokens.reduce((sum, token) => sum + (parseFloat(token) || 0), 0);
      return Math.max(0, isNaN(total) ? 0 : total);
    } catch {
      return 0;
    }
  }, [amountStr]);

  const availableCategories = useMemo(() => {
    return type === 'income' ? getIncomeCategories() : getExpenseCategories();
  }, [type, categories]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return availableCategories;
    const q = categorySearch.toLowerCase().trim();
    return availableCategories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [availableCategories, categorySearch]);

  const categoriesByGroup = useMemo(() => {
    const map = new Map<string, typeof availableCategories>();
    filteredCategories.forEach((cat) => {
      const g = cat.group || 'others';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(cat);
    });
    return map;
  }, [filteredCategories]);

  const handleKeyPress = (val: string) => {
    triggerHaptic.selection();
    if (val === 'C') {
      setAmountStr('');
      return;
    }
    if (val === 'BACK') {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }
    if (val === '.') {
      if (!amountStr.includes('.')) setAmountStr((prev) => (prev ? prev + '.' : '0.'));
      return;
    }
    if (val === '+' || val === '-') {
      if (amountStr && !amountStr.endsWith('+') && !amountStr.endsWith('-')) {
        setAmountStr((prev) => prev + val);
      }
      return;
    }
    setAmountStr((prev) => prev + val);
  };

  const handleSave = () => {
    if (evaluatedAmount <= 0) {
      triggerHaptic.error();
      return;
    }

    if (type === 'transfer' && selectedWalletId === destinationWalletId) {
      triggerHaptic.error();
      Alert.alert('Invalid Transfer', 'Source and destination wallets cannot be the same.');
      return;
    }

    const payload = {
      walletId: selectedWalletId,
      destinationWalletId: type === 'transfer' ? destinationWalletId : null,
      categoryId: type === 'transfer' ? null : selectedCategoryId,
      amount: evaluatedAmount,
      type,
      payee: payee.trim() || (type === 'transfer' ? `Transfer to ${destWallet?.name || 'Wallet'}` : selectedCategory?.name || 'Transaction'),
      payer: payer.trim() || null,
      paymentType,
      note: note.trim() || null,
      transactionDate: dateStr,
      transactionTime: timeStr,
    };

    triggerHaptic.success();
    if (isEditMode && id) {
      updateTransaction(id, payload);
    } else {
      addTransaction(payload);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete Record', 'Are you sure you want to permanently delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          triggerHaptic.heavy();
          deleteTransaction(id);
          router.back();
        },
      },
    ]);
  };

  const PAYMENT_TYPES: { id: PaymentType; label: string }[] = [
    { id: 'cash', label: 'Cash' },
    { id: 'debit_card', label: 'Debit Card' },
    { id: 'credit_card', label: 'Credit Card' },
    { id: 'transfer', label: 'Bank Transfer' },
    { id: 'web_payment', label: 'Web / E-Wallet' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0F1012]" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#2A2D35]">
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          className="w-9 h-9 rounded-lg bg-[#17181C] items-center justify-center"
        >
          <X size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <Text className="text-base font-bold text-[#F3F4F6]">
          {isEditMode ? 'Edit Record' : 'New Record'}
        </Text>

        {isEditMode ? (
          <TouchableOpacity
            onPress={handleDelete}
            className="w-9 h-9 rounded-lg bg-[#212329] items-center justify-center"
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <View className="w-9" />
        )}
      </View>

      {/* Main Scrollable Form */}
      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* 1. Type Switcher */}
        <View className="flex-row bg-[#17181C] p-1 rounded-xl mb-4 border border-[#2A2D35]">
          {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => {
            const isSelected = type === t;
            const label = t === 'expense' ? 'Expense' : t === 'income' ? 'Income' : 'Transfer';
            return (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  triggerHaptic.selection();
                  setType(t);
                }}
                className={`flex-1 py-2.5 rounded-lg items-center ${
                  isSelected
                    ? t === 'expense'
                      ? 'bg-[#EF4444]'
                      : t === 'income'
                      ? 'bg-[#10B981]'
                      : 'bg-[#3B82F6]'
                    : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isSelected ? 'text-[#0F1012]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Amount Field (Spawns Keypad Modal) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            triggerHaptic.selection();
            setKeypadModalOpen(true);
          }}
          className="bg-[#17181C] p-4 rounded-xl border border-[#2A2D35] items-center mb-4"
        >
          <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1">
            Amount ({currency}) • Tap to Enter
          </Text>
          <Text className="text-3xl font-extrabold text-[#F3F4F6] font-mono">
            {evaluatedAmount > 0 ? formatCurrency(evaluatedAmount, currency) : `0.00`}
          </Text>
          {amountStr && (amountStr.includes('+') || amountStr.includes('-')) && (
            <Text className="text-xs text-[#9CA3AF] font-mono mt-1">{amountStr} = {formatCurrency(evaluatedAmount, currency)}</Text>
          )}
        </TouchableOpacity>

        {/* 3. Wallet Selectors */}
        <View className="flex-row mb-4">
          {/* Source Wallet */}
          <View className="flex-1 mr-2">
            <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1.5">
              {type === 'transfer' ? 'From Wallet' : 'Wallet'}
            </Text>
            <TouchableOpacity
              onPress={() => setWalletModalOpen(true)}
              className="bg-[#17181C] p-3 rounded-xl border border-[#2A2D35] flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  className="w-7 h-7 rounded-lg items-center justify-center mr-2"
                  style={{ backgroundColor: `${selectedWallet?.color || '#10B981'}20` }}
                >
                  <Icon name={selectedWallet?.icon || 'Landmark'} size={15} color={selectedWallet?.color || '#10B981'} />
                </View>
                <Text className="text-xs font-bold text-[#F3F4F6] truncate" numberOfLines={1}>
                  {selectedWallet?.name || 'Select'}
                </Text>
              </View>
              <ChevronDown size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Destination Wallet (Transfer only) */}
          {type === 'transfer' && (
            <View className="flex-1 ml-2">
              <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                To Wallet
              </Text>
              <TouchableOpacity
                onPress={() => setDestWalletModalOpen(true)}
                className="bg-[#17181C] p-3 rounded-xl border border-[#2A2D35] flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View
                    className="w-7 h-7 rounded-lg items-center justify-center mr-2"
                    style={{ backgroundColor: `${destWallet?.color || '#3B82F6'}20` }}
                  >
                    <Icon name={destWallet?.icon || 'Landmark'} size={15} color={destWallet?.color || '#3B82F6'} />
                  </View>
                  <Text className="text-xs font-bold text-[#F3F4F6] truncate" numberOfLines={1}>
                    {destWallet?.name || 'Select'}
                  </Text>
                </View>
                <ChevronDown size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 4. Category Selector (for Expense / Income) */}
        {type !== 'transfer' && (
          <View className="mb-4">
            <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Category
            </Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.selection();
                setCategoryModalOpen(true);
              }}
              className="bg-[#17181C] p-3 rounded-xl border border-[#2A2D35] flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  className="w-7 h-7 rounded-lg items-center justify-center mr-2"
                  style={{ backgroundColor: `${selectedCategory?.color || '#10B981'}20` }}
                >
                  <Icon name={selectedCategory?.icon || 'ShoppingBag'} size={15} color={selectedCategory?.color || '#10B981'} />
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#F3F4F6]">
                    {selectedCategory?.name || 'Choose Category'}
                  </Text>
                  <Text className="text-[10px] text-[#6B7280] capitalize">
                    {selectedCategory?.group.replace('_', ' ') || 'General'}
                  </Text>
                </View>
              </View>
              <ChevronDown size={14} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Date & Time */}
        <View className="flex-row mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1.5">Date</Text>
            <View className="bg-[#17181C] p-3 rounded-xl border border-[#2A2D35] flex-row items-center">
              <Calendar size={14} color="#6B7280" className="mr-2" />
              <TextInput
                value={dateStr}
                onChangeText={setDateStr}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#6B7280"
                className="flex-1 text-xs font-mono text-[#F3F4F6] p-0"
              />
            </View>
          </View>

          <View className="flex-1 ml-2">
            <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1.5">Time</Text>
            <View className="bg-[#17181C] p-3 rounded-xl border border-[#2A2D35] flex-row items-center">
              <Clock size={14} color="#6B7280" className="mr-2" />
              <TextInput
                value={timeStr}
                onChangeText={setTimeStr}
                placeholder="HH:mm"
                placeholderTextColor="#6B7280"
                className="flex-1 text-xs font-mono text-[#F3F4F6] p-0"
              />
            </View>
          </View>
        </View>

        {/* 6. Payment Type */}
        <View className="mb-4">
          <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Payment Type
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-1">
            {PAYMENT_TYPES.map((pt) => {
              const isSelected = paymentType === pt.id;
              return (
                <TouchableOpacity
                  key={pt.id}
                  onPress={() => {
                    triggerHaptic.selection();
                    setPaymentType(pt.id);
                  }}
                  className={`px-3 py-2 rounded-lg mx-1 border ${
                    isSelected ? 'bg-[#10B981]/20 border-[#10B981]' : 'bg-[#17181C] border-[#2A2D35]'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${isSelected ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`}>
                    {pt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 7. Payee / Payer / Note Details */}
        <View className="mb-4">
          <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            {type === 'income' ? 'Payer / Source' : 'Payee / Merchant'}
          </Text>
          <TextInput
            value={type === 'income' ? payer : payee}
            onChangeText={type === 'income' ? setPayer : setPayee}
            placeholder={type === 'income' ? 'e.g. Employer, Client name' : 'e.g. Starbucks, Shell, Supermarket'}
            placeholderTextColor="#6B7280"
            className="bg-[#17181C] p-3 rounded-xl border border-[#2A2D35] text-xs text-[#F3F4F6] mb-3"
          />

          <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Note / Description (Optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Add any additional details..."
            placeholderTextColor="#6B7280"
            className="bg-[#17181C] p-3 rounded-xl border border-[#2A2D35] text-xs text-[#F3F4F6]"
          />
        </View>

        {/* 8. Save / Update Button */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-[#10B981] py-3.5 rounded-xl items-center mt-2 shadow-lg shadow-[#10B981]/20"
        >
          <Text className="text-[#0F1012] font-bold text-sm">
            {isEditMode ? 'Update Record' : 'Save Record'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* POPUP MODAL: NUMERIC KEYPAD */}
      <Modal visible={keypadModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-[#17181C] rounded-t-2xl p-5 border-t border-[#2A2D35]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
                Enter Amount ({currency})
              </Text>
              <TouchableOpacity
                onPress={() => setKeypadModalOpen(false)}
                className="p-1 rounded-lg bg-[#212329]"
              >
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Display */}
            <View className="bg-[#0F1012] p-4 rounded-xl border border-[#2A2D35] items-end mb-4">
              <Text className="text-2xl font-extrabold text-[#F3F4F6] font-mono">
                {amountStr || '0'}
              </Text>
              <Text className="text-xs text-[#10B981] font-mono mt-0.5">
                = {formatCurrency(evaluatedAmount, currency)}
              </Text>
            </View>

            {/* Keypad Grid */}
            <View className="flex-row flex-wrap justify-between">
              {['1', '2', '3', '+', '4', '5', '6', '-', '7', '8', '9', 'C', '.', '0', 'BACK', 'OK'].map((k) => {
                const isOp = k === '+' || k === '-';
                const isOk = k === 'OK';
                const isClear = k === 'C' || k === 'BACK';

                if (isOk) {
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => {
                        triggerHaptic.medium();
                        setKeypadModalOpen(false);
                      }}
                      className="w-[23%] bg-[#10B981] h-12 rounded-lg mb-2.5 items-center justify-center"
                    >
                      <Text className="text-[#0F1012] font-bold text-sm">Done</Text>
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={k}
                    onPress={() => handleKeyPress(k)}
                    className={`w-[23%] h-12 rounded-lg mb-2.5 items-center justify-center ${
                      isOp
                        ? 'bg-[#3B82F6]/20 border border-[#3B82F6]/40'
                        : isClear
                        ? 'bg-[#EF4444]/20 border border-[#EF4444]/40'
                        : 'bg-[#212329]'
                    }`}
                  >
                    {k === 'BACK' ? (
                      <Delete size={18} color="#EF4444" />
                    ) : (
                      <Text
                        className={`text-base font-bold font-mono ${
                          isOp ? 'text-[#3B82F6]' : isClear ? 'text-[#EF4444]' : 'text-[#F3F4F6]'
                        }`}
                      >
                        {k}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* POPUP MODAL: CATEGORY PICKER */}
      <Modal visible={categoryModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-[#17181C] rounded-t-2xl max-h-[80%] p-5 border-t border-[#2A2D35]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold text-[#F3F4F6]">Choose Category</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalOpen(false)}
                className="p-1 rounded-lg bg-[#212329]"
              >
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View className="flex-row items-center bg-[#212329] px-3 py-2 rounded-xl mb-3">
              <Search size={15} color="#6B7280" className="mr-2" />
              <TextInput
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholder="Search category or group..."
                placeholderTextColor="#6B7280"
                className="flex-1 text-xs text-[#F3F4F6] p-0"
              />
              {categorySearch ? (
                <TouchableOpacity onPress={() => setCategorySearch('')}>
                  <X size={14} color="#6B7280" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Sectioned Group Grid */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {MACRO_CATEGORY_GROUPS.filter((g) => (type === 'income' ? g.type === 'income' : g.type === 'expense')).map((grp) => {
                const groupCats = categoriesByGroup.get(grp.id) || [];
                if (groupCats.length === 0) return null;

                return (
                  <View key={grp.id} className="mb-4">
                    <View className="flex-row items-center mb-2">
                      <View
                        className="w-5 h-5 rounded-md items-center justify-center mr-2"
                        style={{ backgroundColor: `${grp.color}20` }}
                      >
                        <Icon name={grp.icon} size={12} color={grp.color} />
                      </View>
                      <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
                        {grp.label}
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap -mx-1">
                      {groupCats.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            onPress={() => {
                              triggerHaptic.selection();
                              setSelectedCategoryId(cat.id);
                              setCategoryModalOpen(false);
                            }}
                            className={`w-[48%] m-1 p-2.5 rounded-lg flex-row items-center border ${
                              isSelected
                                ? 'bg-[#10B981]/20 border-[#10B981]'
                                : 'bg-[#212329] border-[#2A2D35]'
                            }`}
                          >
                            <View
                              className="w-6 h-6 rounded-md items-center justify-center mr-2"
                              style={{ backgroundColor: `${cat.color}20` }}
                            >
                              <Icon name={cat.icon} size={13} color={cat.color} />
                            </View>
                            <Text
                              className={`text-xs font-semibold flex-1 truncate ${
                                isSelected ? 'text-[#10B981]' : 'text-[#F3F4F6]'
                              }`}
                              numberOfLines={1}
                            >
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* POPUP MODAL: SOURCE WALLET PICKER */}
      <Modal visible={walletModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-[#17181C] rounded-t-2xl p-5 border-t border-[#2A2D35]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold text-[#F3F4F6]">Select Wallet</Text>
              <TouchableOpacity onPress={() => setWalletModalOpen(false)} className="p-1 rounded-lg bg-[#212329]">
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedWalletId(w.id);
                    setWalletModalOpen(false);
                  }}
                  className={`flex-row items-center justify-between p-3 rounded-lg mb-2 border ${
                    selectedWalletId === w.id ? 'bg-[#10B981]/20 border-[#10B981]' : 'bg-[#212329] border-[#2A2D35]'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${w.color}20` }}>
                      <Icon name={w.icon} size={16} color={w.color} />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-[#F3F4F6]">{w.name}</Text>
                      <Text className="text-[10px] text-[#6B7280] uppercase">{w.type}</Text>
                    </View>
                  </View>
                  <Text className="text-xs font-mono font-bold text-[#F3F4F6]">{formatCurrency(w.balance, w.currency)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* POPUP MODAL: DESTINATION WALLET PICKER */}
      <Modal visible={destWalletModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-[#17181C] rounded-t-2xl p-5 border-t border-[#2A2D35]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold text-[#F3F4F6]">Select Destination Wallet</Text>
              <TouchableOpacity onPress={() => setDestWalletModalOpen(false)} className="p-1 rounded-lg bg-[#212329]">
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => {
                    triggerHaptic.selection();
                    setDestinationWalletId(w.id);
                    setDestWalletModalOpen(false);
                  }}
                  className={`flex-row items-center justify-between p-3 rounded-lg mb-2 border ${
                    destinationWalletId === w.id ? 'bg-[#3B82F6]/20 border-[#3B82F6]' : 'bg-[#212329] border-[#2A2D35]'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: `${w.color}20` }}>
                      <Icon name={w.icon} size={16} color={w.color} />
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-[#F3F4F6]">{w.name}</Text>
                      <Text className="text-[10px] text-[#6B7280] uppercase">{w.type}</Text>
                    </View>
                  </View>
                  <Text className="text-xs font-mono font-bold text-[#F3F4F6]">{formatCurrency(w.balance, w.currency)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
