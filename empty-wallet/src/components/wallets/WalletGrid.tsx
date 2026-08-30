import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useWalletStore } from '../../stores/useWalletStore';
import { formatCurrency } from '../../services/currency';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { Icon } from '../../components/ui/Icon';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react-native';
import { triggerHaptic } from '../../services/haptics';

export const WalletGrid = () => {
  const router = useRouter();
  const { wallets } = useWalletStore();
  const currency = useSettingsStore((s) => s.currency);
  const [expanded, setExpanded] = useState(false);

  const displayedWallets = expanded ? wallets : wallets.slice(0, 4);
  const showToggle = wallets.length > 4;

  return (
    <View>
      <View className="flex-row flex-wrap -mx-1.5">
        {displayedWallets.map((w) => (
          <View key={w.id} className="w-1/2 px-1.5 mb-2.5">
            <View className="flex-row items-center p-2.5 bg-background-card border border-background-border rounded-xl">
              <View
                className="w-9 h-9 rounded-lg items-center justify-center mr-2.5 shrink-0"
                style={{ backgroundColor: `${w.color}20` }}
              >
                <Icon name={w.icon} size={18} color={w.color} />
              </View>
              <View className="flex-1 truncate">
                <Text className="text-content-tertiary text-[10px] uppercase font-semibold truncate" numberOfLines={1}>
                  {w.name}
                </Text>
                <Text className="text-content-primary font-bold text-xs font-mono mt-0.5" numberOfLines={1}>
                  {formatCurrency(w.balance, currency)}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Add Wallet Tile */}
        <View className="w-1/2 px-1.5 mb-2.5">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic.selection();
              router.push('/modal/manage-wallets');
            }}
            className="flex-row items-center p-2.5 bg-background-card/40 border border-dashed border-background-border rounded-xl h-[56px] justify-center"
          >
            <Plus size={16} color="#6B7280" />
            <Text className="text-content-tertiary font-semibold text-xs ml-1.5">Add Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showToggle && (
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            setExpanded(!expanded);
          }}
          className="flex-row items-center justify-center py-1.5"
        >
          <Text className="text-primary text-xs font-semibold mr-1">
            {expanded ? 'Show Less' : `Show All (${wallets.length})`}
          </Text>
          {expanded ? <ChevronUp size={14} color="#10B981" /> : <ChevronDown size={14} color="#10B981" />}
        </TouchableOpacity>
      )}
    </View>
  );
};
