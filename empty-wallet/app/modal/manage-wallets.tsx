import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { WalletType } from '../../src/types';
import { formatCurrency } from '../../src/services/currency';
import { Icon } from '../../src/components/ui/Icon';
import { triggerHaptic } from '../../src/services/haptics';
import { X, Plus, Trash2, Check } from 'lucide-react-native';

export default function ManageWalletsModal() {
  const router = useRouter();
  const { wallets, addWallet, deleteWallet, transferFunds } = useWalletStore();
  const currency = useSettingsStore((s) => s.currency);

  const { tab } = useLocalSearchParams<{ tab?: 'list' | 'transfer' }>();
  const [activeTab, setActiveTab] = useState<'list' | 'transfer'>(tab || 'list');

  // Add Wallet Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('bank');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletColor, setWalletColor] = useState('#2A9D60');
  const [walletIcon, setWalletIcon] = useState('Landmark');

  // Transfer State
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const WALLET_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#6B7280'];

  const WALLET_ICONS: { icon: string; label: string; type: WalletType }[] = [
    { icon: 'Banknote', label: 'Cash', type: 'cash' },
    { icon: 'Landmark', label: 'Bank', type: 'bank' },
    { icon: 'CreditCard', label: 'Credit Card', type: 'credit' },
    { icon: 'PiggyBank', label: 'Savings', type: 'savings' },
  ];

  const handleSaveWallet = () => {
    const bal = parseFloat(walletBalance) || 0;
    if (!walletName.trim()) {
      triggerHaptic.error();
      return;
    }

    triggerHaptic.success();
    addWallet({
      name: walletName.trim(),
      type: walletType,
      currency,
      balance: bal,
      icon: walletIcon,
      color: walletColor,
    });

    setAddModalVisible(false);
    setWalletName('');
    setWalletBalance('');
  };

  const handleExecuteTransfer = () => {
    const amt = parseFloat(transferAmount);
    if (!fromWalletId || !toWalletId || fromWalletId === toWalletId || isNaN(amt) || amt <= 0) {
      triggerHaptic.error();
      return;
    }

    triggerHaptic.success();
    transferFunds(fromWalletId, toWalletId, amt, transferNote.trim() || undefined);
    setTransferAmount('');
    setTransferNote('');
    setActiveTab('list');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
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

        <Text className="text-sm font-bold text-content-primary">Wallets & Accounts</Text>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic.selection();
            setAddModalVisible(true);
          }}
          className="w-7 h-7 rounded-lg bg-primary items-center justify-center active:opacity-80"
        >
          <Plus size={16} color="#0F1012" strokeWidth={2.8} />
        </TouchableOpacity>
      </View>

      {/* Tabs Switcher */}
      <View className="px-4 pt-2.5">
        <View className="flex-row bg-background-card p-1 rounded-lg mb-3.5 border border-background-border">
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              setActiveTab('list');
            }}
            className={`flex-1 py-2 rounded-md items-center ${
              activeTab === 'list' ? 'bg-background-elevated' : ''
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                activeTab === 'list' ? 'text-content-primary' : 'text-content-tertiary'
              }`}
            >
              All Wallets ({wallets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              setActiveTab('transfer');
            }}
            className={`flex-1 py-2 rounded-md items-center ${
              activeTab === 'transfer' ? 'bg-background-elevated' : ''
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                activeTab === 'transfer' ? 'text-content-primary' : 'text-content-tertiary'
              }`}
            >
              Transfer Funds
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {activeTab === 'list' ? (
          <View>
            {wallets.map((w) => (
              <View
                key={w.id}
                className="flex-row items-center justify-between p-3.5 bg-background-card border border-background-border rounded-xl mb-2.5"
              >
                <View className="flex-row items-center flex-1 mr-2.5">
                  <View
                    className="w-9 h-9 rounded-lg items-center justify-center mr-2.5"
                    style={{ backgroundColor: `${w.color}20` }}
                  >
                    <Icon name={w.icon} size={18} color={w.color} />
                  </View>
                  <View>
                    <Text className="text-content-primary font-bold text-xs">{w.name}</Text>
                    <Text className="text-content-tertiary text-[10px] uppercase font-semibold mt-0.5">
                      {w.type}
                    </Text>
                  </View>
                </View>

                <View className="items-end mr-2">
                  <Text className="text-content-primary font-bold text-sm font-mono">
                    {formatCurrency(w.balance, w.currency)}
                  </Text>
                </View>

                {wallets.length > 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic.heavy();
                      deleteWallet(w.id);
                    }}
                    className="p-1.5 active:bg-expense/10 rounded-md"
                  >
                    <Trash2 size={15} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-background-card p-4 rounded-xl border border-background-border">
            <Text className="text-sm font-bold text-content-primary mb-0.5">Transfer Money</Text>
            <Text className="text-content-tertiary text-xs mb-3.5">
              Move money between cash, bank, or card accounts without affecting monthly budget
            </Text>

            {/* From Wallet */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">From Wallet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2.5">
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setFromWalletId(w.id)}
                  className={`px-3 py-1.5 rounded-lg mr-2 border ${
                    fromWalletId === w.id ? 'bg-primary/20 border-primary' : 'bg-background-elevated border-background-border'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${fromWalletId === w.id ? 'text-primary' : 'text-content-primary'}`}>
                    {w.name} ({formatCurrency(w.balance, w.currency)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* To Wallet */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">To Destination Wallet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3.5">
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setToWalletId(w.id)}
                  className={`px-3 py-1.5 rounded-lg mr-2 border ${
                    toWalletId === w.id ? 'bg-accent-blue/20 border-accent-blue' : 'bg-background-elevated border-background-border'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${toWalletId === w.id ? 'text-accent-blue' : 'text-content-primary'}`}>
                    {w.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Transfer Amount */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Amount ({currency})</Text>
            <TextInput
              value={transferAmount}
              onChangeText={setTransferAmount}
              keyboardType="numeric"
              placeholder="e.g. 2000"
              placeholderTextColor="#6B7280"
              className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-base font-semibold mb-2.5 font-mono"
            />

            {/* Transfer Note */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Note / Reason (Optional)</Text>
            <TextInput
              value={transferNote}
              onChangeText={setTransferNote}
              placeholder="e.g. ATM Cash Withdrawal"
              placeholderTextColor="#6B7280"
              className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-xs font-medium mb-5"
            />

            <TouchableOpacity
              onPress={handleExecuteTransfer}
              className="bg-primary py-2.5 rounded-lg items-center active:opacity-80"
            >
              <Text className="text-[#0F1012] font-bold text-xs">Confirm Transfer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL: ADD WALLET */}
      <Modal visible={addModalVisible} animationType="slide" transparent statusBarTranslucent>
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-background-card rounded-t-xl p-5 border-t border-background-border">
            <Text className="text-base font-bold text-content-primary mb-1">Add New Wallet</Text>
            <Text className="text-content-secondary text-xs mb-3.5">Create a new money container</Text>

            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Wallet Name</Text>
            <TextInput
              value={walletName}
              onChangeText={setWalletName}
              placeholder="e.g. Maya Wallet, GCash, BDO Savings"
              placeholderTextColor="#6B7280"
              className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-xs font-semibold mb-2.5"
            />

            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Starting Balance ({currency})</Text>
            <TextInput
              value={walletBalance}
              onChangeText={setWalletBalance}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#6B7280"
              className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-base font-semibold mb-2.5 font-mono"
            />

            {/* Type Selector */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1">Wallet Type</Text>
            <View className="flex-row mb-3.5">
              {WALLET_ICONS.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => {
                    setWalletType(item.type);
                    setWalletIcon(item.icon);
                  }}
                  className={`flex-1 py-1.5 rounded-lg mr-1.5 items-center border ${
                    walletType === item.type ? 'bg-primary/20 border-primary' : 'bg-background-elevated border-background-border'
                  }`}
                >
                  <Text className={`text-[10px] font-semibold ${walletType === item.type ? 'text-primary' : 'text-content-secondary'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Selector */}
            <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1.5">Accent Color</Text>
            <View className="flex-row mb-5">
              {WALLET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setWalletColor(c)}
                  className={`w-7 h-7 rounded-full mr-2 items-center justify-center ${
                    walletColor === c ? 'border-2 border-white' : ''
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {walletColor === c && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row space-x-2.5">
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                className="flex-1 bg-background-elevated py-2.5 rounded-lg items-center mr-2 border border-background-border"
              >
                <Text className="text-content-secondary font-semibold text-xs">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveWallet}
                className="flex-1 bg-primary py-2.5 rounded-lg items-center active:opacity-80"
              >
                <Text className="text-[#0F1012] font-bold text-xs">Save Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
