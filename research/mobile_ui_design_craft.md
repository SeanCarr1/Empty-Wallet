# Mobile UI Design & React Native/Expo Implementation Craft

This document serves as the comprehensive research foundation and rulebook for Mobile UI Design and React Native/Expo implementation best practices (circa 2026), heavily focused on ergonomics, performance, and native feel.

## 1. Touch & Gesture Ergonomics
- **Hit Targets:** Minimum interactive touch target size is 44x44 pt (iOS HIG) and 48x48 dp (Material Design 3). Ensure `padding` is used effectively to increase touch targets without visually enlarging the element.
  - *React Native Tip:* Use `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}` on `Pressable` or `TouchableOpacity` when visual bounds must remain small.
- **Reachability (The "Thumb Zone"):** Primary actions (FABs, primary buttons, bottom navigation) must live in the lower third of the screen.
- **Gestures over Buttons:** Users expect swipe-to-go-back (iOS), swipe-to-dismiss (modals), and swipe actions on list items.
  - *React Native Tip:* Use `react-native-gesture-handler` for complex, 60-120fps gesture recognition.

## 2. Safe Area & Viewport Handling
- **Device Bezels, Notches & Dynamic Islands:** UI must never be hidden behind physical device constraints or the OS home indicator/status bar.
- **Expo/React Native Implementation:**
  - Avoid hardcoding paddings for top/bottom margins.
  - Use `react-native-safe-area-context`.
  - Wrap top-level screens in `SafeAreaProvider` and use `useSafeAreaInsets()` in components to manually apply `paddingTop` and `paddingBottom`.
  - Avoid `<SafeAreaView>` for complex scrollable layouts, as it can cause jumpy UI. Apply insets directly to `contentContainerStyle` of lists/scroll views.

## 3. Form & Input Ergonomics
- **Keyboard Avoidance:** The software keyboard should never obscure the input field being edited.
  - *React Native Tip:* Use `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` or standard community libraries like `react-native-keyboard-aware-scroll-view`.
- **Auto-Focus & Next Prompts:** Automatically advance focus to the next input upon `onSubmitEditing`. Use `returnKeyType="next"` for intermediate fields and `"done"` for the final one.
- **Input Types:** Always provide the correct `keyboardType` (e.g., `numeric`, `email-address`, `phone-pad`) and use `textContentType` (iOS) / `autoComplete` (Android) to trigger OS-level auto-fill and OTP suggestions.

## 4. Responsive Small-Screen Data Vis
- **Avoid Cramping:** Do not force complex charts into narrow viewports. Instead, provide horizontal scrolling (`ScrollView horizontal`) for time-series data or allow tapping to expand to full-screen/landscape modes.
- **Progressive Disclosure:** Show high-level summaries by default. Allow the user to tap to reveal granular data.
- **React Native Implementation:** Use `react-native-svg` combined with `react-native-reanimated` for smooth, interpolating chart animations. Avoid heavy web-based wrappers (e.g., WebView charts) as they degrade performance and touch responsiveness.

## 5. Native State Indicators & Haptics
- **Haptic Feedback:** Haptics elevate a mobile app from feeling "web-like" to "native".
  - *React Native Tip:* Use `expo-haptics`.
  - Trigger `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on minor actions (toggles, list reordering).
  - Trigger `Medium` or `Heavy` on primary button presses or success states.
  - Trigger `NotificationFeedbackType.Error` on failures (e.g., incorrect PIN).
- **Loading States:** Avoid full-screen blocking spinners unless absolutely necessary. Prefer inline loading states, skeleton loaders (using Reanimated), and keeping the UI interactive.

## 6. React Native / Expo Anti-Patterns (2026 Edition)
- **Anti-Pattern 1: The "Bridge" reliance.**
  - *Fix:* Ensure the "New Architecture" (Fabric & TurboModules) is enabled. Write modern native modules without the bridge.
- **Anti-Pattern 2: Manual Memoization Everywhere.**
  - *Fix:* Adopt the **React Compiler**. Stop wrapping every function in `useCallback` and `useMemo`; let the compiler handle re-render optimizations.
- **Anti-Pattern 3: Nested ScrollViews.**
  - *Fix:* Never put a `FlatList` inside a `ScrollView`. Use `ListHeaderComponent` and `ListFooterComponent` inside `FlatList` or `FlashList`.
- **Anti-Pattern 4: Using `AsyncStorage` for Tokens.**
  - *Fix:* Use `expo-secure-store` or `react-native-keychain` for all sensitive data like JWTs or financial data.
- **Anti-Pattern 5: Ignoring the UI Thread.**
  - *Fix:* Do not execute animations on the JS thread. Use `react-native-reanimated` and the `useAnimatedStyle` hooks to keep 60/120fps fluid animations on the UI thread.
- **Anti-Pattern 6: Bloated Lists.**
  - *Fix:* Use `@shopify/flash-list` over standard `FlatList` for lists with hundreds of items to maintain smooth scrolling and memory efficiency.
