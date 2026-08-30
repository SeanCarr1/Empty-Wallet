import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { X, Trash2, Pencil, Calendar, Tag, CreditCard, User, FileText, ArrowRight } from 'lucide-react-native';
import { Transaction, Category, Wallet } from '../../types';

interface Props {
  visible: boolean;
  transaction: Transaction | null;
  category?: Category;
  wallet?: Wallet;
  destinationWallet?: Wallet;
  currency: string;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<Props> = ({
  visible,
  transaction,
  category,
  wallet,
  destinationWallet,
  currency,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!transaction) return null;

  const getAmountColor = () => {
    switch (transaction.type) {
      case 'expense': return '#EF4444';
      case 'income': return '#10B981';
      case 'transfer': return '#3B82F6';
      default: return '#FFFFFF';
    }
  };

  const getSign = () => {
    switch (transaction.type) {
      case 'expense': return '-';
      case 'income': return '+';
      default: return '';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Transaction Details</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => onDelete(transaction.id)} style={styles.iconButton}>
                <Trash2 color="#EF4444" size={22} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                <X color="#9CA3AF" size={22} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.hero}>
              <View style={[styles.badge, { backgroundColor: category?.color || wallet?.color || '#2A2D35' }]}>
                <Text style={{ fontSize: 24 }}>{category?.icon || '💰'}</Text>
              </View>
              <Text style={styles.payee}>{transaction.payee}</Text>
              <Text style={[styles.amount, { color: getAmountColor() }]}>
                {getSign()}{currency}{transaction.amount.toFixed(2)}
              </Text>
              <View style={styles.typeChip}>
                <Text style={styles.typeText}>{transaction.type.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <DetailRow icon={Calendar} label="Date" value={transaction.transactionDate} />
              <DetailRow icon={Tag} label="Category" value={category?.name || 'Uncategorized'} />
              <DetailRow icon={CreditCard} label="Account" value={wallet?.name || 'Unknown'} />
              {transaction.type === 'transfer' && destinationWallet && (
                <DetailRow icon={ArrowRight} label="To" value={destinationWallet.name} />
              )}
              {transaction.payer && <DetailRow icon={User} label="Payer" value={transaction.payer} />}
              {transaction.note && <DetailRow icon={FileText} label="Note" value={transaction.note} />}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(transaction.id)}>
            <Pencil color="#FFF" size={20} />
            <Text style={styles.editText}>Edit Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const DetailRow = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <View style={styles.detailRow}>
    <Icon color="#6B7280" size={18} />
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#17181C', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderTopWidth: 1, borderColor: '#2A2D35', maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 16 },
  iconButton: { padding: 4 },
  hero: { alignItems: 'center', marginBottom: 24 },
  badge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  payee: { color: '#FFF', fontSize: 20, fontWeight: '600', marginBottom: 4 },
  amount: { fontSize: 32, fontWeight: '800', marginBottom: 12 },
  typeChip: { backgroundColor: '#212329', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  typeText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  detailsCard: { backgroundColor: '#212329', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#2A2D35' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  detailLabel: { color: '#9CA3AF', fontSize: 14, flex: 1 },
  detailValue: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  editButton: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  editText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
