import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { LayoutGrid, Receipt, Target, BarChart3, Settings2, Plus } from 'lucide-react-native';
import { triggerHaptic } from '../../src/services/haptics';

export default function TabLayout() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: '#131620',
            borderTopColor: '#202637',
            borderTopWidth: 1,
            height: 72,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#64748B',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size - 2} />,
          }}
          listeners={{
            tabPress: () => triggerHaptic.selection(),
          }}
        />

        <Tabs.Screen
          name="records"
          options={{
            title: 'Records',
            tabBarIcon: ({ color, size }) => <Receipt color={color} size={size - 2} />,
          }}
          listeners={{
            tabPress: () => triggerHaptic.selection(),
          }}
        />

        <Tabs.Screen
          name="budgets"
          options={{
            title: 'Budgets',
            tabBarIcon: ({ color, size }) => <Target color={color} size={size - 2} />,
          }}
          listeners={{
            tabPress: () => triggerHaptic.selection(),
          }}
        />

        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size - 2} />,
          }}
          listeners={{
            tabPress: () => triggerHaptic.selection(),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings2 color={color} size={size - 2} />,
          }}
          listeners={{
            tabPress: () => triggerHaptic.selection(),
          }}
        />
      </Tabs>

      {/* Floating Quick Add (+) Action Button */}
      <View className="absolute bottom-6 right-6 z-50">
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            triggerHaptic.medium();
            router.push('/modal/quick-add');
          }}
          className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-xl shadow-primary/40 border-4 border-background"
        >
          <Plus size={28} color="#090A0F" strokeWidth={2.8} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
