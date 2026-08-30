import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { X, Clock, Check } from 'lucide-react-native';
import { triggerHaptic } from '../../services/haptics';

interface TimePickerModalProps {
  visible: boolean;
  currentTime: string; // HH:MM (24-hour format)
  onSelect: (timeString: string) => void;
  onClose: () => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  currentTime,
  onSelect,
  onClose,
}) => {
  // Parse initial 24-hr time into 12-hr parts
  const parseInitialTime = (timeStr: string) => {
    let h = 12;
    let m = 0;
    let period: 'AM' | 'PM' = 'AM';

    if (timeStr && timeStr.includes(':')) {
      const parts = timeStr.split(':');
      const rawHour = parseInt(parts[0], 10) || 0;
      m = parseInt(parts[1], 10) || 0;

      if (rawHour >= 12) {
        period = 'PM';
        h = rawHour > 12 ? rawHour - 12 : 12;
      } else {
        period = 'AM';
        h = rawHour === 0 ? 12 : rawHour;
      }
    }
    return { h, m: Math.round(m / 5) * 5 % 60, period };
  };

  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (visible) {
      const { h, m, period: p } = parseInitialTime(currentTime);
      setHour(h);
      setMinute(m);
      setPeriod(p);
    }
  }, [visible, currentTime]);

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const handleHourSelect = (h: number) => {
    triggerHaptic.selection();
    setHour(h);
  };

  const handleMinuteSelect = (m: number) => {
    triggerHaptic.selection();
    setMinute(m);
  };

  const handlePeriodToggle = (p: 'AM' | 'PM') => {
    triggerHaptic.selection();
    setPeriod(p);
  };

  const handleNow = () => {
    triggerHaptic.medium();
    const now = new Date();
    const rawH = now.getHours();
    const rawM = now.getMinutes();
    const p: 'AM' | 'PM' = rawH >= 12 ? 'PM' : 'AM';
    const h = rawH >= 12 ? (rawH > 12 ? rawH - 12 : 12) : rawH === 0 ? 12 : rawH;
    const m = Math.round(rawM / 5) * 5 % 60;
    setHour(h);
    setMinute(m);
    setPeriod(p);
  };

  const handleConfirm = () => {
    triggerHaptic.medium();
    let final24Hour = hour;
    if (period === 'PM' && hour < 12) {
      final24Hour = hour + 12;
    } else if (period === 'AM' && hour === 12) {
      final24Hour = 0;
    }

    const hh = String(final24Hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    onSelect(`${hh}:${mm}`);
    onClose();
  };

  const formattedDisplay = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-center items-center px-4">
        <View className="w-full max-w-sm bg-background-card border border-background-border rounded-2xl p-5 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-background-border mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center mr-2.5">
                <Clock size={16} color="#10B981" />
              </View>
              <Text className="text-base font-bold text-content-primary">Select Time</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-background-elevated items-center justify-center"
            >
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Time Display & AM/PM Switcher */}
          <View className="flex-row items-center justify-between bg-background-elevated p-3 rounded-xl border border-background-border mb-4">
            <Text className="text-2xl font-black text-content-primary font-mono tracking-tight">
              {formattedDisplay}
            </Text>

            <View className="flex-row bg-background-card p-1 rounded-lg border border-background-border">
              <TouchableOpacity
                onPress={() => handlePeriodToggle('AM')}
                className={`px-3 py-1 rounded-md ${period === 'AM' ? 'bg-primary' : ''}`}
              >
                <Text
                  className={`text-xs font-bold ${
                    period === 'AM' ? 'text-[#0F1012]' : 'text-content-secondary'
                  }`}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePeriodToggle('PM')}
                className={`px-3 py-1 rounded-md ${period === 'PM' ? 'bg-primary' : ''}`}
              >
                <Text
                  className={`text-xs font-bold ${
                    period === 'PM' ? 'text-[#0F1012]' : 'text-content-secondary'
                  }`}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hour Selector Grid (1-12) */}
          <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-2">
            Hour
          </Text>
          <View className="flex-row flex-wrap justify-between mb-4">
            {hours.map((h) => (
              <TouchableOpacity
                key={h}
                activeOpacity={0.7}
                onPress={() => handleHourSelect(h)}
                className={`w-[15%] h-8 items-center justify-center rounded-lg my-1 ${
                  hour === h ? 'bg-primary' : 'bg-background-elevated border border-background-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold font-mono ${
                    hour === h ? 'text-[#0F1012]' : 'text-content-primary'
                  }`}
                >
                  {h}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Minute Selector Grid (00, 05, 10 ... 55) */}
          <Text className="text-content-tertiary font-bold text-[10px] uppercase tracking-wider mb-2">
            Minute
          </Text>
          <View className="flex-row flex-wrap justify-between mb-2">
            {minutes.map((m) => (
              <TouchableOpacity
                key={m}
                activeOpacity={0.7}
                onPress={() => handleMinuteSelect(m)}
                className={`w-[15%] h-8 items-center justify-center rounded-lg my-1 ${
                  minute === m ? 'bg-primary' : 'bg-background-elevated border border-background-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold font-mono ${
                    minute === m ? 'text-[#0F1012]' : 'text-content-primary'
                  }`}
                >
                  {String(m).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer Actions */}
          <View className="flex-row items-center justify-between pt-4 mt-2 border-t border-background-border">
            <TouchableOpacity
              onPress={handleNow}
              className="px-3.5 py-2 rounded-lg bg-background-elevated border border-background-border"
            >
              <Text className="text-content-primary font-medium text-xs">Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-row items-center bg-primary px-5 py-2 rounded-lg"
            >
              <Check size={14} color="#0F1012" strokeWidth={3} />
              <Text className="text-[#0F1012] font-bold text-xs ml-1.5">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};