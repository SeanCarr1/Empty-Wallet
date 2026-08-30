import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { SUPPORTED_CURRENCIES } from '../../src/services/currency';
import { AuthService } from '../../src/services/auth';
import { triggerHaptic } from '../../src/services/haptics';
import { Wallet, Upload, Fingerprint, Coins, ChevronRight, Check } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { currency, setCurrency, isBiometricsEnabled, setBiometricsEnabled } = useSettingsStore();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  useEffect(() => {
    async function checkBio() {
      const { hasHardware } = await AuthService.checkBiometricSupport();
      setBiometricAvailable(hasHardware);
    }
    checkBio();
  }, []);

  const handleToggleBiometrics = async (value: boolean) => {
    triggerHaptic.selection();
    if (value) {
      const auth = await AuthService.authenticateWithBiometrics('Enable Biometric Lock');
      if (auth) {
        setBiometricsEnabled(true);
        triggerHaptic.success();
      } else {
        triggerHaptic.error();
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="mb-5">
          <Text className="text-xl font-bold text-content-primary">Settings & Data</Text>
          <Text className="text-content-secondary text-xs mt-0.5">
            Manage wallets, currency, statement imports & security
          </Text>
        </View>

        {/* Section 1: Financial Preferences */}
        <View className="mb-5">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
            Financial Preferences
          </Text>
          <View className="bg-background-card rounded-xl border border-background-border overflow-hidden">
            {/* Manage Wallets */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                router.push('/modal/manage-wallets');
              }}
              className="flex-row items-center justify-between p-3.5 border-b border-background-border/50"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-primary/15 items-center justify-center mr-3">
                  <Wallet size={16} color="#10B981" />
                </View>
                <View>
                  <Text className="text-content-primary font-semibold text-xs">Manage Wallets</Text>
                  <Text className="text-content-tertiary text-[11px]">Cash, bank accounts, and cards</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* Currency Picker */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                setCurrencyModalOpen(!currencyModalOpen);
              }}
              className="flex-row items-center justify-between p-3.5"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-accent-amber/15 items-center justify-center mr-3">
                  <Coins size={16} color="#F59E0B" />
                </View>
                <View>
                  <Text className="text-content-primary font-semibold text-xs">Primary Currency</Text>
                  <Text className="text-content-tertiary text-[11px]">
                    {SUPPORTED_CURRENCIES[currency]?.name || currency} ({SUPPORTED_CURRENCIES[currency]?.symbol || currency})
                  </Text>
                </View>
              </View>
              <Text className="text-primary font-bold text-xs font-mono">{currency}</Text>
            </TouchableOpacity>

            {/* Currency Selection Dropdown List */}
            {currencyModalOpen && (
              <View className="border-t border-background-border/50 bg-background-elevated/40 p-2">
                {Object.values(SUPPORTED_CURRENCIES).map((c) => {
                  const isSelected = currency === c.code;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      onPress={() => {
                        triggerHaptic.selection();
                        setCurrency(c.code);
                        setCurrencyModalOpen(false);
                      }}
                      className="flex-row items-center justify-between p-2.5 rounded-lg active:bg-background-elevated"
                    >
                      <Text className="text-content-primary font-medium text-xs">
                        {c.symbol} • {c.name} ({c.code})
                      </Text>
                      {isSelected && <Check size={15} color="#10B981" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Section 2: Data Imports & Statements */}
        <View className="mb-5">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
            Data Import
          </Text>
          <View className="bg-background-card rounded-xl border border-background-border overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic.selection();
                router.push('/modal/import-statement');
              }}
              className="flex-row items-center justify-between p-3.5"
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-lg bg-accent-blue/15 items-center justify-center mr-3">
                  <Upload size={16} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-content-primary font-semibold text-xs">Import Bank CSV Statement</Text>
                  <Text className="text-content-tertiary text-[11px]">Bulk log transactions with deduplication</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Security & Privacy */}
        <View className="mb-5">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-2 ml-1">
            Security & Privacy
          </Text>
          <View className="bg-background-card rounded-xl border border-background-border overflow-hidden">
            <View className="flex-row items-center justify-between p-3.5">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-8 h-8 rounded-lg bg-accent-purple/15 items-center justify-center mr-3">
                  <Fingerprint size={16} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-content-primary font-semibold text-xs">Biometric Lock</Text>
                  <Text className="text-content-tertiary text-[11px]">Require Face ID / Touch ID upon opening</Text>
                </View>
              </View>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={handleToggleBiometrics}
                trackColor={{ false: '#2A2D35', true: '#10B981' }}
                thumbColor="#F3F4F6"
              />
            </View>
          </View>
        </View>

        {/* Section 4: App Information & Brand Logo */}
        <View className="bg-background-card rounded-xl p-5 border border-background-border items-center">
          <Image
            source={require('../../assets/logo.jpg')}
            className="w-12 h-12 rounded-lg mb-2.5 border border-background-border"
            resizeMode="cover"
          />
          <Text className="text-content-primary font-bold text-sm">Empty-Wallet</Text>
          <Text className="text-content-tertiary text-xs">Version 1.0.0 • Local-First Architecture</Text>
          <Text className="text-content-muted text-[11px] mt-1 text-center">
            Your data is stored 100% locally on your device with high-performance SQLite.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
