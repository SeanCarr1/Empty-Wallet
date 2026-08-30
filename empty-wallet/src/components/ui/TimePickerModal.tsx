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
  const [hour, setHour] = useState<number>(12);
  const [minute, setMinute] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');

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
      setHour(h); setMinute(m); setPeriod(p); setMode('hour');
    }
  }, [visible, currentTime]);

  const handleConfirm = () => {
    let hh24 = period === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
    onSelect(`${String(hh24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    triggerHaptic.medium();
    onClose();
  };

  const getPosition = (val: number, isHour: boolean, radius: number) => {
    const angle = isHour ? (val * 30 - 90) * (Math.PI / 180) : ((val / 5) * 30 - 90) * (Math.PI / 180);
    return {
      x: radius * Math.cos(angle) + radius,
      y: radius * Math.sin(angle) + radius,
    };
  };

  const renderClockNumbers = () => {
    const radius = 110;
    const items = mode === 'hour' ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    return items.map((val, i) => {
      const pos = getPosition(i === 0 ? (mode === 'hour' ? 12 : 0) : (mode === 'hour' ? i : i * 5), mode === 'hour', radius - 20);
      const isSelected = mode === 'hour' ? hour === val : minute === val;
      return (
        <TouchableOpacity key={val} onPress={() => { mode === 'hour' ? setHour(val) : setMinute(val); triggerHaptic.selection(); if (mode === 'hour') setMode('minute'); }} style={{ position: 'absolute', left: pos.x - 15, top: pos.y - 15, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: isSelected ? '#10B981' : 'transparent' }}>
          <Text className={`text-sm font-bold ${isSelected ? 'text-black' : 'text-white'}`}>{String(val).padStart(2, '0')}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" statusBarTranslucent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center px-4">
        <View className="w-full max-w-sm bg-[#17181C] border border-[#2A2D35] rounded-2xl p-5 shadow-2xl">
          <View className="flex-row items-center justify-between pb-3 border-b border-[#2A2D35] mb-4">
            <View className="flex-row items-center"><View className="w-8 h-8 rounded-lg bg-[#10B981]/10 items-center justify-center mr-2.5"><Clock size={16} color="#10B981" /></View><Text className="text-base font-bold text-white">Select Time</Text></View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-[#212329] items-center justify-center"><X size={16} color="#9CA3AF" /></TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between bg-[#212329] p-3 rounded-xl border border-[#2A2D35] mb-6">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setMode('hour')}><Text className={`text-4xl font-bold ${mode === 'hour' ? 'text-white' : 'text-gray-500'}`}>{hour}</Text></TouchableOpacity>
              <Text className="text-4xl font-bold text-gray-500 mx-1">:</Text>
              <TouchableOpacity onPress={() => setMode('minute')}><Text className={`text-4xl font-bold ${mode === 'minute' ? 'text-white' : 'text-gray-500'}`}>{String(minute).padStart(2, '0')}</Text></TouchableOpacity>
            </View>
            <View className="bg-[#17181C] p-1 rounded-lg border border-[#2A2D35]">
              <TouchableOpacity onPress={() => setPeriod('AM')} className={`px-3 py-1 rounded-md ${period === 'AM' ? 'bg-[#10B981]' : ''}`}><Text className="text-xs font-bold text-white">AM</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setPeriod('PM')} className={`px-3 py-1 rounded-md ${period === 'PM' ? 'bg-[#10B981]' : ''}`}><Text className="text-xs font-bold text-white">PM</Text></TouchableOpacity>
            </View>
          </View>

          <View className="w-[220px] h-[220px] rounded-full bg-[#17181C] border-4 border-[#2A2D35] self-center items-center justify-center mb-6">
            <View className="w-3 h-3 rounded-full bg-[#10B981]" />
            {renderClockNumbers()}
          </View>

          <View className="flex-row flex-wrap justify-between gap-2 mb-6">
            {[
              { label: 'Now', time: new Date() },
              { label: 'Morning', time: new Date().setHours(9, 0) },
              { label: 'Noon', time: new Date().setHours(12, 0) },
              { label: 'Evening', time: new Date().setHours(19, 0) },
            ].map(preset => (
              <TouchableOpacity key={preset.label} onPress={() => { const d = new Date(preset.time); setHour(d.getHours() % 12 || 12); setMinute(d.getMinutes()); setPeriod(d.getHours() >= 12 ? 'PM' : 'AM'); triggerHaptic.selection(); }} className="bg-[#212329] px-3 py-2 rounded-lg border border-[#2A2D35]"><Text className="text-[10px] text-white font-medium">{preset.label}</Text></TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleConfirm} className="flex-row items-center justify-center bg-[#10B981] p-3.5 rounded-xl"><Check size={18} color="black" /><Text className="text-black font-bold ml-2">Confirm</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
