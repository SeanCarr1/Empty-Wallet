import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-content-primary font-bold text-xl mb-2">This screen doesn't exist.</Text>
        <Link href="/" asChild>
          <TouchableOpacity className="mt-4 bg-primary px-4 py-2 rounded-xl">
            <Text className="text-background font-bold text-sm">Go to home screen</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}
