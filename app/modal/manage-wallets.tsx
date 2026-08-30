import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { WalletType } from '../../src/types';
import { formatCurrency } from '../../src/services/currency';
import { Icon } from '../../src/components/ui/Icon';
import { triggerHaptic } from '../../src/services/haptics';
import { X, Plus, ArrowRightLeft, Trash2, Check, Banknote, Landmark, CreditCard, PiggyBank } from 'lucide-react-native';

export default function ManageWalletsModal() {
  const router = useRouter();
  const { wallets, addWallet, deleteWallet, transferFunds } = useWalletStore();
  const currency = useSettingsStore((s) => s.currency);

  const [activeTab, setActiveTab] = useState<'list' | 'transfer'>('list');

  // Add Wallet Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('bank');
  const [walletBalance, setWalletBalance] = useState('');
  const [walletColor, setWalletColor] = useState('#3B82F6');
  const [walletIcon, setWalletIcon] = useState('Landmark');

  // Transfer State
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const WALLET_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'];

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

        <Text className="text-base font-bold text-content-primary">Wallets & Accounts</Text>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic.selection();
            setAddModalVisible(true);
          }}
          className="w-8 h-8 rounded-full bg-primary items-center justify-center"
        >
          <Plus size={18} color="#090A0F" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Tabs Switcher */}
      <View className="px-5 pt-3">
        <View className="flex-row bg-background-card p-1 rounded-2xl mb-4 border border-background-border">
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              setActiveTab('list');
            }}
            className={`flex-1 py-2.5 rounded-xl items-center ${
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
            className={`flex-1 py-2.5 rounded-xl items-center ${
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

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {activeTab === 'list' ? (
          <View>
            {wallets.map((w) => (
              <View
                key={w.id}
                className="flex-row items-center justify-between p-4 bg-background-card border border-background-border rounded-2xl mb-3"
              >
                <View className="flex-row items-center flex-1 mr-3">
                  <View
                    className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${w.color}20` }}
                  >
                    <Icon name={w.icon} size={22} color={w.color} />
                  </View>
                  <View>
                    <Text className="text-content-primary font-bold text-sm">{w.name}</Text>
                    <Text className="text-content-tertiary text-xs uppercase font-medium mt-0.5">
                      {w.type}
                    </Text>
                  </View>
                </View>

                <View className="items-end mr-3">
                  <Text className="text-content-primary font-bold text-base">
                    {formatCurrency(w.balance, w.currency)}
                  </Text>
                </View>

                {wallets.length > 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic.heavy();
                      deleteWallet(w.id);
                    }}
                    className="p-1.5 active:bg-expense/10 rounded-lg"
                  >
                    <Trash2 size={16} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-background-card p-5 rounded-3xl border border-background-border">
            <Text className="text-base font-bold text-content-primary mb-1">Transfer Money</Text>
            <Text className="text-content-tertiary text-xs mb-4">
              Move money between cash, bank, or card accounts without affecting monthly budget
            </Text>

            {/* From Wallet */}
            <Text className="text-content-secondary text-xs font-semibold uppercase mb-1">From Wallet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setFromWalletId(w.id)}
                  className={`px-3 py-2 rounded-xl mr-2 border ${
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
            <Text className="text-content-secondary text-xs font-semibold uppercase mb-1">To Destination Wallet</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setToWalletId(w.id)}
                  className={`px-3 py-2 rounded-xl mr-2 border ${
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
            <Text className="text-content-secondary text-xs font-semibold uppercase mb-1">Amount ({currency})</Text>
            <TextInput
              value={transferAmount}
              onChangeText={setTransferAmount}
              keyboardType="numeric"
              placeholder="e.g. 2000"
              placeholderTextColor="#64748B"
              className="bg-background-elevated border border-background-border rounded-xl p-3.5 text-content-primary text-base font-semibold mb-3"
            />

            {/* Transfer Note */}
            <Text className="text-content-secondary text-xs font-semibold uppercase mb-1">Note / Reason (Optional)</Text>
            <TextInput
              value={transferNote}
              onChangeText={setTransferNote}
              placeholder="e.g. ATM Cash Withdrawal"
              placeholderTextColor="#64748B"
              className="bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-xs font-medium mb-6"
            />

            <TouchableOpacity
              onPress={handleExecuteTransfer}
              className="bg-primary py-3.5 rounded-xl items-center"
            >
              <Text className="text-background font-bold text-sm">Confirm Transfer</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL: ADD WALLET */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-background-card rounded-t-3xl p-6 border-t border-background-border">
            <Text className="text-xl font-bold text-content-primary mb-1">Add New Wallet</Text>
            <Text className="text-content-secondary text-xs mb-4">Create a new money container</Text>

            <Text className="text-content-secondary text-xs font-semibold uppercase mb-1">Wallet Name</Text>
            <TextInput
              value={walletName}
              onChangeText={setWalletName}
              placeholder="e.g. Maya Wallet, GCash, BDO Savings"
              placeholderTextColor="#64748B"
              className="bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-sm font-semibold mb-3"
            />

            <Text className="text-content-secondary text-xs font-semibold uppercase mb-1">Starting Balance ({currency})</Text>
            <TextInput
              value={walletBalance}
              onChangeText={setWalletBalance}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#64748B"
              className="bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-base font-semibold mb-3"
            />

            {/* Type Selector */}
            <Text className="text-content-secondary text-xs font-semibold uppercase mb-1">Wallet Type</Text>
            <View className="flex-row mb-4">
              {WALLET_ICONS.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  onPress={() => {
                    setWalletType(item.type);
                    setWalletIcon(item.icon);
                  }}
                  className={`flex-1 py-2 rounded-xl mr-1.5 items-center border ${
                    walletType === item.type ? 'bg-primary/20 border-primary' : 'bg-background-elevated border-background-border'
                  }`}
                >
                  <Text className={`text-[11px] font-semibold ${walletType === item.type ? 'text-primary' : 'text-content-secondary'}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color Selector */}
            <Text className="text-content-secondary text-xs font-semibold uppercase mb-2">Accent Color</Text>
            <View className="flex-row mb-6">
              {WALLET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setWalletColor(c)}
                  className={`w-8 h-8 rounded-full mr-2 items-center justify-center ${
                    walletColor === c ? 'border-2 border-white' : ''
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {walletColor === c && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                className="flex-1 bg-background-elevated py-3.5 rounded-xl items-center mr-2"
              >
                <Text className="text-content-secondary font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveWallet}
                className="flex-1 bg-primary py-3.5 rounded-xl items-center"
              >
                <Text className="text-background font-bold">Save Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
