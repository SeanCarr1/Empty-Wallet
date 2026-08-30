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
import { X, Calendar, Clock, Edit3, ChevronDown, Check, User, CreditCard } from 'lucide-react-native';
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

  const activeCategories = type === 'expense' ? getExpenseCategories() : getIncomeCategories();
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
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-background-border/50">
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          className="p-2 -ml-2 rounded-full"
        >
          <X size={24} color="#D6CFBF" />
        </TouchableOpacity>

        {/* 1. Record Type Switcher */}
        <View className="flex-row bg-background-card p-1 rounded-2xl border border-background-border">
          {(['expense', 'income', 'transfer'] as const).map((t) => {
            const isSelected = type === t;
            const label = t === 'expense' ? 'Expense' : t === 'income' ? 'Income' : 'Transfer';
            const bgClass =
              t === 'expense' ? 'bg-expense' : t === 'income' ? 'bg-primary' : 'bg-accent-blue';
            const textClass = isSelected ? 'text-content-primary' : 'text-content-secondary';

            return (
              <TouchableOpacity
                key={t}
                onPress={() => {
                  triggerHaptic.selection();
                  setType(t);
                }}
                className={`px-3 py-1.5 rounded-xl ${isSelected ? bgClass : ''}`}
              >
                <Text className={`text-xs font-bold ${textClass}`}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {/* 2. Amount Display */}
        <View className="items-center justify-center my-3">
          <Text className="text-content-tertiary text-xs font-semibold uppercase tracking-wider mb-1">
            {type === 'expense'
              ? 'Amount to Spend'
              : type === 'income'
              ? 'Amount to Receive'
              : 'Transfer Amount'}
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className={`text-4xl font-extrabold tracking-tight ${
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
            <Text className="text-content-secondary text-base font-semibold ml-2">{currency}</Text>
          </View>
          {amountStr.includes('+') || amountStr.includes('-') ? (
            <Text className="text-content-secondary text-xs mt-1">
              Evaluates to: {formatCurrency(evaluatedAmount, currency)}
            </Text>
          ) : null}
        </View>

        {/* 3. Wallet Dropdown / Selector */}
        <View className="mb-3">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
            {type === 'transfer' ? 'From Source Wallet' : 'Wallet / Account'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setWalletDropdownOpen(!walletDropdownOpen)}
            className="flex-row items-center justify-between bg-background-card border border-background-border rounded-2xl p-3"
          >
            <View className="flex-row items-center">
              <View
                className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
                style={{ backgroundColor: `${selectedWallet?.color || '#2A9D60'}20` }}
              >
                <Icon
                  name={selectedWallet?.icon || 'Wallet'}
                  size={16}
                  color={selectedWallet?.color || '#2A9D60'}
                />
              </View>
              <Text className="text-content-primary font-bold text-xs">
                {selectedWallet?.name || 'Select Wallet'}
              </Text>
              <Text className="text-content-tertiary text-[11px] ml-2">
                ({formatCurrency(selectedWallet?.balance || 0, selectedWallet?.currency)})
              </Text>
            </View>
            <ChevronDown size={16} color="#948B7E" />
          </TouchableOpacity>

          {walletDropdownOpen && (
            <View className="bg-background-elevated border border-background-border rounded-2xl p-2 mt-1">
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedWalletId(w.id);
                    setWalletDropdownOpen(false);
                  }}
                  className="flex-row items-center justify-between p-2.5 rounded-xl active:bg-background-card"
                >
                  <View className="flex-row items-center">
                    <Icon name={w.icon} size={16} color={w.color} />
                    <Text className="text-content-primary text-xs font-semibold ml-2">{w.name}</Text>
                  </View>
                  <Text className="text-content-tertiary text-xs">
                    {formatCurrency(w.balance, w.currency)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 3b. Destination Wallet (If Transfer) */}
        {type === 'transfer' && (
          <View className="mb-3">
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
              To Destination Wallet
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setDestDropdownOpen(!destDropdownOpen)}
              className="flex-row items-center justify-between bg-background-card border border-background-border rounded-2xl p-3"
            >
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
                  style={{ backgroundColor: `${destWallet?.color || '#4338CA'}20` }}
                >
                  <Icon
                    name={destWallet?.icon || 'Landmark'}
                    size={16}
                    color={destWallet?.color || '#4338CA'}
                  />
                </View>
                <Text className="text-content-primary font-bold text-xs">
                  {destWallet?.name || 'Select Destination Wallet'}
                </Text>
              </View>
              <ChevronDown size={16} color="#948B7E" />
            </TouchableOpacity>

            {destDropdownOpen && (
              <View className="bg-background-elevated border border-background-border rounded-2xl p-2 mt-1">
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
                      className="flex-row items-center justify-between p-2.5 rounded-xl active:bg-background-card"
                    >
                      <View className="flex-row items-center">
                        <Icon name={w.icon} size={16} color={w.color} />
                        <Text className="text-content-primary text-xs font-semibold ml-2">{w.name}</Text>
                      </View>
                      <Text className="text-content-tertiary text-xs">
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
          <View className="mb-3">
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
              Category
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setCategoryModalOpen(true)}
              className="flex-row items-center justify-between bg-background-card border border-background-border rounded-2xl p-3"
            >
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-xl items-center justify-center mr-2.5"
                  style={{ backgroundColor: `${selectedCategory?.color || '#2A9D60'}20` }}
                >
                  <Icon
                    name={selectedCategory?.icon || 'Tag'}
                    size={16}
                    color={selectedCategory?.color || '#2A9D60'}
                  />
                </View>
                <Text className="text-content-primary font-bold text-xs">
                  {selectedCategory?.name || 'Choose Category'}
                </Text>
              </View>
              <ChevronDown size={16} color="#948B7E" />
            </TouchableOpacity>
          </View>
        )}

        {/* 5. Date & Time Calendar Selector */}
        <View className="mb-3">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
            Date & Time
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setDateTimeModalOpen(true)}
            className="flex-row items-center justify-between bg-background-card border border-background-border rounded-2xl p-3"
          >
            <View className="flex-row items-center">
              <Calendar size={16} color="#2A9D60" />
              <Text className="text-content-primary font-bold text-xs ml-2">{dateStr}</Text>
              <Text className="text-content-muted mx-2">•</Text>
              <Clock size={16} color="#D6CFBF" />
              <Text className="text-content-primary font-bold text-xs ml-2">{timeStr}</Text>
            </View>
            <Edit3 size={15} color="#948B7E" />
          </TouchableOpacity>
        </View>

        {/* 6. Other Details (Payer, Payee, Payment Type, Note) */}
        <View className="mb-3">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">
            Payment Type & Merchant Details
          </Text>

          {/* Payment Type Dropdown */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPaymentDropdownOpen(!paymentDropdownOpen)}
            className="flex-row items-center justify-between bg-background-card border border-background-border rounded-2xl p-3 mb-2"
          >
            <View className="flex-row items-center">
              <CreditCard size={16} color="#C69230" />
              <Text className="text-content-primary font-semibold text-xs ml-2">
                Payment Type: {PAYMENT_OPTIONS.find((p) => p.type === paymentType)?.label || 'Cash'}
              </Text>
            </View>
            <ChevronDown size={16} color="#948B7E" />
          </TouchableOpacity>

          {paymentDropdownOpen && (
            <View className="bg-background-elevated border border-background-border rounded-2xl p-2 mb-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.type}
                  onPress={() => {
                    triggerHaptic.selection();
                    setPaymentType(opt.type);
                    setPaymentDropdownOpen(false);
                  }}
                  className="flex-row items-center justify-between p-2.5 rounded-xl active:bg-background-card"
                >
                  <Text className="text-content-primary text-xs font-semibold">{opt.label}</Text>
                  {paymentType === opt.type && <Check size={16} color="#2A9D60" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Payee / Merchant */}
          <View className="flex-row items-center bg-background-card border border-background-border rounded-2xl px-3.5 py-2.5 mb-2">
            <Edit3 size={16} color="#948B7E" />
            <TextInput
              value={payee}
              onChangeText={setPayee}
              placeholder={type === 'expense' ? 'Payee / Merchant (e.g. Starbucks, Shell)' : 'Income Source'}
              placeholderTextColor="#948B7E"
              className="flex-1 ml-2 text-content-primary text-xs font-medium"
            />
          </View>

          {/* Payer (Optional) */}
          <View className="flex-row items-center bg-background-card border border-background-border rounded-2xl px-3.5 py-2.5 mb-2">
            <User size={16} color="#948B7E" />
            <TextInput
              value={payer}
              onChangeText={setPayer}
              placeholder="Payer / Spender (Optional)"
              placeholderTextColor="#948B7E"
              className="flex-1 ml-2 text-content-primary text-xs font-medium"
            />
          </View>

          {/* Note / Memo */}
          <View className="flex-row items-center bg-background-card border border-background-border rounded-2xl px-3.5 py-2.5 mb-2">
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add note, receipt tags, or memo (Optional)..."
              placeholderTextColor="#948B7E"
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
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-background-card rounded-t-3xl p-6 border-t border-background-border max-h-[75%]">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-content-primary">Choose Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalOpen(false)}>
                <X size={20} color="#D6CFBF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap">
                {activeCategories.map((c) => {
                  const isSelected = selectedCategoryId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => {
                        triggerHaptic.selection();
                        setSelectedCategoryId(c.id);
                        setCategoryModalOpen(false);
                      }}
                      className={`flex-row items-center w-[48%] p-3 rounded-2xl mr-2 mb-2.5 border ${
                        isSelected
                          ? 'bg-primary/20 border-primary'
                          : 'bg-background-elevated border-background-border'
                      }`}
                    >
                      <Icon name={c.icon} size={18} color={isSelected ? '#2A9D60' : c.color} />
                      <Text
                        className={`text-xs font-semibold ml-2 ${
                          isSelected ? 'text-primary' : 'text-content-primary'
                        }`}
                        numberOfLines={1}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DATE & TIME PICKER MODAL */}
      <Modal visible={dateTimeModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-background-card rounded-t-3xl p-6 border-t border-background-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-content-primary">Select Date & Time</Text>
              <TouchableOpacity onPress={() => setDateTimeModalOpen(false)}>
                <X size={20} color="#D6CFBF" />
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2">Quick Date</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity
                onPress={() => setDateStr(format(new Date(), 'yyyy-MM-dd'))}
                className="flex-1 bg-background-elevated py-2.5 rounded-xl items-center mr-2 border border-background-border"
              >
                <Text className="text-content-primary font-bold text-xs">Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setDateStr(format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'))
                }
                className="flex-1 bg-background-elevated py-2.5 rounded-xl items-center mr-2 border border-background-border"
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
              placeholderTextColor="#948B7E"
              className="bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-xs font-semibold mb-3"
            />

            {/* Time Input */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Time (HH:mm)</Text>
            <TextInput
              value={timeStr}
              onChangeText={setTimeStr}
              placeholder="HH:mm (e.g. 14:30)"
              placeholderTextColor="#948B7E"
              className="bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-xs font-semibold mb-6"
            />

            <TouchableOpacity
              onPress={() => {
                triggerHaptic.selection();
                setDateTimeModalOpen(false);
              }}
              className="bg-primary py-3.5 rounded-xl items-center shadow-lg shadow-primary/20"
            >
              <Text className="text-content-primary font-bold text-xs">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
