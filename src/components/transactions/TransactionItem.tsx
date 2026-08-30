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
  const iconColor = category?.color || (isIncome ? '#2A9D60' : isTransfer ? '#4338CA' : '#DC4C38');

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        triggerHaptic.selection();
        onPress?.();
      }}
      className="flex-row items-center justify-between p-3.5 bg-background-card border border-background-border rounded-2xl mb-2.5"
    >
      {/* Left side: Category Icon & Details */}
      <View className="flex-row items-center flex-1 mr-3">
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center mr-3 border border-background-border/40"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Icon name={iconName} size={18} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text className="text-content-primary font-bold text-sm truncate" numberOfLines={1}>
            {transaction.payee}
          </Text>
          
          <View className="flex-row items-center mt-1 flex-wrap">
            <Text className="text-content-tertiary text-[11px] font-medium">
              {category?.name || (isTransfer ? 'Transfer' : 'Uncategorized')}
            </Text>
            {wallet && (
              <>
                <Text className="text-content-muted mx-1">•</Text>
                <Text className="text-content-secondary text-[11px] font-medium">{wallet.name}</Text>
              </>
            )}
            {transaction.paymentType && (
              <>
                <Text className="text-content-muted mx-1">•</Text>
                <Text className="text-content-tertiary text-[10px] uppercase font-semibold">
                  {transaction.paymentType.replace('_', ' ')}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Right side: Amount & Date/Time */}
      <View className="items-end">
        <Text
          className={`font-extrabold text-sm ${
            isIncome ? 'text-primary' : isTransfer ? 'text-accent-blue' : 'text-expense'
          }`}
        >
          {isIncome ? '+' : isTransfer ? '' : '-'}
          {formatCurrency(transaction.amount, currency)}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Text className="text-content-tertiary text-[10px]">
            {transaction.transactionDate}
          </Text>
          {transaction.transactionTime && (
            <Text className="text-content-muted text-[10px] ml-1">
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
          className="ml-2.5 p-1.5 rounded-lg active:bg-expense/10"
        >
          <Trash2 size={15} color="#948B7E" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
