import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { TransactionType, PaymentType } from '../../src/types';
import { formatCurrency } from '../../src/services/currency';
import { HapticKeypad } from '../../src/components/keypad/HapticKeypad';
import { Icon } from '../../src/components/ui/Icon';
import { triggerHaptic } from '../../src/services/haptics';
import { MACRO_CATEGORY_GROUPS } from '../../src/constants/categories';
import { X, Calendar, Clock, Edit3, ChevronDown, Check, User, CreditCard, Search } from 'lucide-react-native';
import { format } from 'date-fns';

export default function QuickAddModal() {
  const router = useRouter();

  const { addTransaction } = useTransactionStore();
  const { wallets } = useWalletStore();
  const { categories, getExpenseCategories, getIncomeCategories } = useCategoryStore();
  const currency = useSettingsStore((s) => s.currency);

  // 1. Record Type State
  const [type, setType] = useState<TransactionType>('expense');

  // 2. Amount State
  const [amountStr, setAmountStr] = useState<string>('');

  // 3. Wallet Selectors
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || 'wallet_cash');
  const [destinationWalletId, setDestinationWalletId] = useState<string>(wallets[1]?.id || '');
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);

  // 4. Category Selector
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_food_dining');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // 5. Date & Time State
  const now = new Date();
  const [dateStr, setDateStr] = useState<string>(format(now, 'yyyy-MM-dd'));
  const [timeStr, setTimeStr] = useState<string>(format(now, 'HH:mm'));
  const [dateTimeModalOpen, setDateTimeModalOpen] = useState(false);

  // 6. Other Details State
  const [payee, setPayee] = useState<string>('');
  const [payer, setPayer] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentType, setPaymentType] = useState<PaymentType>('cash');
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);

  const activeCategories = useMemo(() => {
    return type === 'expense' ? getExpenseCategories() : getIncomeCategories();
  }, [type, categories, getExpenseCategories, getIncomeCategories]);

  // Grouped active categories filtered by current active type and search query
  const groupedCategories = useMemo(() => {
    const query = categorySearchQuery.trim().toLowerCase();
    const filtered = activeCategories.filter((c) => {
      if (!query) return true;
      const matchName = c.name.toLowerCase().includes(query);
      const groupObj = MACRO_CATEGORY_GROUPS.find((g) => g.id === c.group);
      const matchGroup = groupObj ? groupObj.name.toLowerCase().includes(query) : false;
      return matchName || matchGroup;
    });

    const groups: { group: (typeof MACRO_CATEGORY_GROUPS)[number]; items: typeof categories }[] = [];

    for (const macroGroup of MACRO_CATEGORY_GROUPS) {
      if (macroGroup.type !== 'both' && macroGroup.type !== type) {
        continue;
      }
      const items = filtered.filter(
        (c) => (c.group || (c.type === 'income' ? 'income' : 'others')) === macroGroup.id
      );
      if (items.length > 0) {
        groups.push({ group: macroGroup, items });
      }
    }

    return groups;
  }, [activeCategories, categorySearchQuery, type]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const destWallet = wallets.find((w) => w.id === destinationWalletId);

  const PAYMENT_OPTIONS: { type: PaymentType; label: string; icon: string }[] = [
    { type: 'cash', label: 'Cash', icon: 'Banknote' },
    { type: 'debit_card', label: 'Debit Card', icon: 'CreditCard' },
    { type: 'credit_card', label: 'Credit Card', icon: 'CreditCard' },
    { type: 'transfer', label: 'Bank Transfer', icon: 'Landmark' },
    { type: 'web_payment', label: 'Web Payment / E-Wallet', icon: 'Globe' },
  ];

  // Evaluate amount string
  const evaluatedAmount = useMemo(() => {
    if (!amountStr) return 0;
    try {
      const sanitized = amountStr.replace(/[^0-9.+-]/g, '');
      if (!sanitized) return 0;
      const tokens = sanitized.match(/([+-]?[0-9.]+)/g);
      if (!tokens) return 0;
      return tokens.reduce((sum, token) => sum + (parseFloat(token) || 0), 0);
    } catch {
      return 0;
    }
  }, [amountStr]);

  const handleSave = () => {
    if (evaluatedAmount <= 0) {
      triggerHaptic.error();
      return;
    }

    if (type === 'transfer' && (!destinationWalletId || destinationWalletId === selectedWalletId)) {
      triggerHaptic.error();
      return;
    }

    const defaultPayee =
      payee.trim() ||
      (type === 'transfer'
        ? `Transfer to ${destWallet?.name || 'Wallet'}`
        : type === 'income'
        ? 'Income Deposit'
        : selectedCategory?.name || 'General Expense');

    addTransaction({
      walletId: selectedWalletId,
      destinationWalletId: type === 'transfer' ? destinationWalletId : null,
      categoryId: type === 'transfer' ? null : selectedCategoryId || null,
      amount: evaluatedAmount,
      type,
      payee: defaultPayee,
      payer: payer.trim() || null,
      paymentType,
      note: note.trim() || null,
      transactionDate: dateStr,
      transactionTime: timeStr,
    });

    triggerHaptic.success();
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-4 py-2.5 border-b border-background-border">
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          className="p-1.5 -ml-1 rounded-lg"
        >
          <X size={22} color="#9CA3AF" />
        </TouchableOpacity>

        {/* 1. Record Type Switcher */}
        <View className="flex-row bg-background-card p-1 rounded-lg border border-background-border">
          {(['expense', 'income', 'transfer'] as const).map((t) => {
            const isSelected = type === t;
            const label = t === 'expense' ? 'Expense' : t === 'income' ? 'Income' : 'Transfer';
            const bgClass =
              t === 'expense' ? 'bg-expense' : t === 'income' ? 'bg-primary' : 'bg-accent-blue';
            const textClass = isSelected
              ? t === 'income'
                ? 'text-[#0F1012] font-bold'
                : 'text-content-primary font-bold'
              : 'text-content-secondary';

            return (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  triggerHaptic.selection();
                  setType(t);
                  if (t === 'expense') {
                    const expenseCats = getExpenseCategories();
                    if (!expenseCats.some((c) => c.id === selectedCategoryId)) {
                      setSelectedCategoryId(expenseCats[0]?.id || 'cat_food_dining');
                    }
                  } else if (t === 'income') {
                    const incomeCats = getIncomeCategories();
                    if (!incomeCats.some((c) => c.id === selectedCategoryId)) {
                      setSelectedCategoryId(incomeCats[0]?.id || 'cat_salary');
                    }
                  }
                }}
                className={`px-3 py-1 rounded-md ${isSelected ? bgClass : ''}`}
              >
                <Text className={`text-xs font-semibold ${textClass}`}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4 pt-1" showsVerticalScrollIndicator={false}>
        {/* 2. Amount Display */}
        <View className="items-center justify-center my-2.5">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
            {type === 'expense'
              ? 'Amount to Spend'
              : type === 'income'
              ? 'Amount to Receive'
              : 'Transfer Amount'}
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className={`text-4xl font-extrabold tracking-tight font-mono ${
                type === 'expense'
                  ? 'text-expense'
                  : type === 'income'
                  ? 'text-primary'
                  : 'text-accent-blue'
              }`}
            >
              {amountStr
                ? `${type === 'expense' ? '-' : type === 'income' ? '+' : ''}${amountStr}`
                : '0.00'}
            </Text>
            <Text className="text-content-secondary text-sm font-semibold ml-2 font-mono">{currency}</Text>
          </View>
          {amountStr.includes('+') || amountStr.includes('-') ? (
            <Text className="text-content-secondary text-xs mt-0.5 font-mono">
              Evaluates to: {formatCurrency(evaluatedAmount, currency)}
            </Text>
          ) : null}
        </View>

        {/* 3. Wallet Dropdown / Selector */}
        <View className="mb-2.5">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
            {type === 'transfer' ? 'From Source Wallet' : 'Wallet / Account'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setWalletDropdownOpen(!walletDropdownOpen)}
            className="flex-row items-center justify-between bg-background-card border border-background-border rounded-xl p-2.5"
          >
            <View className="flex-row items-center">
              <View
                className="w-7 h-7 rounded-lg items-center justify-center mr-2"
                style={{ backgroundColor: `${selectedWallet?.color || '#10B981'}20` }}
              >
                <Icon
                  name={selectedWallet?.icon || 'Wallet'}
                  size={15}
                  color={selectedWallet?.color || '#10B981'}
                />
              </View>
              <Text className="text-content-primary font-bold text-xs">
                {selectedWallet?.name || 'Select Wallet'}
              </Text>
              <Text className="text-content-tertiary text-[11px] ml-2 font-mono">
                ({formatCurrency(selectedWallet?.balance || 0, selectedWallet?.currency)})
              </Text>
            </View>
            <ChevronDown size={15} color="#6B7280" />
          </TouchableOpacity>

          {walletDropdownOpen && (
            <View className="bg-background-elevated border border-background-border rounded-xl p-1.5 mt-1">
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedWalletId(w.id);
                    setWalletDropdownOpen(false);
                  }}
                  className="flex-row items-center justify-between p-2 rounded-lg active:bg-background-card"
                >
                  <View className="flex-row items-center">
                    <Icon name={w.icon} size={15} color={w.color} />
                    <Text className="text-content-primary text-xs font-semibold ml-2">{w.name}</Text>
                  </View>
                  <Text className="text-content-tertiary text-xs font-mono">
                    {formatCurrency(w.balance, w.currency)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 3b. Destination Wallet (If Transfer) */}
        {type === 'transfer' && (
          <View className="mb-2.5">
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
              To Destination Wallet
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDestDropdownOpen(!destDropdownOpen)}
              className="flex-row items-center justify-between bg-background-card border border-background-border rounded-xl p-2.5"
            >
              <View className="flex-row items-center">
                <View
                  className="w-7 h-7 rounded-lg items-center justify-center mr-2"
                  style={{ backgroundColor: `${destWallet?.color || '#3B82F6'}20` }}
                >
                  <Icon
                    name={destWallet?.icon || 'Landmark'}
                    size={15}
                    color={destWallet?.color || '#3B82F6'}
                  />
                </View>
                <Text className="text-content-primary font-bold text-xs">
                  {destWallet?.name || 'Select Destination Wallet'}
                </Text>
              </View>
              <ChevronDown size={15} color="#6B7280" />
            </TouchableOpacity>

            {destDropdownOpen && (
              <View className="bg-background-elevated border border-background-border rounded-xl p-1.5 mt-1">
                {wallets
                  .filter((w) => w.id !== selectedWalletId)
                  .map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      onPress={() => {
                        triggerHaptic.selection();
                        setDestinationWalletId(w.id);
                        setDestDropdownOpen(false);
                      }}
                      className="flex-row items-center justify-between p-2 rounded-lg active:bg-background-card"
                    >
                      <View className="flex-row items-center">
                        <Icon name={w.icon} size={15} color={w.color} />
                        <Text className="text-content-primary text-xs font-semibold ml-2">{w.name}</Text>
                      </View>
                      <Text className="text-content-tertiary text-xs font-mono">
                        {formatCurrency(w.balance, w.currency)}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>
        )}

        {/* 4. Category Dropdown / Selector */}
        {type !== 'transfer' && (
          <View className="mb-2.5">
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
              Category
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCategoryModalOpen(true)}
              className="flex-row items-center justify-between bg-background-card border border-background-border rounded-xl p-2.5"
            >
              <View className="flex-row items-center">
                <View
                  className="w-7 h-7 rounded-lg items-center justify-center mr-2"
                  style={{ backgroundColor: `${selectedCategory?.color || '#10B981'}20` }}
                >
                  <Icon
                    name={selectedCategory?.icon || 'Tag'}
                    size={15}
                    color={selectedCategory?.color || '#10B981'}
                  />
                </View>
                <Text className="text-content-primary font-bold text-xs">
                  {selectedCategory?.name || 'Choose Category'}
                </Text>
              </View>
              <ChevronDown size={15} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Date & Time Calendar Selector */}
        <View className="mb-2.5">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
            Date & Time
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDateTimeModalOpen(true)}
            className="flex-row items-center justify-between bg-background-card border border-background-border rounded-xl p-2.5"
          >
            <View className="flex-row items-center">
              <Calendar size={15} color="#10B981" />
              <Text className="text-content-primary font-bold text-xs ml-2 font-mono">{dateStr}</Text>
              <Text className="text-content-muted mx-2">•</Text>
              <Clock size={15} color="#9CA3AF" />
              <Text className="text-content-primary font-bold text-xs ml-2 font-mono">{timeStr}</Text>
            </View>
            <Edit3 size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* 6. Other Details (Payer, Payee, Payment Type, Note) */}
        <View className="mb-2.5">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
            Payment Type & Merchant Details
          </Text>

          {/* Payment Type Dropdown */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPaymentDropdownOpen(!paymentDropdownOpen)}
            className="flex-row items-center justify-between bg-background-card border border-background-border rounded-lg p-2.5 mb-1.5"
          >
            <View className="flex-row items-center">
              <CreditCard size={15} color="#F59E0B" />
              <Text className="text-content-primary font-semibold text-xs ml-2">
                Payment: {PAYMENT_OPTIONS.find((p) => p.type === paymentType)?.label || 'Cash'}
              </Text>
            </View>
            <ChevronDown size={15} color="#6B7280" />
          </TouchableOpacity>

          {paymentDropdownOpen && (
            <View className="bg-background-elevated border border-background-border rounded-lg p-1.5 mb-1.5">
              {PAYMENT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.type}
                  onPress={() => {
                    triggerHaptic.selection();
                    setPaymentType(opt.type);
                    setPaymentDropdownOpen(false);
                  }}
                  className="flex-row items-center justify-between p-2 rounded-md active:bg-background-card"
                >
                  <Text className="text-content-primary text-xs font-semibold">{opt.label}</Text>
                  {paymentType === opt.type && <Check size={15} color="#10B981" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Payee / Merchant */}
          <View className="flex-row items-center bg-background-card border border-background-border rounded-lg px-3 py-2 mb-1.5">
            <Edit3 size={15} color="#6B7280" />
            <TextInput
              value={payee}
              onChangeText={setPayee}
              placeholder={type === 'expense' ? 'Payee / Merchant (e.g. Starbucks, Shell)' : 'Income Source'}
              placeholderTextColor="#6B7280"
              className="flex-1 ml-2 text-content-primary text-xs font-medium"
            />
          </View>

          {/* Payer (Optional) */}
          <View className="flex-row items-center bg-background-card border border-background-border rounded-lg px-3 py-2 mb-1.5">
            <User size={15} color="#6B7280" />
            <TextInput
              value={payer}
              onChangeText={setPayer}
              placeholder="Payer / Spender (Optional)"
              placeholderTextColor="#6B7280"
              className="flex-1 ml-2 text-content-primary text-xs font-medium"
            />
          </View>

          {/* Note / Memo */}
          <View className="flex-row items-center bg-background-card border border-background-border rounded-lg px-3 py-2 mb-1.5">
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add note, receipt tags, or memo (Optional)..."
              placeholderTextColor="#6B7280"
              className="flex-1 text-content-primary text-xs font-medium"
            />
          </View>
        </View>
      </ScrollView>

      {/* Built-in Haptic Keypad at Bottom */}
      <HapticKeypad
        value={amountStr}
        onChange={setAmountStr}
        onSubmit={handleSave}
        submitDisabled={evaluatedAmount <= 0}
      />

      {/* CATEGORY PICKER MODAL */}
      <Modal visible={categoryModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-background-card rounded-t-2xl p-5 border-t border-background-border max-h-[85%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Text className="text-base font-bold text-content-primary">Choose Category</Text>
                <View className="bg-background-elevated px-2 py-0.5 rounded-md border border-background-border ml-2.5">
                  <Text className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider">
                    {type === 'expense' ? 'Expense' : 'Income'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setCategoryModalOpen(false);
                  setCategorySearchQuery('');
                }}
                className="p-1 rounded-lg"
              >
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Real-Time Search Bar */}
            <View className="flex-row items-center bg-background-elevated border border-background-border rounded-lg px-3 py-2 mb-3">
              <Search size={15} color="#6B7280" />
              <TextInput
                value={categorySearchQuery}
                onChangeText={setCategorySearchQuery}
                placeholder="Search categories or groups..."
                placeholderTextColor="#6B7280"
                className="flex-1 ml-2 text-content-primary text-xs font-medium"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {categorySearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setCategorySearchQuery('')}>
                  <X size={14} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>

            {/* Sectioned Visual Grid */}
            <ScrollView showsVerticalScrollIndicator={false} className="mb-2">
              {groupedCategories.length === 0 ? (
                <View className="py-8 items-center justify-center">
                  <Text className="text-content-tertiary text-xs">
                    No categories found for "{categorySearchQuery}"
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCategorySearchQuery('')}
                    className="mt-2.5 bg-background-elevated px-3 py-1.5 rounded-lg border border-background-border"
                  >
                    <Text className="text-primary text-xs font-semibold">Clear Search</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                groupedCategories.map(({ group, items }) => (
                  <View key={group.id} className="mb-4">
                    {/* Sticky / Clear Group Header */}
                    <View className="flex-row items-center justify-between mb-2 px-1">
                      <View className="flex-row items-center">
                        <View
                          className="w-5 h-5 rounded-md items-center justify-center mr-1.5"
                          style={{ backgroundColor: `${group.color}20` }}
                        >
                          <Icon name={group.icon} size={12} color={group.color} />
                        </View>
                        <Text className="text-[11px] font-bold text-content-secondary uppercase tracking-wider">
                          {group.name}
                        </Text>
                      </View>
                      <Text className="text-[10px] text-content-tertiary font-mono">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </Text>
                    </View>

                    {/* Category Items in Sleek Grid Tiles */}
                    <View className="flex-row flex-wrap justify-between">
                      {items.map((c) => {
                        const isSelected = selectedCategoryId === c.id;
                        return (
                          <TouchableOpacity
                            key={c.id}
                            activeOpacity={0.7}
                            onPress={() => {
                              triggerHaptic.selection();
                              setSelectedCategoryId(c.id);
                              setCategoryModalOpen(false);
                              setCategorySearchQuery('');
                            }}
                            className={`w-[48.5%] flex-row items-center p-2.5 rounded-lg mb-2 border ${
                              isSelected
                                ? 'bg-primary/20 border-primary shadow-sm'
                                : 'bg-background-elevated border-background-border'
                            }`}
                          >
                            <View
                              className="w-7 h-7 rounded-md items-center justify-center mr-2"
                              style={{
                                backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.25)' : `${c.color}20`,
                              }}
                            >
                              <Icon name={c.icon} size={14} color={isSelected ? '#10B981' : c.color} />
                            </View>
                            <Text
                              className={`text-xs font-semibold flex-1 mr-1 ${
                                isSelected ? 'text-primary' : 'text-content-primary'
                              }`}
                              numberOfLines={1}
                            >
                              {c.name}
                            </Text>
                            {isSelected && <Check size={13} color="#10B981" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DATE & TIME PICKER MODAL */}
      <Modal visible={dateTimeModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-background-card rounded-t-xl p-5 border-t border-background-border">
            <View className="flex-row items-center justify-between mb-3.5">
              <Text className="text-base font-bold text-content-primary">Select Date & Time</Text>
              <TouchableOpacity onPress={() => setDateTimeModalOpen(false)}>
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1.5">Quick Date</Text>
            <View className="flex-row mb-3.5">
              <TouchableOpacity
                onPress={() => setDateStr(format(new Date(), 'yyyy-MM-dd'))}
                className="flex-1 bg-background-elevated py-2 rounded-lg items-center mr-2 border border-background-border"
              >
                <Text className="text-content-primary font-bold text-xs">Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setDateStr(format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'))
                }
                className="flex-1 bg-background-elevated py-2 rounded-lg items-center mr-2 border border-background-border"
              >
                <Text className="text-content-primary font-bold text-xs">Yesterday</Text>
              </TouchableOpacity>
            </View>

            {/* Date Input */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Date (YYYY-MM-DD)</Text>
            <TextInput
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#6B7280"
              className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-xs font-semibold mb-2.5 font-mono"
            />

            {/* Time Input */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Time (HH:mm)</Text>
            <TextInput
              value={timeStr}
              onChangeText={setTimeStr}
              placeholder="HH:mm (e.g. 14:30)"
              placeholderTextColor="#6B7280"
              className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-xs font-semibold mb-5 font-mono"
            />

            <TouchableOpacity
              onPress={() => {
                triggerHaptic.selection();
                setDateTimeModalOpen(false);
              }}
              className="bg-primary py-2.5 rounded-lg items-center active:opacity-80"
            >
              <Text className="text-[#0F1012] font-bold text-xs">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
