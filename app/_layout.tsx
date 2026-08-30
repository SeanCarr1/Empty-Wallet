import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from '../src/db/client';
import { useWalletStore } from '../src/stores/useWalletStore';
import { useTransactionStore } from '../src/stores/useTransactionStore';
import { useBudgetStore } from '../src/stores/useBudgetStore';
import { useCategoryStore } from '../src/stores/useCategoryStore';
import { useSettingsStore } from '../src/stores/useSettingsStore';
import { AuthService } from '../src/services/auth';
import { Fingerprint } from 'lucide-react-native';
import '../global.css';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const fetchWallets = useWalletStore((s) => s.fetchWallets);
  const fetchTransactions = useTransactionStore((s) => s.fetchTransactions);
  const fetchAllBudgetingData = useBudgetStore((s) => s.fetchAllBudgetingData);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const { isBiometricsEnabled, hasUnlockedSession, setUnlockedSession } = useSettingsStore();

  useEffect(() => {
    async function prepare() {
      try {
        await initializeDatabase();
        fetchCategories();
        fetchWallets();
        fetchTransactions();
        fetchAllBudgetingData();

        if (isBiometricsEnabled && !hasUnlockedSession) {
          setIsLocked(true);
          const authenticated = await AuthService.authenticateWithBiometrics();
          if (authenticated) {
            setUnlockedSession(true);
            setIsLocked(false);
          }
        }
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const handleUnlock = async () => {
    const success = await AuthService.authenticateWithBiometrics();
    if (success) {
      setUnlockedSession(true);
      setIsLocked(false);
    }
  };

  if (!isReady) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Image
          source={require('../assets/logo.jpg')}
          className="w-16 h-16 rounded-3xl mb-4 border border-background-border"
          resizeMode="cover"
        />
        <Text className="text-content-secondary font-semibold text-sm">Opening Empty-Wallet...</Text>
      </View>
    );
  }

  if (isLocked) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Image
          source={require('../assets/logo.jpg')}
          className="w-20 h-20 rounded-3xl mb-4 border border-background-border"
          resizeMode="cover"
        />
        <Text className="text-2xl font-bold text-content-primary mb-1">Empty-Wallet Locked</Text>
        <Text className="text-content-secondary text-center text-xs mb-8">
          Authenticate with Face ID or Touch ID to access your ledger.
        </Text>
        <TouchableOpacity
          onPress={handleUnlock}
          className="flex-row items-center bg-primary px-8 py-3.5 rounded-2xl active:opacity-80 shadow-lg shadow-primary/20"
        >
          <Fingerprint size={20} color="#F5F2EB" />
          <Text className="text-content-primary font-bold text-base ml-2">Unlock Ledger</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#141312' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal/quick-add"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="modal/manage-wallets"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="modal/import-statement"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
