import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Wallet } from '../../types';
import { formatCurrency } from '../../services/currency';
import { Icon } from '../ui/Icon';
import { triggerHaptic } from '../../services/haptics';

interface WalletCardProps {
  wallet: Wallet;
  isSelected?: boolean;
  onPress?: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  isSelected = false,
  onPress,
}) => {
  const isCredit = wallet.type === 'credit';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        triggerHaptic.selection();
        onPress?.();
      }}
      className={`min-w-[145px] p-3.5 rounded-xl mr-2.5 border ${
        isSelected
          ? 'bg-background-elevated border-primary'
          : 'bg-background-card border-background-border'
      }`}
    >
      <View className="flex-row items-center justify-between mb-2.5">
        <View
          className="w-7 h-7 rounded-lg items-center justify-center"
          style={{ backgroundColor: `${wallet.color}20` }}
        >
          <Icon name={wallet.icon} size={15} color={wallet.color} />
        </View>
        <Text className="text-[9px] font-bold uppercase text-content-tertiary tracking-wider">
          {wallet.type}
        </Text>
      </View>

      <Text className="text-content-secondary font-medium text-xs truncate mb-0.5" numberOfLines={1}>
        {wallet.name}
      </Text>

      <Text
        className={`text-sm font-bold tabular-nums ${
          isCredit && wallet.balance < 0 ? 'text-expense' : 'text-content-primary'
        }`}
      >
        {formatCurrency(wallet.balance, wallet.currency)}
      </Text>
    </TouchableOpacity>
  );
};
