import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { TransactionType } from '../../src/types';
import { formatCurrency } from '../../src/services/currency';
import { HapticKeypad } from '../../src/components/keypad/HapticKeypad';
import { Icon } from '../../src/components/ui/Icon';
import { triggerHaptic } from '../../src/services/haptics';
import { X, Calendar, Edit3, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

export default function QuickAddModal() {
  const router = useRouter();

  const { addTransaction } = useTransactionStore();
  const { wallets } = useWalletStore();
  const { getExpenseCategories, getIncomeCategories } = useCategoryStore();
  const currency = useSettingsStore((s) => s.currency);

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || 'wallet_cash');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [payee, setPayee] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  const categories = type === 'expense' ? getExpenseCategories() : getIncomeCategories();

  // Evaluate amount string (e.g. "12.50+4.20" -> 16.70)
  const evaluatedAmount = useMemo(() => {
    if (!amountStr) return 0;
    try {
      // Safe math evaluator for + and - operations only
      const sanitized = amountStr.replace(/[^0-9.+-]/g, '');
      if (!sanitized) return 0;
      // Evaluate tokens
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

    const defaultPayee = payee.trim() || (type === 'income' ? 'Income Deposit' : 'General Expense');

    addTransaction({
      walletId: selectedWalletId,
      categoryId: selectedCategoryId || null,
      amount: evaluatedAmount,
      type,
      payee: defaultPayee,
      note: note.trim() || null,
      transactionDate: dateStr,
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
          <X size={24} color="#94A3B8" />
        </TouchableOpacity>

        {/* Expense vs Income Toggle */}
        <View className="flex-row bg-background-card p-1 rounded-2xl border border-background-border">
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              setType('expense');
              setSelectedCategoryId('');
            }}
            className={`flex-row items-center px-4 py-1.5 rounded-xl ${
              type === 'expense' ? 'bg-expense' : ''
            }`}
          >
            <ArrowUpRight size={14} color={type === 'expense' ? '#FFFFFF' : '#94A3B8'} />
            <Text
              className={`text-xs font-bold ml-1.5 ${
                type === 'expense' ? 'text-white' : 'text-content-secondary'
              }`}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              setType('income');
              setSelectedCategoryId('');
            }}
            className={`flex-row items-center px-4 py-1.5 rounded-xl ${
              type === 'income' ? 'bg-primary' : ''
            }`}
          >
            <ArrowDownLeft size={14} color={type === 'income' ? '#090A0F' : '#94A3B8'} />
            <Text
              className={`text-xs font-bold ml-1.5 ${
                type === 'income' ? 'text-background' : 'text-content-secondary'
              }`}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {/* Amount Display */}
        <View className="items-center justify-center my-4">
          <Text className="text-content-tertiary text-xs font-semibold uppercase tracking-wider mb-1">
            {type === 'expense' ? 'Amount to Spend' : 'Amount to Receive'}
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className={`text-4xl font-extrabold tracking-tight ${
                type === 'expense' ? 'text-expense' : 'text-primary'
              }`}
            >
              {amountStr ? `${type === 'expense' ? '-' : '+'}${amountStr}` : '0.00'}
            </Text>
            <Text className="text-content-secondary text-base font-semibold ml-2">{currency}</Text>
          </View>
          {amountStr.includes('+') || amountStr.includes('-') ? (
            <Text className="text-content-secondary text-xs mt-1">
              Evaluates to: {formatCurrency(evaluatedAmount, currency)}
            </Text>
          ) : null}
        </View>

        {/* Wallet Picker Horizontal Carousel */}
        <View className="mb-4">
          <Text className="text-content-tertiary text-[11px] font-semibold uppercase tracking-wider mb-2">
            Account / Wallet
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-1">
            {wallets.map((w) => {
              const isSelected = selectedWalletId === w.id;
              return (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedWalletId(w.id);
                  }}
                  className={`flex-row items-center px-3.5 py-2.5 rounded-2xl mx-1 border ${
                    isSelected
                      ? 'bg-primary/15 border-primary'
                      : 'bg-background-card border-background-border'
                  }`}
                >
                  <Icon name={w.icon} size={16} color={isSelected ? '#10B981' : w.color} />
                  <View className="ml-2">
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-primary' : 'text-content-primary'
                      }`}
                    >
                      {w.name}
                    </Text>
                    <Text className="text-content-tertiary text-[10px]">
                      {formatCurrency(w.balance, w.currency)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Picker Chips */}
        <View className="mb-4">
          <Text className="text-content-tertiary text-[11px] font-semibold uppercase tracking-wider mb-2">
            Category
          </Text>
          <View className="flex-row flex-wrap">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedCategoryId(cat.id);
                  }}
                  className={`flex-row items-center px-3 py-2 rounded-xl mr-2 mb-2 border ${
                    isSelected
                      ? 'bg-primary/20 border-primary'
                      : 'bg-background-card border-background-border'
                  }`}
                >
                  <Icon name={cat.icon} size={15} color={isSelected ? '#10B981' : cat.color} />
                  <Text
                    className={`text-xs font-semibold ml-1.5 ${
                      isSelected ? 'text-primary' : 'text-content-primary'
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Merchant / Payee Input */}
        <View className="mb-3">
          <View className="flex-row items-center bg-background-card border border-background-border rounded-2xl px-3.5 py-2.5">
            <Edit3 size={16} color="#64748B" />
            <TextInput
              value={payee}
              onChangeText={setPayee}
              placeholder={type === 'expense' ? 'Merchant / Payee (e.g. Starbucks)' : 'Income Source'}
              placeholderTextColor="#64748B"
              className="flex-1 ml-2.5 text-content-primary text-xs font-medium"
            />
          </View>
        </View>

        {/* Note / Tag Input */}
        <View className="mb-3">
          <View className="flex-row items-center bg-background-card border border-background-border rounded-2xl px-3.5 py-2.5">
            <Calendar size={16} color="#64748B" />
            <TextInput
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#64748B"
              className="flex-1 ml-2.5 text-content-primary text-xs font-medium"
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
    </SafeAreaView>
  );
}
