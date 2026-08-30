import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { TransactionType, PaymentType } from '../../src/types';
import { formatCurrency } from '../../src/services/currency';
import { formatLiveNumber, parseNumberInput } from '../../src/utils/numberFormat';
import { DatePickerModal } from '../../src/components/ui/DatePickerModal';
import { TimePickerModal } from '../../src/components/ui/TimePickerModal';
import { Icon } from '../../src/components/ui/Icon';
import { triggerHaptic } from '../../src/services/haptics';
import { MACRO_CATEGORY_GROUPS } from '../../src/constants/categories';
import { X, Calendar, Clock, ChevronDown, Delete, Trash2, Search, ArrowRightLeft, CreditCard, Banknote, Landmark, Check } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';

export default function QuickAddModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!id;

  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionStore();
  const { wallets } = useWalletStore();
  const { categories } = useCategoryStore();
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

  // Modal visibility states
  const [keypadModalOpen, setKeypadModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [destWalletModalOpen, setDestWalletModalOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
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

  // Parse amount live
  const evaluatedAmount = useMemo(() => {
    return parseNumberInput(amountStr);
  }, [amountStr]);

  const handleKeyPress = useCallback((val: string) => {
    triggerHaptic.selection();
    if (val === 'C') {
      setAmountStr('');
    } else if (val === 'BACK') {
      setAmountStr((prev) => prev.slice(0, -1));
    } else if (val === '.') {
      setAmountStr((prev) => (prev.includes('.') ? prev : prev ? prev + '.' : '0.'));
    } else if (val === '+' || val === '-') {
      setAmountStr((prev) => (prev && !/[+-]$/.test(prev.trim()) ? `${prev} ${val} ` : prev));
    } else {
      setAmountStr((prev) => prev + val);
    }
  }, []);

  const handleDelete = () => {
    if (!id) return;
    triggerHaptic.warning();
    Alert.alert('Delete Record', 'Are you sure you want to delete this record? This action will reverse the wallet balance impact.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          triggerHaptic.success();
          deleteTransaction(id);
          router.back();
        },
      },
    ]);
  };

  const handleSave = () => {
    if (evaluatedAmount <= 0) {
      triggerHaptic.error();
      Alert.alert('Invalid Amount', 'Please enter a valid transaction amount greater than 0.');
      return;
    }

    if (type === 'transfer' && (!destinationWalletId || destinationWalletId === selectedWalletId)) {
      triggerHaptic.error();
      Alert.alert('Invalid Destination', 'Please select a different destination wallet for transfers.');
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

  // Group categories for 2-column modal picker
  const filteredCategoryGroups = useMemo(() => {
    const q = categorySearch.toLowerCase().trim();
    return MACRO_CATEGORY_GROUPS.map((group) => {
      const items = categories.filter((c) => {
        const matchesGroup = (c.group || (c.type === 'income' ? 'income' : 'others')) === group.id;
        const matchesType = type === 'expense' ? c.type === 'expense' : c.type === 'income';
        const matchesSearch = !q || c.name.toLowerCase().includes(q);
        return matchesGroup && matchesType && matchesSearch;
      });
      return { group, items };
    }).filter((g) => g.items.length > 0);
  }, [categories, type, categorySearch]);

  const formattedDateDisplay = useMemo(() => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  }, [dateStr]);

  const formattedTimeDisplay = useMemo(() => {
    try {
      const [h, m] = timeStr.split(':');
      const dateObj = new Date();
      dateObj.setHours(parseInt(h, 10) || 0, parseInt(m, 10) || 0);
      return format(dateObj, 'hh:mm a');
    } catch {
      return timeStr;
    }
  }, [timeStr]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-background-border">
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          className="w-9 h-9 rounded-lg bg-background-card border border-background-border items-center justify-center"
        >
          <X size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <Text className="text-base font-bold text-content-primary">
          {isEditMode ? 'Edit Record' : 'Add Record'}
        </Text>

        {isEditMode ? (
          <TouchableOpacity
            onPress={handleDelete}
            className="w-9 h-9 rounded-lg bg-danger/15 border border-danger/30 items-center justify-center"
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <View className="w-9" />
        )}
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60 }}
      >

        {/* Type Switcher Pill Group */}
        <View className="flex-row bg-background-card p-1.5 rounded-xl border border-background-border mb-4 gap-x-2.5">
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              setType('expense');
            }}
            className={`flex-1 py-2.5 rounded-lg items-center justify-center ${type === 'expense' ? 'bg-[#EF4444] border border-[#EF4444]' : ''}`}
          >
            <Text className={`text-xs font-bold ${type === 'expense' ? 'text-white' : 'text-gray-400'}`}>
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              setType('income');
            }}
            className={`flex-1 py-2.5 rounded-lg items-center justify-center ${type === 'income' ? 'bg-[#10B981] border border-[#10B981]' : ''}`}
          >
            <Text className={`text-xs font-bold ${type === 'income' ? 'text-[#0F1012]' : 'text-gray-400'}`}>
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              setType('transfer');
            }}
            className={`flex-1 py-2.5 rounded-lg items-center justify-center ${type === 'transfer' ? 'bg-[#3B82F6] border border-[#3B82F6]' : ''}`}
          >
            <Text className={`text-xs font-bold ${type === 'transfer' ? 'text-white' : 'text-gray-400'}`}>
              Transfer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount Entry Card (Spawns Keypad) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            triggerHaptic.medium();
            setKeypadModalOpen(true);
          }}
          className="bg-background-card p-4 rounded-xl border border-background-border items-center mb-4"
        >
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
            Amount ({currency})
          </Text>
          <Text className="text-3xl font-extrabold text-content-primary font-mono tracking-tight">
            {evaluatedAmount > 0 ? formatCurrency(evaluatedAmount, currency) : `0.00`}
          </Text>
          <Text className="text-primary text-[11px] font-semibold mt-1">Tap to enter amount</Text>
        </TouchableOpacity>

        {/* Category Picker Card (Hidden for Transfers) */}
        {type !== 'transfer' && (
          <View className="mb-4">
            <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-1.5">
              Category
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                setCategoryModalOpen(true);
              }}
              className="flex-row items-center justify-between bg-background-card p-3.5 rounded-xl border border-background-border"
            >
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `${selectedCategory?.color || '#10B981'}20` }}
                >
                  <Icon
                    name={selectedCategory?.icon || 'Tag'}
                    size={16}
                    color={selectedCategory?.color || '#10B981'}
                  />
                </View>
                <Text className="text-content-primary font-semibold text-sm">
                  {selectedCategory?.name || 'Select Category'}
                </Text>
              </View>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Wallet Selection Card(s) */}
        <View className="mb-4">
          <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-1.5">
            {type === 'transfer' ? 'Source Wallet' : 'Wallet / Account'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.selection();
              setWalletModalOpen(true);
            }}
            className="flex-row items-center justify-between bg-background-card p-3.5 rounded-xl border border-background-border"
          >
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: `${selectedWallet?.color || '#10B981'}20` }}
              >
                <Icon
                  name={selectedWallet?.icon || 'Wallet'}
                  size={16}
                  color={selectedWallet?.color || '#10B981'}
                />
              </View>
              <View>
                <Text className="text-content-primary font-semibold text-sm">
                  {selectedWallet?.name || 'Select Wallet'}
                </Text>
                <Text className="text-content-tertiary text-xs font-mono">
                  Balance: {formatCurrency(selectedWallet?.balance || 0, currency)}
                </Text>
              </View>
            </View>
            <ChevronDown size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Destination Wallet for Transfers */}
        {type === 'transfer' && (
          <View className="mb-4">
            <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-1.5">
              Destination Wallet
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                setDestWalletModalOpen(true);
              }}
              className="flex-row items-center justify-between bg-background-card p-3.5 rounded-xl border border-background-border"
            >
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: `${destWallet?.color || '#3B82F6'}20` }}
                >
                  <Icon
                    name={destWallet?.icon || 'Building2'}
                    size={16}
                    color={destWallet?.color || '#3B82F6'}
                  />
                </View>
                <View>
                  <Text className="text-content-primary font-semibold text-sm">
                    {destWallet?.name || 'Select Destination'}
                  </Text>
                  <Text className="text-content-tertiary text-xs font-mono">
                    Balance: {formatCurrency(destWallet?.balance || 0, currency)}
                  </Text>
                </View>
              </View>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Date & Time Interactive Pickers */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-1.5">
              Date
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                setDatePickerOpen(true);
              }}
              className="flex-row items-center bg-background-card p-3.5 rounded-xl border border-background-border"
            >
              <Calendar size={16} color="#10B981" />
              <Text className="text-content-primary font-semibold text-xs font-mono ml-2.5">
                {formattedDateDisplay}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 ml-2">
            <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-1.5">
              Time
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                setTimePickerOpen(true);
              }}
              className="flex-row items-center bg-background-card p-3.5 rounded-xl border border-background-border"
            >
              <Clock size={16} color="#10B981" />
              <Text className="text-content-primary font-semibold text-xs font-mono ml-2.5">
                {formattedTimeDisplay}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payee / Description Input */}
        <View className="mb-4">
          <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-1.5">
            {type === 'income' ? 'Payer / Source' : 'Payee / Description'}
          </Text>
          <View className="bg-background-card border border-background-border rounded-xl px-3.5 py-3">
            <TextInput
              value={payee}
              onChangeText={setPayee}
              placeholder={type === 'income' ? 'e.g. Salary, Client payment' : 'e.g. Starbucks, Grocery store'}
              placeholderTextColor="#6B7280"
              className="text-content-primary text-xs font-medium p-0"
            />
          </View>
        </View>

        {/* Note / Memo Input */}
        <View className="mb-4">
          <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-1.5">
            Note (Optional)
          </Text>
          <View className="bg-background-card border border-background-border rounded-xl px-3.5 py-3">
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add extra context or details..."
              placeholderTextColor="#6B7280"
              className="text-content-primary text-xs font-medium p-0"
            />
          </View>
        </View>

        {/* Save / Update Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          className="bg-primary py-3.5 rounded-xl items-center mt-2 active:opacity-90"
        >
          <Text className="text-[#0F1012] font-bold text-sm">
            {isEditMode ? 'Update Record' : 'Save Record'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* POPUP CALCULATOR KEYPAD MODAL */}
      <Modal
        visible={keypadModalOpen}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setKeypadModalOpen(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-background-card rounded-t-2xl p-5 border-t border-background-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-content-tertiary text-xs font-bold uppercase tracking-wider">
                Enter Amount
              </Text>
              <TouchableOpacity onPress={() => setKeypadModalOpen(false)}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Live Formatted Amount Display */}
            <View className="bg-background-elevated p-4 rounded-xl border border-background-border mb-4 items-center">
              <Text className="text-3xl font-extrabold text-content-primary font-mono tracking-tight">
                {amountStr ? formatLiveNumber(amountStr) : '0'}
              </Text>
              {amountStr.includes('+') || amountStr.includes('-') ? (
                <Text className="text-primary text-xs font-mono font-bold mt-1">
                  = {formatCurrency(evaluatedAmount, currency)}
                </Text>
              ) : null}
            </View>

            {/* Keypad Grid with Comma & Arithmetic */}
            <View className="flex-row flex-wrap justify-between">
              {['1', '2', '3', '+', '4', '5', '6', '-', '7', '8', '9', 'C', '.', '0', 'BACK'].map((k) => (
                <TouchableOpacity
                  key={k}
                  activeOpacity={0.7}
                  onPress={() => handleKeyPress(k)}
                  className={`w-[23%] h-13 rounded-xl mb-2.5 items-center justify-center ${
                    k === '+' || k === '-'
                      ? 'bg-primary/20 border border-primary/40'
                      : k === 'C'
                      ? 'bg-danger/20 border border-danger/40'
                      : 'bg-background-elevated border border-background-border'
                  }`}
                >
                  <Text
                    className={`text-lg font-bold font-mono ${
                      k === '+' || k === '-'
                        ? 'text-primary'
                        : k === 'C'
                        ? 'text-danger'
                        : 'text-content-primary'
                    }`}
                  >
                    {k}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic.medium();
                  setKeypadModalOpen(false);
                }}
                className="w-[23%] bg-primary h-13 rounded-xl mb-2.5 items-center justify-center"
              >
                <Check size={20} color="#0F1012" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CATEGORY PICKER MODAL (2-COLUMN GRID) */}
      <Modal
        visible={categoryModalOpen}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setCategoryModalOpen(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-background-card rounded-t-2xl p-5 border-t border-background-border max-h-[85%]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-content-primary">Choose Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalOpen(false)}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-background-elevated border border-background-border rounded-lg px-3 py-2.5 mb-3">
              <Search size={15} color="#6B7280" />
              <TextInput
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholder="Search categories..."
                placeholderTextColor="#6B7280"
                className="flex-1 ml-2.5 text-content-primary text-xs font-medium p-0"
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-96">
              {filteredCategoryGroups.map(({ group, items }) => (
                <View key={group.id} className="mb-4">
                  <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-2">
                    {group.label}
                  </Text>
                  <View className="flex-row flex-wrap justify-between">
                    {items.map((cat) => {
                      const isSelected = selectedCategoryId === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          activeOpacity={0.7}
                          onPress={() => {
                            triggerHaptic.selection();
                            setSelectedCategoryId(cat.id);
                            setCategoryModalOpen(false);
                          }}
                          className={`w-[48%] flex-row items-center p-2.5 rounded-xl border mb-2 ${
                            isSelected
                              ? 'bg-primary/15 border-primary'
                              : 'bg-background-elevated border-background-border'
                          }`}
                        >
                          <View
                            className="w-7 h-7 rounded-lg items-center justify-center mr-2 shrink-0"
                            style={{ backgroundColor: `${cat.color}25` }}
                          >
                            <Icon name={cat.icon} size={14} color={cat.color} />
                          </View>
                          <Text
                            className={`text-xs font-semibold flex-1 ${
                              isSelected ? 'text-primary' : 'text-content-primary'
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
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* WALLET PICKER MODAL */}
      <Modal
        visible={walletModalOpen}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setWalletModalOpen(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-background-card rounded-t-2xl p-5 border-t border-background-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-content-primary">Select Wallet</Text>
              <TouchableOpacity onPress={() => setWalletModalOpen(false)}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedWalletId(w.id);
                    setWalletModalOpen(false);
                  }}
                  className={`w-[48%] flex-row items-center p-3 rounded-xl border mb-2.5 ${
                    selectedWalletId === w.id
                      ? 'bg-primary/15 border-primary'
                      : 'bg-background-elevated border-background-border'
                  }`}
                >
                  <View
                    className="w-8 h-8 rounded-lg items-center justify-center mr-2.5 shrink-0"
                    style={{ backgroundColor: `${w.color}25` }}
                  >
                    <Icon name={w.icon} size={16} color={w.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-content-primary font-bold text-xs" numberOfLines={1}>
                      {w.name}
                    </Text>
                    <Text className="text-content-tertiary text-[10px] font-mono">
                      {formatCurrency(w.balance, currency)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* DESTINATION WALLET MODAL (TRANSFERS) */}
      <Modal
        visible={destWalletModalOpen}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setDestWalletModalOpen(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-background-card rounded-t-2xl p-5 border-t border-background-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-content-primary">Select Destination Wallet</Text>
              <TouchableOpacity onPress={() => setDestWalletModalOpen(false)}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {wallets
                .filter((w) => w.id !== selectedWalletId)
                .map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      triggerHaptic.selection();
                      setDestinationWalletId(w.id);
                      setDestWalletModalOpen(false);
                    }}
                    className={`w-[48%] flex-row items-center p-3 rounded-xl border mb-2.5 ${
                      destinationWalletId === w.id
                        ? 'bg-info/15 border-info'
                        : 'bg-background-elevated border-background-border'
                    }`}
                  >
                    <View
                      className="w-8 h-8 rounded-lg items-center justify-center mr-2.5 shrink-0"
                      style={{ backgroundColor: `${w.color}25` }}
                    >
                      <Icon name={w.icon} size={16} color={w.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-content-primary font-bold text-xs" numberOfLines={1}>
                        {w.name}
                      </Text>
                      <Text className="text-content-tertiary text-[10px] font-mono">
                        {formatCurrency(w.balance, currency)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* INTERACTIVE CALENDAR DATE PICKER MODAL */}
      <DatePickerModal
        visible={datePickerOpen}
        currentDate={dateStr}
        onSelect={(newDate) => setDateStr(newDate)}
        onClose={() => setDatePickerOpen(false)}
      />

      {/* INTERACTIVE TIME PICKER MODAL */}
      <TimePickerModal
        visible={timePickerOpen}
        currentTime={timeStr}
        onSelect={(newTime) => setTimeStr(newTime)}
        onClose={() => setTimePickerOpen(false)}
      />
    </SafeAreaView>
  );
}
