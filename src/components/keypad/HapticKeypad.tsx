import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Delete, Check } from 'lucide-react-native';
import { triggerHaptic } from '../../services/haptics';

interface HapticKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
}

export const HapticKeypad: React.FC<HapticKeypadProps> = ({
  value,
  onChange,
  onSubmit,
  submitLabel = 'Save',
  submitDisabled = false,
}) => {
  const handleKeyPress = (key: string) => {
    triggerHaptic.selection();

    if (key === 'backspace') {
      if (value.length > 0) {
        onChange(value.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      const parts = value.split(/[+\-]/);
      const currentPart = parts[parts.length - 1];
      if (!currentPart.includes('.')) {
        onChange(value ? `${value}.` : '0.');
      }
      return;
    }

    if (key === '+' || key === '-') {
      if (value.length > 0 && !/[+\-]$/.test(value)) {
        onChange(`${value}${key}`);
      }
      return;
    }

    const parts = value.split(/[+\-]/);
    const currentPart = parts[parts.length - 1];
    if (currentPart.includes('.') && currentPart.split('.')[1].length >= 2) {
      return;
    }

    if (value === '0' && key !== '.') {
      onChange(key);
    } else {
      onChange(`${value}${key}`);
    }
  };

  const keys = [
    ['1', '2', '3', '+'],
    ['4', '5', '6', '-'],
    ['7', '8', '9', 'backspace'],
    ['.', '0', 'clear', 'submit'],
  ];

  return (
    <View className="w-full px-3 pb-2 pt-2 bg-background-card rounded-t-2xl border-t border-background-border">
      {keys.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} className="flex-row justify-between mb-2">
          {row.map((key) => {
            if (key === 'submit') {
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!submitDisabled) {
                      triggerHaptic.success();
                      onSubmit();
                    }
                  }}
                  disabled={submitDisabled}
                  className={`flex-1 mx-1 h-[52px] rounded-lg items-center justify-center ${
                    submitDisabled
                      ? 'bg-background-elevated opacity-40 border border-background-border'
                      : 'bg-primary shadow-sm shadow-primary/25'
                  }`}
                >
                  <Check size={20} color="#0F1012" strokeWidth={3} />
                </TouchableOpacity>
              );
            }

            if (key === 'backspace') {
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.6}
                  onPress={() => handleKeyPress('backspace')}
                  className="flex-1 mx-1 h-[52px] bg-background-elevated active:bg-background rounded-lg items-center justify-center border border-background-border"
                >
                  <Delete size={18} color="#9CA3AF" />
                </TouchableOpacity>
              );
            }

            if (key === 'clear') {
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.6}
                  onPress={() => {
                    triggerHaptic.light();
                    onChange('');
                  }}
                  className="flex-1 mx-1 h-[52px] bg-background-elevated active:bg-background rounded-lg items-center justify-center border border-background-border"
                >
                  <Text className="text-content-secondary font-bold text-sm">C</Text>
                </TouchableOpacity>
              );
            }

            const isOperator = key === '+' || key === '-';

            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.6}
                onPress={() => handleKeyPress(key)}
                className={`flex-1 mx-1 h-[52px] rounded-lg items-center justify-center border ${
                  isOperator
                    ? 'bg-background-elevated border-primary/40 active:bg-primary/20'
                    : 'bg-background-elevated border-background-border active:bg-background'
                }`}
              >
                <Text
                  className={`font-bold text-lg tabular-nums ${
                    isOperator ? 'text-primary' : 'text-content-primary'
                  }`}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};
