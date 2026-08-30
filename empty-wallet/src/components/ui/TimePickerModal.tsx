import React, { useMemo } from 'react';
import { View, Platform, Modal, TouchableOpacity, Text } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
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
      return parse(currentTime, 'HH:mm', new Date());
    } catch {
      return new Date();
    }
  }, [currentTime]);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'set' && date) {
      onSelect(format(date, 'HH:mm'));
      triggerHaptic.medium();
      onClose();
    } else {
      onClose();
    }
  };

  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        mode='time'
        display='default'
        value={dateObj}
        is24Hour={false}
        onChange={handleChange}
      />
    );
  }

  return (
    <Modal visible={visible} transparent={true} animationType='fade' onRequestClose={onClose}>
      <View className='flex-1 bg-black/80 justify-end'>
        <View className='bg-[#17181C] rounded-t-2xl p-5 border-t border-[#2A2D35]'>
          <View className='flex-row justify-between mb-4'>
            <TouchableOpacity onPress={onClose}><Text className='text-white font-bold'>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={onClose}><Text className='text-[#10B981] font-bold'>Done</Text></TouchableOpacity>
          </View>
          <DateTimePicker
            mode='time'
            display='spinner'
            themeVariant='dark'
            value={dateObj}
            is24Hour={false}
            onChange={handleChange}
          />
        </View>
      </View>
    </Modal>
  );
};
