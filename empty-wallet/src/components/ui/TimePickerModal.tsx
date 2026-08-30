
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
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
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (visible) {
      let h = 12, m = 0, p: 'AM' | 'PM' = 'AM';
      if (currentTime && currentTime.includes(':')) {
        const parts = currentTime.split(':');
        const rawH = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        p = rawH >= 12 ? 'PM' : 'AM';
        h = rawH === 0 ? 12 : rawH > 12 ? rawH - 12 : rawH;
      }
      setHour(h); setMinute(m); setPeriod(p);
    }
  }, [visible, currentTime]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    let hh24 = period === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    onSelect(`${String(hh24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    triggerHaptic.medium();
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" statusBarTranslucent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center px-4">
        <View className="w-full max-w-sm bg-[#17181C] border border-[#2A2D35] rounded-2xl p-5 shadow-2xl">
          <View className="flex-row items-center justify-between pb-3 border-b border-[#2A2D35] mb-4">
            <View className="flex-row items-center"><View className="w-8 h-8 rounded-lg bg-[#10B981]/10 items-center justify-center mr-2.5"><Clock size={16} color="#10B981" /></View><Text className="text-base font-bold text-white">Select Time</Text></View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-[#212329] items-center justify-center"><X size={16} color="#9CA3AF" /></TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-[#212329] p-3 rounded-xl border border-[#2A2D35] mb-4">
            <View className="flex-row bg-[#17181C] p-1 rounded-lg border border-[#2A2D35]">
              <TouchableOpacity onPress={() => { setPeriod('AM'); triggerHaptic.selection(); }} className={`px-4 py-1.5 rounded-md ${period === 'AM' ? 'bg-[#10B981]' : ''}`}><Text className={`text-xs font-bold ${period === 'AM' ? 'text-black' : 'text-gray-400'}`}>AM</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => { setPeriod('PM'); triggerHaptic.selection(); }} className={`px-4 py-1.5 rounded-md ${period === 'PM' ? 'bg-[#10B981]' : ''}`}><Text className={`text-xs font-bold ${period === 'PM' ? 'text-black' : 'text-gray-400'}`}>PM</Text></TouchableOpacity>
            </View>
          </View>

          <View className="flex-row h-60 mb-4">
            <ScrollView className="flex-1 border-r border-[#2A2D35]">
              {hours.map(h => (
                <TouchableOpacity key={h} onPress={() => { setHour(h); triggerHaptic.selection(); }} className={`h-12 justify-center items-center rounded-full mx-2 ${hour === h ? 'bg-[#10B981]' : ''}`}>
                  <Text className={`font-bold ${hour === h ? 'text-black' : 'text-white'}`}>{h}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView className="flex-1">
              {minutes.map(m => (
                <TouchableOpacity key={m} onPress={() => { setMinute(m); triggerHaptic.selection(); }} className={`h-12 justify-center items-center rounded-full mx-2 ${minute === m ? 'bg-[#10B981]' : ''}`}>
                  <Text className={`font-bold ${minute === m ? 'text-black' : 'text-white'}`}>{String(m).padStart(2, '0')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity onPress={handleConfirm} className="flex-row items-center justify-center bg-[#10B981] p-3.5 rounded-xl"><Check size={18} color="black" /><Text className="text-black font-bold ml-2">Confirm</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};