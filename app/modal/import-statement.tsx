import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
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
import { X, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

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
    // Filter out duplicates
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
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-background-border/50">
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          className="p-2 -ml-2 rounded-full"
        >
          <X size={24} color="#94A3B8" />
        </TouchableOpacity>

        <Text className="text-base font-bold text-content-primary">Import Statement</Text>

        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
        {/* Wallet Selection */}
        <View className="mb-4">
          <Text className="text-content-secondary text-xs font-semibold uppercase mb-2">
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
                  className={`px-3.5 py-2.5 rounded-2xl mx-1 border ${
                    isSelected ? 'bg-primary/20 border-primary' : 'bg-background-card border-background-border'
                  }`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-content-primary'}`}>
                    {w.name}
                  </Text>
                  <Text className="text-content-tertiary text-[10px]">
                    {formatCurrency(w.balance, w.currency)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Input Mode Selector */}
        <View className="flex-row bg-background-card p-1 rounded-2xl mb-4 border border-background-border">
          <TouchableOpacity
            onPress={() => setMode('upload')}
            className={`flex-1 py-2 rounded-xl items-center ${mode === 'upload' ? 'bg-background-elevated' : ''}`}
          >
            <Text className={`text-xs font-semibold ${mode === 'upload' ? 'text-content-primary' : 'text-content-tertiary'}`}>
              Upload File (.csv)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('paste')}
            className={`flex-1 py-2 rounded-xl items-center ${mode === 'paste' ? 'bg-background-elevated' : ''}`}
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
              className="bg-background-card border-2 border-dashed border-background-border rounded-3xl p-8 items-center justify-center my-4"
            >
              {loading ? (
                <ActivityIndicator color="#10B981" />
              ) : (
                <>
                  <View className="w-14 h-14 rounded-2xl bg-accent-blue/10 items-center justify-center mb-3">
                    <FileSpreadsheet size={28} color="#3B82F6" />
                  </View>
                  <Text className="text-content-primary font-bold text-base">Select Bank CSV File</Text>
                  <Text className="text-content-secondary text-xs text-center mt-1">
                    Supports exports from Maya, GCash, BDO, BPI, UnionBank, or any standard bank statement.
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View className="bg-background-card p-4 rounded-2xl border border-background-border">
              <Text className="text-content-secondary text-xs mb-2">Paste raw CSV text containing headers and rows:</Text>
              <TextInput
                value={pastedCSV}
                onChangeText={setPastedCSV}
                multiline
                numberOfLines={6}
                placeholder="Date,Payee,Amount&#10;2026-08-01,Starbucks,180.00&#10;2026-08-02,Salary,45000"
                placeholderTextColor="#64748B"
                className="bg-background-elevated border border-background-border rounded-xl p-3 text-content-primary text-xs font-mono mb-4 h-32"
              />
              <TouchableOpacity
                onPress={handleParsePasted}
                className="bg-primary py-3 rounded-xl items-center"
              >
                <Text className="text-background font-bold text-xs">Parse CSV Rows</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View>
            {/* Summary Bar */}
            <View className="flex-row items-center justify-between bg-background-card p-4 rounded-2xl border border-background-border mb-4">
              <View>
                <Text className="text-content-primary font-bold text-sm">
                  {parsedRows.length} Transactions Found
                </Text>
                <Text className="text-content-tertiary text-xs">
                  {newCount} new to import • {duplicateCount} duplicates detected
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setParsedRows([])}
                className="bg-background-elevated px-3 py-1.5 rounded-xl border border-background-border"
              >
                <Text className="text-content-secondary text-xs font-semibold">Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Parsed Rows Preview */}
            <View className="mb-6">
              {parsedRows.map((row, idx) => (
                <View
                  key={`parsed-${idx}`}
                  className={`flex-row items-center justify-between p-3 rounded-2xl mb-2 border ${
                    row.isDuplicate
                      ? 'bg-background-card/40 border-background-border/30 opacity-60'
                      : 'bg-background-card border-background-border'
                  }`}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <View
                      className={`w-8 h-8 rounded-xl items-center justify-center mr-2.5 ${
                        row.type === 'income' ? 'bg-primary/20' : 'bg-expense/20'
                      }`}
                    >
                      {row.type === 'income' ? (
                        <ArrowDownLeft size={16} color="#10B981" />
                      ) : (
                        <ArrowUpRight size={16} color="#F43F5E" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-content-primary font-bold text-xs truncate" numberOfLines={1}>
                        {row.payee}
                      </Text>
                      <Text className="text-content-tertiary text-[10px]">{row.date}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text
                      className={`font-bold text-xs ${
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
              className={`py-4 rounded-2xl items-center mb-8 ${
                newCount > 0 ? 'bg-primary' : 'bg-background-card opacity-50'
              }`}
            >
              <Text className="text-background font-bold text-base">
                Import {newCount} Transactions
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
