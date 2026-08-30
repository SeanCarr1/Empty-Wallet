---
name: mobile-ui
description: Agent reflexes and guidelines for React Native / Expo UI design and implementation craft.
---

# Mobile UI Implementation Reflexes

This skill equips agents with the necessary patterns and rules for developing high-quality, native-feeling UIs in React Native and Expo. Apply these guidelines to all frontend tasks in this project.

## Core Directives

1. **Touch Ergonomics**
   - Ensure all interactive elements have a minimum touch target of 44x44pt (iOS) or 48x48dp (Android).
   - Use `hitSlop` on `Pressable` if the visual element is smaller than the required touch target.

2. **Safe Area & Insets**
   - NEVER hardcode top/bottom margins to avoid notches or the home indicator.
   - ALWAYS use `useSafeAreaInsets` from `react-native-safe-area-context` to apply padding dynamically.
   - For lists, apply insets to `contentContainerStyle` rather than wrapping the list in a `<SafeAreaView>`.

3. **Forms & Keyboards**
   - Use appropriate `keyboardType` and `autoComplete` / `textContentType` to enable OS autofill.
   - Ensure the keyboard never obscures inputs using `KeyboardAvoidingView` or `react-native-keyboard-aware-scroll-view`.
   - Chain inputs: Use `onSubmitEditing` and `refs` to auto-focus the next field.

4. **Performance & Architecture**
   - **Lists:** Default to `@shopify/flash-list` for lists that might grow beyond 20 items. Avoid `ScrollView` for lists.
   - **Animations:** Strictly use `react-native-reanimated` for layout animations, gestures, and transitions to ensure they run on the UI thread.
   - **Memoization:** Rely on the React Compiler if enabled. Otherwise, be judicious with `useMemo` and `useCallback`.

5. **Native Feel & Feedback**
   - Integrate `expo-haptics` for tactile feedback on primary actions, toggles, and state changes (Success/Error).
   - Use Skeleton loaders for asynchronous data fetching instead of full-screen blocking spinners.

6. **Security**
   - NEVER use `AsyncStorage` for sensitive information (e.g., auth tokens, financial data). ALWAYS use `expo-secure-store`.

## Code Example: Safe Area List with Haptics

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export function TransactionsList({ data }) {
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate or act
  };

  return (
    <FlashList
      data={data}
      renderItem={({ item }) => (
        <Pressable 
          onPress={handlePress}
          hitSlop={8}
          style={styles.item}
        >
          <Text>{item.title}</Text>
        </Pressable>
      )}
      estimatedItemSize={60}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 16,
      }}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
  }
});
```
