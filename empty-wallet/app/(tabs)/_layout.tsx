import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { LayoutGrid, Receipt, Target, BarChart3, Settings2 } from 'lucide-react-native';
import { triggerHaptic } from '../../src/services/haptics';

export default function TabLayout() {
  return (
    <View className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: '#17181C',
            borderTopColor: '#2A2D35',
            borderTopWidth: 1,
            height: 68,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#10B981',
          tabBarInactiveTintColor: '#6B7280',
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
    </View>
  );
}
