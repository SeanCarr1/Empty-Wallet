
import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check, ChevronDown } from 'lucide-react-native';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  setMonth,
  setYear,
  getYear,
} from 'date-fns';
import { triggerHaptic } from '../../services/haptics';

interface DatePickerModalProps {
  visible: boolean;
  currentDate: string; // YYYY-MM-DD
  onSelect: (dateString: string) => void;
  onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  currentDate,
  onSelect,
  onClose,
}) => {
  const initialDate = useMemo(() => {
    try {
      return currentDate ? parseISO(currentDate) : new Date();
    } catch {
      return new Date();
    }
  }, [currentDate]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<'calendar' | 'select'>('calendar');

  React.useEffect(() => {
    if (visible) {
      const d = currentDate ? parseISO(currentDate) : new Date();
      setSelectedDate(d);
      setCurrentMonth(d);
      setViewMode('calendar');
    }
  }, [visible, currentDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = useMemo(() => eachDayOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePrevMonth = () => {
    triggerHaptic.light();
    setCurrentMonth((prev) => subMonths(prev, 1));
  };
  const handleNextMonth = () => {
    triggerHaptic.light();
    setCurrentMonth((prev) => addMonths(prev, 1));
  };
  const handlePrevYear = () => {
    triggerHaptic.light();
    setCurrentMonth((prev) => setYear(prev, getYear(prev) - 1));
  };
  const handleNextYear = () => {
    triggerHaptic.light();
    setCurrentMonth((prev) => setYear(prev, getYear(prev) + 1));
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Modal visible={visible} transparent={true} animationType="fade" statusBarTranslucent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/80 justify-center items-center px-4">
        <View className="w-full max-w-sm bg-[#17181C] border border-[#2A2D35] rounded-2xl p-5 shadow-2xl">
          <View className="flex-row items-center justify-between pb-3 border-b border-[#2A2D35] mb-4">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-lg bg-[#10B981]/10 items-center justify-center mr-2.5">
                <CalendarIcon size={16} color="#10B981" />
              </View>
              <Text className="text-base font-bold text-white">Select Date</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-[#212329] items-center justify-center">
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {viewMode === 'calendar' ? (
            <>
              <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => setViewMode('select')} className="flex-row items-center bg-[#212329] border border-[#2A2D35] px-3 py-1.5 rounded-lg active:opacity-80">
                  <Text className="text-white font-bold text-base mr-2">{format(currentMonth, 'MMMM yyyy')}</Text>
                  <ChevronDown size={14} color="#10B981" />
                </TouchableOpacity>
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={handlePrevMonth} className="w-8 h-8 rounded-lg bg-[#212329] items-center justify-center border border-[#2A2D35] mr-1.5"><ChevronLeft size={16} color="#F3F4F6" /></TouchableOpacity>
                  <TouchableOpacity onPress={handleNextMonth} className="w-8 h-8 rounded-lg bg-[#212329] items-center justify-center border border-[#2A2D35]"><ChevronRight size={16} color="#F3F4F6" /></TouchableOpacity>
                </View>
              </View>
              <View className="flex-row justify-between mb-2">
                {weekdays.map((day, idx) => <View key={idx} className="w-10 items-center justify-center"><Text className="text-[11px] font-bold text-[#9CA3AF] uppercase">{day}</Text></View>)}
              </View>
              <View className="flex-row flex-wrap justify-between">
                {days.map((day, idx) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  return (
                    <TouchableOpacity key={idx} activeOpacity={0.7} onPress={() => { setSelectedDate(day); triggerHaptic.selection(); }} className={`w-10 h-10 items-center justify-center rounded-xl my-0.5 ${isSelected ? 'bg-[#10B981]' : ''}`}>
                      <Text className={`text-xs font-semibold ${isSelected ? 'text-[#0F1012] font-bold' : isCurrentMonth ? 'text-white' : 'text-[#4B5563]'}`}>{format(day, 'd')}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : (
            <>
              <View className="flex-row items-center justify-between mb-3 px-1">
                <TouchableOpacity onPress={handlePrevYear} className="w-8 h-8 rounded-lg bg-[#212329] items-center justify-center border border-[#2A2D35]"><ChevronLeft size={16} color="#F3F4F6" /></TouchableOpacity>
                <Text className="text-white font-bold text-base">{getYear(currentMonth)}</Text>
                <TouchableOpacity onPress={handleNextYear} className="w-8 h-8 rounded-lg bg-[#212329] items-center justify-center border border-[#2A2D35]"><ChevronRight size={16} color="#F3F4F6" /></TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap">
                {months.map((m, idx) => (
                  <TouchableOpacity key={m} onPress={() => { setCurrentMonth(setMonth(currentMonth, idx)); setViewMode('calendar'); }} className="w-1/4 p-2 items-center">
                    <Text className="text-white text-xs font-bold">{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <View className="flex-row items-center justify-between pt-4 mt-2 border-t border-[#2A2D35]">
            <TouchableOpacity onPress={() => { const today = new Date(); setSelectedDate(today); setCurrentMonth(today); triggerHaptic.medium(); }} className="px-3.5 py-2 rounded-lg bg-[#212329] border border-[#2A2D35]"><Text className="text-white font-medium text-xs">Today</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { onSelect(format(selectedDate, 'yyyy-MM-dd')); onClose(); triggerHaptic.medium(); }} className="flex-row items-center bg-[#10B981] px-5 py-2 rounded-lg"><Check size={14} color="#0F1012" strokeWidth={3} /><Text className="text-[#0F1012] font-bold text-xs ml-1.5">Confirm</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};