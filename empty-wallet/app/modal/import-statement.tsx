import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTransactionStore } from '../../src/stores/useTransactionStore';
import { useWalletStore } from '../../src/stores/useWalletStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { parseBankStatementCSV, ParsedCSVRow } from '../../src/services/statementParser';
import { formatCurrency } from '../../src/services/currency';
import { triggerHaptic } from '../../src/services/haptics';
import { X, FileSpreadsheet, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

export default function ImportStatementModal() {
  const router = useRouter();
  const { transactions, batchAddTransactions } = useTransactionStore();
  const { wallets } = useWalletStore();
  const currency = useSettingsStore((s) => s.currency);

  const [loading, setLoading] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || 'wallet_main_bank');
  const [parsedRows, setParsedRows] = useState<ParsedCSVRow[]>([]);
  const [pastedCSV, setPastedCSV] = useState('');
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');

  const handlePickDocument = async () => {
    try {
      triggerHaptic.selection();
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const fileUri = res.assets[0].uri;
      setLoading(true);

      const content = await FileSystem.readAsStringAsync(fileUri);
      const rows = await parseBankStatementCSV(content, transactions);
      setParsedRows(rows);
      triggerHaptic.success();
    } catch (err) {
      console.error('Error reading document:', err);
      triggerHaptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleParsePasted = async () => {
    if (!pastedCSV.trim()) return;
    try {
      setLoading(true);
      triggerHaptic.selection();
      const rows = await parseBankStatementCSV(pastedCSV, transactions);
      setParsedRows(rows);
      triggerHaptic.success();
    } catch (err) {
      console.error('Error parsing pasted CSV:', err);
      triggerHaptic.error();
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = () => {
    const toImport = parsedRows.filter((r) => !r.isDuplicate);
    if (toImport.length === 0) {
      triggerHaptic.error();
      return;
    }

    triggerHaptic.success();
    batchAddTransactions(
      toImport.map((r) => ({
        walletId: selectedWalletId,
        amount: r.amount,
        type: r.type,
        payee: r.payee,
        transactionDate: r.date,
      }))
    );

    router.back();
  };

  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;
  const newCount = parsedRows.length - duplicateCount;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2.5 border-b border-background-border">
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          className="p-1.5 -ml-1 rounded-lg"
        >
          <X size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <Text className="text-sm font-bold text-content-primary">Import Statement</Text>

        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4 pt-2.5" showsVerticalScrollIndicator={false}>
        {/* Wallet Selection */}
        <View className="mb-3.5">
          <Text className="text-content-tertiary text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Target Destination Wallet
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-1">
            {wallets.map((w) => {
              const isSelected = selectedWalletId === w.id;
              return (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedWalletId(w.id);
                  }}
                  className={`px-3 py-2 rounded-lg mx-1 border ${
                    isSelected ? 'bg-primary/20 border-primary' : 'bg-background-card border-background-border'
                  }`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-content-primary'}`}>
                    {w.name}
                  </Text>
                  <Text className="text-content-tertiary text-[10px] font-mono">
                    {formatCurrency(w.balance, w.currency)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Input Mode Selector */}
        <View className="flex-row bg-background-card p-1 rounded-lg mb-3.5 border border-background-border">
          <TouchableOpacity
            onPress={() => setMode('upload')}
            className={`flex-1 py-2 rounded-md items-center ${mode === 'upload' ? 'bg-background-elevated' : ''}`}
          >
            <Text className={`text-xs font-semibold ${mode === 'upload' ? 'text-content-primary' : 'text-content-tertiary'}`}>
              Upload File (.csv)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('paste')}
            className={`flex-1 py-2 rounded-md items-center ${mode === 'paste' ? 'bg-background-elevated' : ''}`}
          >
            <Text className={`text-xs font-semibold ${mode === 'paste' ? 'text-content-primary' : 'text-content-tertiary'}`}>
              Paste CSV Text
            </Text>
          </TouchableOpacity>
        </View>

        {parsedRows.length === 0 ? (
          mode === 'upload' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickDocument}
              className="bg-background-card border-2 border-dashed border-background-border rounded-xl p-7 items-center justify-center my-3"
            >
              {loading ? (
                <ActivityIndicator color="#10B981" />
              ) : (
                <>
                  <View className="w-12 h-12 rounded-lg bg-accent-blue/15 items-center justify-center mb-2.5">
                    <FileSpreadsheet size={24} color="#3B82F6" />
                  </View>
                  <Text className="text-content-primary font-bold text-sm">Select Bank CSV File</Text>
                  <Text className="text-content-secondary text-xs text-center mt-1">
                    Supports exports from Maya, GCash, BDO, BPI, UnionBank, or standard bank statements.
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View className="bg-background-card p-3.5 rounded-xl border border-background-border">
              <Text className="text-content-secondary text-xs mb-2">Paste raw CSV text containing headers and rows:</Text>
              <TextInput
                value={pastedCSV}
                onChangeText={setPastedCSV}
                multiline
                numberOfLines={6}
                placeholder="Date,Payee,Amount&#10;2026-08-01,Starbucks,180.00&#10;2026-08-02,Salary,45000"
                placeholderTextColor="#6B7280"
                className="bg-background-elevated border border-background-border rounded-lg p-2.5 text-content-primary text-xs font-mono mb-3.5 h-32"
              />
              <TouchableOpacity
                onPress={handleParsePasted}
                className="bg-primary py-2.5 rounded-lg items-center active:opacity-80"
              >
                <Text className="text-[#0F1012] font-bold text-xs">Parse CSV Rows</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View>
            {/* Summary Bar */}
            <View className="flex-row items-center justify-between bg-background-card p-3.5 rounded-xl border border-background-border mb-3.5">
              <View>
                <Text className="text-content-primary font-bold text-xs">
                  {parsedRows.length} Transactions Found
                </Text>
                <Text className="text-content-tertiary text-[11px]">
                  {newCount} new to import • {duplicateCount} duplicates detected
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setParsedRows([])}
                className="bg-background-elevated px-2.5 py-1 rounded-md border border-background-border"
              >
                <Text className="text-content-secondary text-xs font-semibold">Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Parsed Rows Preview */}
            <View className="mb-5">
              {parsedRows.map((row, idx) => (
                <View
                  key={`parsed-${idx}`}
                  className={`flex-row items-center justify-between p-2.5 rounded-lg mb-2 border ${
                    row.isDuplicate
                      ? 'bg-background-card/40 border-background-border/30 opacity-60'
                      : 'bg-background-card border-background-border'
                  }`}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View
                      className={`w-7 h-7 rounded-lg items-center justify-center mr-2 ${
                        row.type === 'income' ? 'bg-primary/20' : 'bg-expense/20'
                      }`}
                    >
                      {row.type === 'income' ? (
                        <ArrowDownLeft size={14} color="#10B981" />
                      ) : (
                        <ArrowUpRight size={14} color="#EF4444" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-content-primary font-bold text-xs truncate" numberOfLines={1}>
                        {row.payee}
                      </Text>
                      <Text className="text-content-tertiary text-[10px] font-mono">{row.date}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text
                      className={`font-bold text-xs font-mono ${
                        row.type === 'income' ? 'text-primary' : 'text-content-primary'
                      }`}
                    >
                      {row.type === 'income' ? '+' : '-'}
                      {formatCurrency(row.amount, currency)}
                    </Text>
                    {row.isDuplicate && (
                      <Text className="text-accent-amber text-[10px] font-semibold mt-0.5">
                        Duplicate
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Execute Import Action */}
            <TouchableOpacity
              onPress={handleExecuteImport}
              disabled={newCount === 0}
              className={`py-3 rounded-lg items-center mb-8 ${
                newCount > 0 ? 'bg-primary active:opacity-80' : 'bg-background-card opacity-50'
              }`}
            >
              <Text className="text-[#0F1012] font-bold text-sm">
                Import {newCount} Transactions
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
