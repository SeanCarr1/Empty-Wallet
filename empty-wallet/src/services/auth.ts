import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const PIN_STORAGE_KEY = 'empty_wallet_user_pin';
const BIOMETRICS_ENABLED_KEY = 'empty_wallet_biometrics_enabled';

export const AuthService = {
  /**
   * Check if hardware biometric scanner is available
   */
  async checkBiometricSupport(): Promise<{ hasHardware: boolean; isEnrolled: boolean }> {
    if (Platform.OS === 'web') {
      return { hasHardware: false, isEnrolled: false };
    }
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return { hasHardware, isEnrolled };
  },

  /**
   * Prompt biometric authentication (FaceID / TouchID)
   */
  async authenticateWithBiometrics(promptMessage = 'Unlock Empty-Wallet'): Promise<boolean> {
    if (Platform.OS === 'web') return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Enter PIN',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch {
      return false;
    }
  },

  /**
   * Save user 4-6 digit PIN
   */
  async setPIN(pin: string): Promise<void> {
    if (Platform.OS === 'web') return;
    await SecureStore.setItemAsync(PIN_STORAGE_KEY, pin);
  },

  /**
   * Validate user entered PIN
   */
  async verifyPIN(enteredPin: string): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    const storedPin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    if (!storedPin) return true; // No PIN set yet
    return storedPin === enteredPin;
  },

  /**
   * Check if PIN is configured
   */
  async hasConfiguredPIN(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const pin = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
    return !!pin;
  },

  /**
   * Clear PIN
   */
  async clearPIN(): Promise<void> {
    if (Platform.OS === 'web') return;
    await SecureStore.deleteItemAsync(PIN_STORAGE_KEY);
  },
};
