import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = {
  /**
   * Subtle tick for keypad presses and button interactions
   */
  selection: () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
  },

  /**
   * Light impact for tab switches and chip selections
   */
  light: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  },

  /**
   * Medium impact for transaction creation and confirm actions
   */
  medium: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  },

  /**
   * Heavy impact for threshold triggers or delete actions
   */
  heavy: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
  },

  /**
   * Notification success vibration (e.g. successfully saved transaction)
   */
  success: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  },

  /**
   * Notification warning vibration (e.g. approaching 80% budget limit)
   */
  warning: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  },

  /**
   * Notification error vibration (e.g. over-budget or invalid input)
   */
  error: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  },
};
