import React, { useState, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from 'lucide-react-native';
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

  // Sync when opening
  React.useEffect(() => {
    if (visible) {
      const d = currentDate ? parseISO(currentDate) : new Date();
      setSelectedDate(d);
      setCurrentMonth(d);
    }
  }, [visible, currentDate]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePrevMonth = () => {
    triggerHaptic.light();
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    triggerHaptic.light();
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleSelectDay = (day: Date) => {
    triggerHaptic.selection();
    setSelectedDate(day);
  };

  const handleToday = () => {
    triggerHaptic.medium();
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  const handleConfirm = () => {
    triggerHaptic.medium();
    onSelect(format(selectedDate, 'yyyy-MM-dd'));
    onClose();
  };

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
                <CalendarIcon size={16} color="#10B981" />
              </View>
              <Text className="text-base font-bold text-content-primary">Select Date</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-background-elevated items-center justify-center"
            >
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-content-primary font-bold text-base">
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <View className="flex-row items-center space-x-1">
              <TouchableOpacity
                onPress={handlePrevMonth}
                className="w-8 h-8 rounded-lg bg-background-elevated items-center justify-center border border-background-border mr-1.5"
              >
                <ChevronLeft size={16} color="#F3F4F6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextMonth}
                className="w-8 h-8 rounded-lg bg-background-elevated items-center justify-center border border-background-border"
              >
                <ChevronRight size={16} color="#F3F4F6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Headers */}
          <View className="flex-row justify-between mb-2">
            {weekdays.map((day, idx) => (
              <View key={idx} className="w-10 items-center justify-center">
                <Text className="text-[11px] font-bold text-content-tertiary uppercase">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Day Grid */}
          <View className="flex-row flex-wrap justify-between">
            {days.map((day, idx) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => handleSelectDay(day)}
                  className={`w-10 h-10 items-center justify-center rounded-xl my-0.5 ${
                    isSelected
                      ? 'bg-primary'
                      : isCurrentDay
                      ? 'bg-background-elevated border border-primary/50'
                      : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected
                        ? 'text-[#0F1012] font-bold'
                        : isCurrentMonth
                        ? 'text-content-primary'
                        : 'text-content-tertiary/40'
                    }`}
                  >
                    {format(day, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer Actions */}
          <View className="flex-row items-center justify-between pt-4 mt-2 border-t border-background-border">
            <TouchableOpacity
              onPress={handleToday}
              className="px-3.5 py-2 rounded-lg bg-background-elevated border border-background-border"
            >
              <Text className="text-content-primary font-medium text-xs">Today</Text>
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