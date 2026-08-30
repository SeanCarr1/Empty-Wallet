import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction, Category, Wallet } from '../../types';
import { formatCurrency } from '../../services/currency';
import { Icon } from '../ui/Icon';
import { triggerHaptic } from '../../services/haptics';
import { Trash2, User, CreditCard } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  currency?: string;
  onDelete?: (id: string) => void;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  wallet,
  currency = 'PHP',
  onDelete,
  onPress,
  onLongPress,
}) => {
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const iconName = category?.icon || (isIncome ? 'TrendingUp' : isTransfer ? 'ArrowLeftRight' : 'Receipt');
  const iconColor = category?.color || (isIncome ? '#10B981' : isTransfer ? '#3B82F6' : '#EF4444');

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        triggerHaptic.selection();
        onPress?.();
      }}
      onLongPress={() => {
        triggerHaptic.heavy();
        onLongPress?.();
      }}
      className="flex-row items-center justify-between p-3 bg-background-card border border-background-border rounded-xl mb-2"
    >
      {/* Left side: Category Icon & Details */}
      <View pointerEvents="none" className="flex-row items-center flex-1 mr-3">
        <View
          className="w-9 h-9 rounded-lg items-center justify-center mr-2.5 border border-background-border/50"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon name={iconName} size={16} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text className="text-content-primary font-bold text-xs truncate" numberOfLines={1}>
            {transaction.payee}
          </Text>
          
          <View className="flex-row items-center mt-0.5 flex-wrap">
            <Text className="text-content-tertiary text-[11px] font-medium">
              {category?.name || (isTransfer ? 'Transfer' : 'Uncategorized')}
            </Text>
            {wallet && (
              <>
                <Text className="text-content-muted mx-1 text-[11px]">•</Text>
                <Text className="text-content-secondary text-[11px] font-medium">{wallet.name}</Text>
              </>
            )}
            {transaction.paymentType && (
              <>
                <Text className="text-content-muted mx-1 text-[11px]">•</Text>
                <Text className="text-content-tertiary text-[9px] uppercase font-bold tracking-wide">
                  {transaction.paymentType.replace('_', ' ')}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Right side: Amount & Date/Time */}
      <View pointerEvents="none" className="items-end">
        <Text
          className={`font-black text-xs tabular-nums ${
            isIncome ? 'text-primary' : isTransfer ? 'text-accent-blue' : 'text-expense'
          }`}
        >
          {isIncome ? '+' : isTransfer ? '' : '-'}
          {formatCurrency(transaction.amount, currency)}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Text className="text-content-tertiary text-[10px] tabular-nums">
            {transaction.transactionDate}
          </Text>
          {transaction.transactionTime && (
            <Text className="text-content-muted text-[10px] ml-1 tabular-nums">
              {transaction.transactionTime}
            </Text>
          )}
        </View>
      </View>

      {onDelete && (
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.heavy();
            onDelete(transaction.id);
          }}
          className="ml-2 p-1.5 rounded-lg active:bg-expense/10"
        >
          <Trash2 size={14} color="#6B7280" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
