import React, { useMemo, useEffect } from 'react';
import { View, Platform, Modal, TouchableOpacity, Text } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { triggerHaptic } from '../../services/haptics';

interface TimePickerModalProps {
  visible: boolean;
  currentTime: string;
  onSelect: (timeString: string) => void;
  onClose: () => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  currentTime,
  onSelect,
  onClose,
}) => {
  const dateObj = useMemo(() => {
    try {
      if (currentTime && currentTime.includes(':')) {
        const [h, m] = currentTime.split(':');
        const d = new Date();
        d.setHours(parseInt(h, 10) || 0, parseInt(m, 10) || 0, 0, 0);
        return d;
      }
      return new Date();
    } catch {
      return new Date();
    }
  }, [currentTime]);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date) {
      triggerHaptic.medium();
      onSelect(format(date, 'HH:mm'));
    }
    onClose();
  };

  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      try {
        DateTimePickerAndroid.open({
          value: dateObj,
          onChange: handleChange,
          mode: 'time',
          is24Hour: false,
          display: 'default',
        });
      } catch (err) {
        console.error('Error opening Android timepicker:', err);
        onClose();
      }
    }
  }, [visible]);

  if (!visible || Platform.OS === 'android') return null;

  // iOS Modal Presentation
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-[#17181C] rounded-t-2xl p-4 border-t border-[#2A2D35]">
          <View className="flex-row items-center justify-between pb-3 border-b border-[#2A2D35] mb-2">
            <TouchableOpacity onPress={onClose} className="px-3 py-1.5 rounded-lg bg-[#212329]">
              <Text className="text-[#9CA3AF] font-semibold text-xs">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white font-bold text-sm">Select Time</Text>
            <TouchableOpacity onPress={onClose} className="px-3 py-1.5 rounded-lg bg-[#10B981]">
              <Text className="text-[#0F1012] font-bold text-xs">Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            mode="time"
            display="spinner"
            themeVariant="dark"
            value={dateObj}
            is24Hour={false}
            onChange={handleChange}
            textColor="#FFFFFF"
          />
        </View>
      </View>
    </Modal>
  );
};
