import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction, Category, Wallet } from '../../types';
import { formatCurrency } from '../../services/currency';
import { Icon } from '../ui/Icon';
import { triggerHaptic } from '../../services/haptics';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2 } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  currency?: string;
  onDelete?: (id: string) => void;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  wallet,
  currency = 'PHP',
  onDelete,
  onPress,
}) => {
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const iconName = category?.icon || (isIncome ? 'TrendingUp' : isTransfer ? 'ArrowLeftRight' : 'Receipt');
  const iconColor = category?.color || (isIncome ? '#10B981' : isTransfer ? '#3B82F6' : '#F43F5E');

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        triggerHaptic.selection();
        onPress?.();
      }}
      className="flex-row items-center justify-between p-3.5 bg-background-card border border-background-border/60 rounded-2xl mb-2.5"
    >
      {/* Left side: Category Icon & Details */}
      <View className="flex-row items-center flex-1 mr-3">
        <View
          className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon name={iconName} size={22} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text className="text-content-primary font-semibold text-sm truncate" numberOfLines={1}>
            {transaction.payee}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-content-tertiary text-xs">
              {category?.name || (isTransfer ? 'Transfer' : 'Uncategorized')}
            </Text>
            {wallet && (
              <>
                <Text className="text-content-muted mx-1.5">•</Text>
                <Text className="text-content-tertiary text-xs font-medium">{wallet.name}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Right side: Amount & Delete Button */}
      <View className="items-end">
        <Text
          className={`font-bold text-base ${
            isIncome ? 'text-primary' : isTransfer ? 'text-accent-blue' : 'text-content-primary'
          }`}
        >
          {isIncome ? '+' : isTransfer ? '' : '-'}
          {formatCurrency(transaction.amount, currency)}
        </Text>
        <Text className="text-content-tertiary text-[11px] mt-0.5">
          {transaction.transactionDate}
        </Text>
      </View>

      {onDelete && (
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.heavy();
            onDelete(transaction.id);
          }}
          className="ml-3 p-1.5 rounded-lg active:bg-expense/10"
        >
          <Trash2 size={16} color="#64748B" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
