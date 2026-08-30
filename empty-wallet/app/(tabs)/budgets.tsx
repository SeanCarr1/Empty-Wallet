import React, { useState, useMemo } from 'react';
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
import { MACRO_CATEGORY_GROUPS } from '../../src/constants/categories';
import { Plus, Target, CreditCard, Sparkles, AlertTriangle, Trash2, Check, X, ChevronDown, Search } from 'lucide-react-native';
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
  const [budgetCatPickerOpen, setBudgetCatPickerOpen] = useState(false);
  const [budgetCatSearch, setBudgetCatSearch] = useState('');

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
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const selectedCat = selectedCatId ? categoryMap.get(selectedCatId) : null;

  const groupedExpenseCategories = useMemo(() => {
    const groups: { group: (typeof MACRO_CATEGORY_GROUPS)[number]; items: typeof expenseCategories }[] = [];
    for (const macroGroup of MACRO_CATEGORY_GROUPS) {
      if (macroGroup.type === 'income') continue;
      const items = expenseCategories.filter(
        (c) => (c.group || 'others') === macroGroup.id
      );
      if (items.length > 0) {
        groups.push({ group: macroGroup, items });
      }
    }
    return groups;
  }, [expenseCategories]);

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
      <View className="flex-1 px-4 pt-2">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3.5">
          <View>
            <Text className="text-xl font-bold text-content-primary">Budgets & Targets</Text>
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
            className="flex-row items-center bg-primary px-3 py-1.5 rounded-lg active:opacity-80"
          >
            <Plus size={15} color="#0F1012" strokeWidth={2.8} />
            <Text className="text-[#0F1012] font-bold text-xs ml-1">Add</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Segment Switcher */}
        <View className="flex-row bg-background-card p-1 rounded-lg mb-4 border border-background-border">
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
                className={`flex-1 py-2 rounded-md items-center justify-center ${
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* TAB 1: CATEGORY BUDGETS */}
          {activeTab === 'budgets' && (
            <View>
              {budgets.length === 0 ? (
                <View className="bg-background-card rounded-xl p-6 items-center justify-center border border-background-border">
                  <Target size={32} color="#6B7280" />
                  <Text className="text-content-primary font-bold text-sm mt-2.5">No Category Caps Set</Text>
                  <Text className="text-content-secondary text-xs text-center mt-1 mb-3.5">
                    Set limits for Dining, Groceries, or Transport to prevent overspending.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setBudgetModalVisible(true)}
                    className="bg-primary px-4 py-2 rounded-lg"
                  >
                    <Text className="text-[#0F1012] font-bold text-xs">Set Category Limit</Text>
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
                      className="bg-background-card p-3.5 rounded-xl border border-background-border mb-2.5"
                    >
                      <View className="flex-row items-center justify-between mb-2.5">
                        <View className="flex-row items-center">
                          <View
                            className="w-9 h-9 rounded-lg items-center justify-center mr-2.5"
                            style={{ backgroundColor: `${cat?.color || '#10B981'}20` }}
                          >
                            <Icon name={cat?.icon || 'Tag'} size={18} color={cat?.color || '#10B981'} />
                          </View>
                          <View>
                            <Text className="text-content-primary font-bold text-sm">
                              {cat?.name || 'Category'}
                            </Text>
                            <Text className="text-content-tertiary text-xs font-mono">
                              {formatCurrency(status.spent, currency)} of {formatCurrency(b.limitAmount, currency)}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          {isOver && (
                            <View className="flex-row items-center bg-expense/15 px-2 py-0.5 rounded-md mr-2 border border-expense/30">
                              <AlertTriangle size={11} color="#EF4444" />
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
                            <Trash2 size={15} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden">
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
                <View className="bg-background-card rounded-xl p-6 items-center justify-center border border-background-border">
                  <Sparkles size={32} color="#F59E0B" />
                  <Text className="text-content-primary font-bold text-sm mt-2.5">No Sinking Funds</Text>
                  <Text className="text-content-secondary text-xs text-center mt-1 mb-3.5">
                    Create target buckets for Emergency Funds, Vacations, or new gadgets.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setGoalModalVisible(true)}
                    className="bg-accent-gold px-4 py-2 rounded-lg"
                  >
                    <Text className="text-[#0F1012] font-bold text-xs">Create Savings Goal</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                goals.map((g) => {
                  const percent = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
                  return (
                    <View
                      key={g.id}
                      className="bg-background-card p-3.5 rounded-xl border border-background-border mb-2.5"
                    >
                      <View className="flex-row items-center justify-between mb-2.5">
                        <View className="flex-row items-center">
                          <View
                            className="w-9 h-9 rounded-lg items-center justify-center mr-2.5"
                            style={{ backgroundColor: `${g.color || '#F59E0B'}20` }}
                          >
                            <Icon name={g.icon} size={18} color={g.color || '#F59E0B'} />
                          </View>
                          <View>
                            <Text className="text-content-primary font-bold text-sm">{g.name}</Text>
                            <Text className="text-content-tertiary text-xs font-mono">
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
                            className="bg-accent-gold/20 px-2.5 py-1 rounded-md mr-1.5 border border-accent-gold/30"
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
                            <Trash2 size={15} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full bg-accent-gold"
                          style={{ width: `${percent}%` }}
                        />
                      </View>
                      <View className="flex-row justify-between mt-1.5">
                        <Text className="text-content-tertiary text-[10px]">{percent.toFixed(0)}% reached</Text>
                        <Text className="text-content-tertiary text-[10px]">Target: {g.targetDate}</Text>
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
                <View className="bg-background-card rounded-xl p-6 items-center justify-center border border-background-border">
                  <CreditCard size={32} color="#3B82F6" />
                  <Text className="text-content-primary font-bold text-sm mt-2.5">No Subscriptions Tracked</Text>
                  <Text className="text-content-secondary text-xs text-center mt-1 mb-3.5">
                    Track recurring Netflix, Spotify, Gym, or Utility bills in one place.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSubModalVisible(true)}
                    className="bg-accent-blue px-4 py-2 rounded-lg"
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
                      className="flex-row items-center justify-between p-3.5 bg-background-card border border-background-border rounded-xl mb-2.5"
                    >
                      <View className="flex-row items-center flex-1 mr-2.5">
                        <View
                          className="w-9 h-9 rounded-lg items-center justify-center mr-2.5"
                          style={{ backgroundColor: `${cat?.color || '#3B82F6'}20` }}
                        >
                          <Icon name={cat?.icon || 'CreditCard'} size={18} color={cat?.color || '#3B82F6'} />
                        </View>
                        <View>
                          <Text className="text-content-primary font-bold text-sm">{s.name}</Text>
                          <Text className="text-content-tertiary text-xs">
                            Next: {s.nextBillingDate} • {s.billingCycle}
                          </Text>
                        </View>
                      </View>

                      <View className="items-end mr-2">
                        <Text className="text-content-primary font-bold text-sm font-mono">
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
                        <Trash2 size={15} color="#6B7280" />
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
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-background-card rounded-t-2xl p-5 border-t border-background-border max-h-[85%]">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-lg font-bold text-content-primary">Set Category Limit</Text>
                <TouchableOpacity
                  onPress={() => setBudgetModalVisible(false)}
                  className="p-1 rounded-lg"
                >
                  <X size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <Text className="text-content-secondary text-xs mb-3">
                Pick a category and assign a monthly spending limit
              </Text>

              {/* Category Dropdown Button */}
              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Category
              </Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic.selection();
                  setBudgetCatPickerOpen(true);
                }}
                className="bg-background-elevated border border-background-border rounded-lg p-3 mb-4 flex-row items-center justify-between"
              >
                {selectedCat ? (
                  <View className="flex-row items-center">
                    <View
                      className="w-7 h-7 rounded-lg items-center justify-center mr-2.5"
                      style={{ backgroundColor: `${selectedCat.color}20` }}
                    >
                      <Icon name={selectedCat.icon} size={15} color={selectedCat.color} />
                    </View>
                    <View>
                      <Text className="text-content-primary font-bold text-xs">{selectedCat.name}</Text>
                      <Text className="text-content-tertiary text-[10px] capitalize">{selectedCat.group?.replace('_', ' ')}</Text>
                    </View>
                  </View>
                ) : (
                  <Text className="text-content-secondary text-xs">Select Category...</Text>
                )}
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Monthly Limit ({currency})
              </Text>
              <TextInput
                value={budgetLimitInput}
                onChangeText={setBudgetLimitInput}
                keyboardType="numeric"
                placeholder="e.g. 5000"
                placeholderTextColor="#6B7280"
                className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-sm font-semibold mb-4"
              />

              <View className="flex-row space-x-2.5">
                <TouchableOpacity
                  onPress={() => setBudgetModalVisible(false)}
                  className="flex-1 bg-background-elevated py-2.5 rounded-lg items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold text-xs">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveBudget}
                  className="flex-1 bg-primary py-2.5 rounded-lg items-center active:opacity-80"
                >
                  <Text className="text-[#0F1012] font-bold text-xs">Save Budget</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: BUDGET CATEGORY SEARCH PICKER */}
        <Modal visible={budgetCatPickerOpen} animationType="slide" transparent>
          <View className="flex-1 bg-black/85 justify-end">
            <View className="bg-background-card rounded-t-2xl max-h-[80%] p-5 border-t border-background-border">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm font-bold text-content-primary">Select Category</Text>
                <TouchableOpacity onPress={() => setBudgetCatPickerOpen(false)} className="p-1 rounded-lg bg-background-elevated">
                  <X size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View className="flex-row items-center bg-background-elevated px-3 py-2 rounded-lg mb-3 border border-background-border">
                <Search size={15} color="#6B7280" className="mr-2" />
                <TextInput
                  value={budgetCatSearch}
                  onChangeText={setBudgetCatSearch}
                  placeholder="Search categories..."
                  placeholderTextColor="#6B7280"
                  className="flex-1 text-xs text-content-primary p-0"
                />
                {budgetCatSearch ? (
                  <TouchableOpacity onPress={() => setBudgetCatSearch('')}>
                    <X size={14} color="#6B7280" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {groupedExpenseCategories.map(({ group, items }) => {
                  const filteredItems = items.filter((c) =>
                    !budgetCatSearch || c.name.toLowerCase().includes(budgetCatSearch.toLowerCase())
                  );
                  if (filteredItems.length === 0) return null;

                  return (
                    <View key={group.id} className="mb-3.5">
                      <View className="flex-row items-center mb-1.5">
                        <View className="w-5 h-5 rounded-md items-center justify-center mr-2" style={{ backgroundColor: `${group.color}20` }}>
                          <Icon name={group.icon} size={12} color={group.color} />
                        </View>
                        <Text className="text-xs font-bold text-content-tertiary uppercase tracking-wider">{group.label}</Text>
                      </View>

                      <View className="flex-row flex-wrap justify-between">
                        {filteredItems.map((cat) => {
                          const isSel = selectedCatId === cat.id;
                          return (
                            <TouchableOpacity
                              key={cat.id}
                              onPress={() => {
                                triggerHaptic.selection();
                                setSelectedCatId(cat.id);
                                setBudgetCatPickerOpen(false);
                              }}
                              className={`w-[48%] mb-2 p-2 rounded-lg flex-row items-center border ${
                                isSel ? 'bg-primary/20 border-primary' : 'bg-background-elevated border-background-border'
                              }`}
                            >
                              <View className="w-6 h-6 rounded-md items-center justify-center mr-2" style={{ backgroundColor: `${cat.color}20` }}>
                                <Icon name={cat.icon} size={13} color={cat.color} />
                              </View>
                              <Text className={`text-xs font-semibold flex-1 truncate ${isSel ? 'text-primary' : 'text-content-primary'}`} numberOfLines={1}>
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

        {/* MODAL: ADD GOAL */}
        <Modal visible={goalModalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-background-card rounded-t-xl p-5 border-t border-background-border">
              <Text className="text-lg font-bold text-content-primary mb-1">New Savings Target</Text>
              <Text className="text-content-secondary text-xs mb-3.5">Create a sinking fund bucket</Text>

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Goal Name</Text>
              <TextInput
                value={goalName}
                onChangeText={setGoalName}
                placeholder="e.g. Vacation to Palawan"
                placeholderTextColor="#6B7280"
                className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-sm font-semibold mb-2.5"
              />

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Target Amount ({currency})</Text>
              <TextInput
                value={goalTarget}
                onChangeText={setGoalTarget}
                keyboardType="numeric"
                placeholder="e.g. 25000"
                placeholderTextColor="#6B7280"
                className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-base font-semibold mb-5"
              />

              <View className="flex-row space-x-2.5">
                <TouchableOpacity
                  onPress={() => setGoalModalVisible(false)}
                  className="flex-1 bg-background-elevated py-2.5 rounded-lg items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold text-xs">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveGoal}
                  className="flex-1 bg-accent-gold py-2.5 rounded-lg items-center active:opacity-80"
                >
                  <Text className="text-[#0F1012] font-bold text-xs">Create Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: CONTRIBUTE TO GOAL */}
        <Modal visible={contribModalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-background-card rounded-t-xl p-5 border-t border-background-border">
              <Text className="text-lg font-bold text-content-primary mb-1">Add Savings</Text>
              <Text className="text-content-secondary text-xs mb-3.5">Deposit funds into this goal</Text>

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Amount to Add ({currency})</Text>
              <TextInput
                value={contribAmount}
                onChangeText={setContribAmount}
                keyboardType="numeric"
                placeholder="e.g. 1000"
                placeholderTextColor="#6B7280"
                className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-base font-semibold mb-5"
              />

              <View className="flex-row space-x-2.5">
                <TouchableOpacity
                  onPress={() => setContribModalVisible(false)}
                  className="flex-1 bg-background-elevated py-2.5 rounded-lg items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold text-xs">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleContribute}
                  className="flex-1 bg-accent-gold py-2.5 rounded-lg items-center active:opacity-80"
                >
                  <Text className="text-[#0F1012] font-bold text-xs">Add Deposit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL: ADD SUBSCRIPTION */}
        <Modal visible={subModalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/75 justify-end">
            <View className="bg-background-card rounded-t-xl p-5 border-t border-background-border">
              <Text className="text-lg font-bold text-content-primary mb-1">Track Recurring Bill</Text>
              <Text className="text-content-secondary text-xs mb-3.5">Add monthly subscription or utility</Text>

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Subscription Name</Text>
              <TextInput
                value={subName}
                onChangeText={setSubName}
                placeholder="e.g. Netflix Premium"
                placeholderTextColor="#6B7280"
                className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-sm font-semibold mb-2.5"
              />

              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Monthly Cost ({currency})</Text>
              <TextInput
                value={subAmount}
                onChangeText={setSubAmount}
                keyboardType="numeric"
                placeholder="e.g. 549"
                placeholderTextColor="#6B7280"
                className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-sm font-semibold mb-2.5"
              />

              {/* Wallet Picker */}
              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Charged To Wallet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2.5">
                {wallets.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    onPress={() => setSubWalletId(w.id)}
                    className={`px-3 py-1.5 rounded-lg mr-2 border ${
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
              <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1.5">Category</Text>
              <View className="flex-row flex-wrap justify-between mb-5">
                {expenseCategories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSubCatId(c.id)}
                    className={`w-[48%] mb-2 px-3 py-2 rounded-lg border ${
                      subCatId === c.id ? 'bg-accent-blue/20 border-accent-blue' : 'bg-background-elevated border-background-border'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${subCatId === c.id ? 'text-accent-blue' : 'text-content-primary'}`}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row space-x-2.5">
                <TouchableOpacity
                  onPress={() => setSubModalVisible(false)}
                  className="flex-1 bg-background-elevated py-2.5 rounded-lg items-center mr-2 border border-background-border"
                >
                  <Text className="text-content-secondary font-semibold text-xs">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveSubscription}
                  className="flex-1 bg-accent-blue py-2.5 rounded-lg items-center active:opacity-80"
                >
                  <Text className="text-content-primary font-bold text-xs">Track Bill</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
