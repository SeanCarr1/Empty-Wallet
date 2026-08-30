import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const DashboardWidgetModal: React.FC<Props> = ({ visible, onClose }) => {
  const { dashboardWidgets, setDashboardWidget } = useSettingsStore();

  const widgets: { key: keyof typeof dashboardWidgets; label: string }[] = [
    { key: 'safeToSpendGauge', label: 'Safe-to-Spend Daily Pace' },
    { key: 'sparklineTrend', label: 'Sparkline Trend' },
    { key: 'cashFlowSummary', label: 'Cash Flow Summary' },
  ];

  return (
    <Modal visible={visible} animationType='slide' transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Customize Widgets</Text>
            <TouchableOpacity onPress={onClose}>
              <X color='#FFF' size={24} />
            </TouchableOpacity>
          </View>
          {widgets.map(({ key, label }) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <TouchableOpacity
                style={[styles.toggle, dashboardWidgets[key] ? styles.toggleActive : styles.toggleInactive]}
                onPress={() => setDashboardWidget(key, !dashboardWidgets[key])}
              >
                <View style={dashboardWidgets[key] ? styles.circleActive : styles.circleInactive} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { backgroundColor: '#0F1012', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  label: { color: '#FFF', fontSize: 16 },
  toggle: { width: 50, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' },
  toggleActive: { backgroundColor: '#2A2D35', alignItems: 'flex-end' },
  toggleInactive: { backgroundColor: '#212329', alignItems: 'flex-start' },
  circleActive: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF' },
  circleInactive: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A2D35' },
});
