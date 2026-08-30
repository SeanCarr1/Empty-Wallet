import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudgetStore } from '../../src/stores/useBudgetStore';
import { useCategoryStore } from '../../src/stores/useCategoryStore';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { formatCurrency } from '../../src/services/currency';
import { calculateCategoryBudgetStatus } from '../../src/services/budgetEngine';
import { Icon } from '../../src/components/ui/Icon';
import { Plus, Target, CreditCard, Sparkles, AlertTriangle, Trash2 } from 'lucide-react-native';
import { triggerHaptic } from '../../src/services/haptics';

export default function BudgetsScreen() {
  const { budgets, goals, subscriptions, setCategoryBudget, deleteBudget, addGoal, contributeToGoal, deleteGoal, addSubscription, deleteSubscription } = useBudgetStore();
  const { categories, getExpenseCategories } = useCategoryStore();
  const { transactions } = useTransactionStore();
  const { wallets } = useWalletStore();
  const currency = useSettingsStore((s) => s.currency);

  const [activeTab, setActiveTab] = useState<'budgets' | 'goals' | 'subscriptions'>('budgets');

  // Budget Modal State
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState('');
  const [budgetLimitInput, setBudgetLimitInput] = useState('');

  // Goal Modal State
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('');

  // Goal Contribution Modal
  const [contribModalVisible, setContribModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [contribAmount, setContribAmount] = useState('');

  // Subscription Modal State
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [subName, setSubName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subCatId, setSubCatId] = useState('');
  const [subWalletId, setSubWalletId] = useState('');

  const expenseCategories = getExpenseCategories();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const handleSaveBudget = () => {
    const amount = parseFloat(budgetLimitInput);
    if (!selectedCatId || isNaN(amount) || amount <= 0) {
      triggerHaptic.error();
      return;
    }
    triggerHaptic.success();
    setCategoryBudget(selectedCatId, amount);
    setBudgetModalVisible(false);
    setSelectedCatId('');
    setBudgetLimitInput('');
  };

  const handleSaveGoal = () => {
    const target = parseFloat(goalTarget);
    if (!goalName || isNaN(target) || target <= 0) {
      triggerHaptic.error();
      return;
    }
    triggerHaptic.success();
    addGoal({
      name: goalName,
      targetAmount: target,
      targetDate: goalDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      icon: 'Target',
      color: '#C69230',
    });
    setGoalModalVisible(false);
    setGoalName('');
    setGoalTarget('');
    setGoalDate('');
  };

  const handleContribute = () => {
    const amount = parseFloat(contribAmount);
    if (!selectedGoalId || isNaN(amount) || amount <= 0) {
      triggerHaptic.error();
      return;
    }
    triggerHaptic.success();
    contributeToGoal(selectedGoalId, amount);
    setContribModalVisible(false);
    setSelectedGoalId('');
    setContribAmount('');
  };

  const handleSaveSubscription = () => {
    const amount = parseFloat(subAmount);
    if (!subName || isNaN(amount) || amount <= 0 || !subCatId || !subWalletId) {
      triggerHaptic.error();
      return;
    }
    triggerHaptic.success();
    addSubscription({
      name: subName,
      amount,
      walletId: subWalletId,
      categoryId: subCatId,
      billingCycle: 'monthly',
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      autoLog: false,
      reminderEnabled: true,
    });
    setSubModalVisible(false);
    setSubName('');
    setSubAmount('');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-5 pt-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-content-primary">Budgets & Targets</Text>
            <Text className="text-content-secondary text-xs mt-0.5">
              Category caps, sinking funds & recurring bills
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.selection();
              if (activeTab === 'budgets') setBudgetModalVisible(true);
              else if (activeTab === 'goals') setGoalModalVisible(true);
              else setSubModalVisible(true);
            }}
            className="w-10 h-10 rounded-2xl bg-primary items-center justify-center shadow-md shadow-primary/20"
          >
            <Plus size={22} color="#F5F2EB" strokeWidth={2.6} />
          </TouchableOpacity>
        </View>

        {/* Tab Segment Switcher */}
        <View className="flex-row bg-background-card p-1 rounded-2xl mb-5 border border-background-border">
          {(['budgets', 'goals', 'subscriptions'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'budgets' ? 'Category Caps' : tab === 'goals' ? 'Savings Goals' : 'Subscriptions';
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.7}
                onPress={() => {
                  triggerHaptic.selection();
                  setActiveTab(tab);
                }}
                className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
                  isActive ? 'bg-background-elevated border border-background-border' : ''
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isActive ? 'text-content-primary' : 'text-content-tertiary'
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {/* TAB 1: CATEGORY BUDGETS */}
          {activeTab === 'budgets' && (
            <View>
              {budgets.length === 0 ? (
                <View className="bg-background-card rounded-3xl p-8 items-center justify-center border border-background-border">
                  <Target size={36} color="#948B7E" />
                  <Text className="text-content-primary font-bold text-base mt-3">No Category Caps Set</Text>
                  <Text className="text-content-secondary text-xs text-center mt-1 mb-4">
                    Set limits for Dining, Groceries, or Transport to prevent overspending.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setBudgetModalVisible(true)}
                    className="bg-primary px-5 py-2.5 rounded-xl"
                  >
                    <Text className="text-content-primary font-bold text-xs">Set Category Limit</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                budgets.map((b) => {
                  const cat = categoryMap.get(b.categoryId);
                  const status = calculateCategoryBudgetStatus(b.categoryId, b.limitAmount, transactions);

                  const isOver = status.warningLevel === 'over';
                  const isWarning = status.warningLevel === 'warning';

                  return (
                    <View
                      key={b.id}
                      className="bg-background-card p-4 rounded-2xl border border-background-border mb-3"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <View
                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${cat?.color || '#2A9D60'}20` }}
                          >
                            <Icon name={cat?.icon || 'Tag'} size={20} color={cat?.color || '#2A9D60'} />
                          </View>
                          <View>
                            <Text className="text-content-primary font-bold text-sm">
                              {cat?.name || 'Category'}
                            </Text>
                            <Text className="text-content-tertiary text-xs">
                              {formatCurrency(status.spent, currency)} of {formatCurrency(b.limitAmount, currency)}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          {isOver && (
                            <View className="flex-row items-center bg-expense/10 px-2 py-1 rounded-full mr-2">
                              <AlertTriangle size={12} color="#DC4C38" />
                              <Text className="text-expense text-[10px] font-bold ml-1">Over Limit</Text>
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => {
                              triggerHaptic.heavy();
                              deleteBudget(b.id);
                            }}
                            className="p-1.5"
                          >
                            <Trash2 size={16} color="#948B7E" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View className="h-2 w-full bg-background-elevated rounded-full overflow-hidden">
                        <View
                          className={`h-full rounded-full ${
                            isOver ? 'bg-expense' : isWarning ? 'bg-accent-amber' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(100, status.percentage)}%` }}
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 2: GOALS / SINKING FUNDS */}
          {activeTab === 'goals' && (
            <View>
              {goals.length === 0 ? (
                <View className="bg-background-card rounded-3xl p-8 items-center justify-center border border-background-border">
                  <Sparkles size={36} color="#C69230" />
                  <Text className="text-content-primary font-bold text-base mt-3">No Sinking Funds</Text>
                  <Text className="text-content-secondary text-xs text-center mt-1 mb-4">
                    Create target buckets for Emergency Funds, Vacations, or new gadgets.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setGoalModalVisible(true)}
                    className="bg-accent-gold px-5 py-2.5 rounded-xl"
                  >
                    <Text className="text-content-primary font-bold text-xs">Create Savings Goal</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                goals.map((g) => {
                  const percent = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
                  return (
                    <View
                      key={g.id}
                      className="bg-background-card p-4 rounded-2xl border border-background-border mb-3"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                          <View
                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${g.color}20` }}
                          >
                            <Icon name={g.icon} size={20} color={g.color} />
                          </View>
                          <View>
                            <Text className="text-content-primary font-bold text-sm">{g.name}</Text>
                            <Text className="text-content-tertiary text-xs">
                              {formatCurrency(g.currentAmount, currency)} of {formatCurrency(g.targetAmount, currency)}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedGoalId(g.id);
                              setContribModalVisible(true);
                            }}
                            className="bg-accent-gold/20 px-3 py-1.5 rounded-xl mr-2"
                          >
                            <Text className="text-accent-gold font-semibold text-xs">+ Save</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              triggerHaptic.heavy();
                              deleteGoal(g.id);
                            }}
                            className="p-1.5"
                          >
                            <Trash2 size={16} color="#948B7E" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View className="h-2 w-full bg-background-elevated rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full bg-accent-gold"
                          style={{ width: `${percent}%` }}
                        />
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-content-tertiary text-[11px]">{percent.toFixed(0)}% reached</Text>
                        <Text className="text-content-tertiary text-[11px]">Target: {g.targetDate}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 3: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <View>
              {subscriptions.length === 0 ? (
                <View className="bg-background-card rounded-3xl p-8 items-center justify-center border border-background-border">
                  <CreditCard size={36} color="#4338CA" />
                  <Text className="text-content-primary font-bold text-base mt-3">No Subscriptions Tracked</Text>
                  <Text className="text-content-secondary text-xs text-center mt-1 mb-4">
                    Track recurring Netflix, Spotify, Gym, or Utility bills in one place.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSubModalVisible(true)}
                    className="bg-accent-blue px-5 py-2.5 rounded-xl"
                  >
                    <Text className="text-content-primary font-bold text-xs">Add Subscription</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                subscriptions.map((s) => {
                  const cat = categoryMap.get(s.categoryId);
                  return (
                    <View
                      key={s.id}
                      className="flex-row items-center justify-between p-4 bg-background-card border border-background-border rounded-2xl mb-3"
                    >
                      <View className="flex-row items-center flex-1 mr-3">
                        <View
                          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                          style={{ backgroundColor: `${cat?.color || '#4338CA'}20` }}
                        >
                          <Icon name={cat?.icon || 'CreditCard'} size={20} color={cat?.color || '#4338CA'} />
                        </View>
                        <View>
                          <Text className="text-content-primary font-bold text-sm">{s.name}</Text>
                          <Text className="text-content-tertiary text-xs">
                            Next: {s.nextBillingDate} • {s.billingCycle}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end mr-3">
                        <Text className="text-content-primary font-bold text-sm">
                          {formatCurrency(s.amount, currency)}
                        </Text>
                        <Text className="text-primary text-[10px] font-semibold">Active</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          triggerHaptic.heavy();
                          deleteSubscription(s.id);
                        }}
                        className="p-1.5"
                      >
                        <Trash2 size={16} color="#948B7E" />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>

        {/* MODAL: ADD BUDGET */}
        <Modal visible={budgetModalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-background-card rounded-t-3xl p-6 border-t border-background-border">
              <Text className="text-xl font-bold text-content-primary mb-1">Set Category Limit</Text>
              <Text className="text-content-secondary text-xs mb-4">Pick a category and assign a monthly spending limit</Text>

              {/* Category Picker */}
              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                {expenseCategories.map((c) => {
                  const isSelected = selectedCatId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => setSelectedCatId(c.id)}
                      className={`flex-row items-center px-3 py-2 rounded-xl mr-2 border ${
                        isSelected ? 'bg-primary/20 border-primary' : 'bg-background-elevated border-background-border'
                      }`}
                    >
                      <Icon name={c.icon} size={16} color={isSelected ? '#2A9D60' : c.color} />
                      <Text className={`text-xs font-semibold ml-2 ${isSelected ? 'text-primary' : 'text-content-primary'}`}>
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2">Monthly Limit ({currency})</Text>
              <TextInput
                value={budgetLimitInput}
                onChangeText={setBudgetLimitInput}
                keyboardType="numeric"
                placeholder="e.g. 5000"
                placeholderTextColor="#948B7E"
                className="bg-background-elevated border border-background-border rounded-xl p-3.5 text-content-primary text-base font-semibold mb-6"
              />

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setBudgetModalVisible(false)}
                  className="flex-1 bg-background-elevated py-3.5 rounded-xl items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveBudget}
                  className="flex-1 bg-primary py-3.5 rounded-xl items-center shadow-lg shadow-primary/20"
                >
                  <Text className="text-content-primary font-bold">Save Budget</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: ADD GOAL */}
        <Modal visible={goalModalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-background-card rounded-t-3xl p-6 border-t border-background-border">
              <Text className="text-xl font-bold text-content-primary mb-1">New Savings Target</Text>
              <Text className="text-content-secondary text-xs mb-4">Create a sinking fund bucket</Text>

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Goal Name</Text>
              <TextInput
                value={goalName}
                onChangeText={setGoalName}
                placeholder="e.g. Vacation to Palawan"
                placeholderTextColor="#948B7E"
                className="bg-background-elevated border border-background-border rounded-xl p-3.5 text-content-primary text-sm font-semibold mb-3"
              />

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Target Amount ({currency})</Text>
              <TextInput
                value={goalTarget}
                onChangeText={setGoalTarget}
                keyboardType="numeric"
                placeholder="e.g. 25000"
                placeholderTextColor="#948B7E"
                className="bg-background-elevated border border-background-border rounded-xl p-3.5 text-content-primary text-base font-semibold mb-6"
              />

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setGoalModalVisible(false)}
                  className="flex-1 bg-background-elevated py-3.5 rounded-xl items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveGoal}
                  className="flex-1 bg-accent-gold py-3.5 rounded-xl items-center shadow-lg shadow-accent-gold/20"
                >
                  <Text className="text-content-primary font-bold">Create Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: CONTRIBUTE TO GOAL */}
        <Modal visible={contribModalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-background-card rounded-t-3xl p-6 border-t border-background-border">
              <Text className="text-xl font-bold text-content-primary mb-1">Add Savings</Text>
              <Text className="text-content-secondary text-xs mb-4">Deposit funds into this goal</Text>

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Amount to Add ({currency})</Text>
              <TextInput
                value={contribAmount}
                onChangeText={setContribAmount}
                keyboardType="numeric"
                placeholder="e.g. 1000"
                placeholderTextColor="#948B7E"
                className="bg-background-elevated border border-background-border rounded-xl p-3.5 text-content-primary text-base font-semibold mb-6"
              />

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setContribModalVisible(false)}
                  className="flex-1 bg-background-elevated py-3.5 rounded-xl items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleContribute}
                  className="flex-1 bg-accent-gold py-3.5 rounded-xl items-center shadow-lg shadow-accent-gold/20"
                >
                  <Text className="text-content-primary font-bold">Add Deposit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: ADD SUBSCRIPTION */}
        <Modal visible={subModalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-background-card rounded-t-3xl p-6 border-t border-background-border">
              <Text className="text-xl font-bold text-content-primary mb-1">Track Recurring Bill</Text>
              <Text className="text-content-secondary text-xs mb-4">Add monthly subscription or utility</Text>

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Subscription Name</Text>
              <TextInput
                value={subName}
                onChangeText={setSubName}
                placeholder="e.g. Netflix Premium"
                placeholderTextColor="#948B7E"
                className="bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-sm font-semibold mb-3"
              />

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Monthly Cost ({currency})</Text>
              <TextInput
                value={subAmount}
                onChangeText={setSubAmount}
                keyboardType="numeric"
                placeholder="e.g. 549"
                placeholderTextColor="#948B7E"
                className="bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-sm font-semibold mb-3"
              />

              {/* Wallet Picker */}
              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Charged To Wallet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => setSubWalletId(w.id)}
                    className={`px-3 py-2 rounded-xl mr-2 border ${
                      subWalletId === w.id ? 'bg-primary/20 border-primary' : 'bg-background-elevated border-background-border'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${subWalletId === w.id ? 'text-primary' : 'text-content-primary'}`}>
                      {w.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Category Picker */}
              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6">
                {expenseCategories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSubCatId(c.id)}
                    className={`px-3 py-2 rounded-xl mr-2 border ${
                      subCatId === c.id ? 'bg-accent-blue/20 border-accent-blue' : 'bg-background-elevated border-background-border'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${subCatId === c.id ? 'text-accent-blue' : 'text-content-primary'}`}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => setSubModalVisible(false)}
                  className="flex-1 bg-background-elevated py-3.5 rounded-xl items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveSubscription}
                  className="flex-1 bg-accent-blue py-3.5 rounded-xl items-center shadow-lg shadow-accent-blue/20"
                >
                  <Text className="text-content-primary font-bold">Track Bill</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
