declare module 'expo-haptics' {
  export enum ImpactFeedbackStyle {
    Light = 'light',
    Medium = 'medium',
    Heavy = 'heavy',
  }

  export enum NotificationFeedbackType {
    Success = 'success',
    Warning = 'warning',
    Error = 'error',
  }

  export function selectionAsync(): Promise<void>;
  export function impactAsync(style?: ImpactFeedbackStyle): Promise<void>;
  export function notificationAsync(type?: NotificationFeedbackType): Promise<void>;
}

declare module 'expo-document-picker' {
  export interface DocumentPickerAsset {
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
    lastModified?: number;
    file?: File;
  }

  export interface DocumentPickerResult {
    canceled: boolean;
    assets: DocumentPickerAsset[] | null;
  }

  export interface DocumentPickerOptions {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
    multiple?: boolean;
  }

  export function getDocumentAsync(options?: DocumentPickerOptions): Promise<DocumentPickerResult>;
}

declare module 'expo-local-authentication' {
  export interface AuthenticationOptions {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
    disableDeviceFallback?: boolean;
    requireConfirmation?: boolean;
  }

  export interface LocalAuthenticationResult {
    success: boolean;
    error?: string;
    warning?: string;
  }

  export function hasHardwareAsync(): Promise<boolean>;
  export function isEnrolledAsync(): Promise<boolean>;
  export function authenticateAsync(options?: AuthenticationOptions): Promise<LocalAuthenticationResult>;
}
