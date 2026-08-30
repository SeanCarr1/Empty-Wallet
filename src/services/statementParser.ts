import Papa from 'papaparse';
import { Transaction, TransactionType } from '../types';

export interface ParsedCSVRow {
  date: string;
  payee: string;
  amount: number;
  type: TransactionType;
  rawRow: Record<string, any>;
  isDuplicate?: boolean;
}

/**
 * Generate a consistent unique hash for duplicate detection.
 */
export function generateTransactionHash(date: string, payee: string, amount: number): string {
  return `${date.trim().toLowerCase()}_${payee.trim().toLowerCase()}_${amount.toFixed(2)}`;
}

/**
 * Parses raw CSV content and attempts to map column headers automatically.
 */
export function parseBankStatementCSV(
  csvContent: string,
  existingTransactions: Transaction[] = []
): Promise<ParsedCSVRow[]> {
  return new Promise((resolve, reject) => {
    // Index existing hashes for fast deduplication lookup
    const existingHashes = new Set(
      existingTransactions.map((tx) =>
        generateTransactionHash(tx.transactionDate, tx.payee, tx.amount)
      )
    );

    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        try {
          const parsedRows: ParsedCSVRow[] = [];

          for (const row of results.data as Record<string, string>[]) {
            const keys = Object.keys(row);
            if (keys.length === 0) continue;

            // Find Date Column
            const dateKey = keys.find((k) =>
              /date|trans(action)?_?date|posting_?date/i.test(k)
            );
            // Find Payee / Description Column
            const payeeKey = keys.find((k) =>
              /desc(ription)?|payee|merchant|narrative|particulars/i.test(k)
            );
            // Find Amount Column or Debit/Credit columns
            const amountKey = keys.find((k) =>
              /^amount$|trans(action)?_?amount|sum/i.test(k)
            );
            const debitKey = keys.find((k) => /debit|withdrawal|outflow/i.test(k));
            const creditKey = keys.find((k) => /credit|deposit|inflow/i.test(k));

            let rawDate = dateKey ? row[dateKey] : '';
            let rawPayee = payeeKey ? row[payeeKey] : 'Unknown Merchant';
            let amount = 0;
            let type: TransactionType = 'expense';

            if (debitKey && row[debitKey] && parseFloat(row[debitKey].replace(/[^0-9.-]/g, '')) > 0) {
              amount = parseFloat(row[debitKey].replace(/[^0-9.-]/g, ''));
              type = 'expense';
            } else if (creditKey && row[creditKey] && parseFloat(row[creditKey].replace(/[^0-9.-]/g, '')) > 0) {
              amount = parseFloat(row[creditKey].replace(/[^0-9.-]/g, ''));
              type = 'income';
            } else if (amountKey && row[amountKey]) {
              const cleaned = parseFloat(row[amountKey].replace(/[^0-9.-]/g, ''));
              if (!isNaN(cleaned)) {
                if (cleaned < 0) {
                  amount = Math.abs(cleaned);
                  type = 'expense';
                } else {
                  amount = cleaned;
                  type = 'income';
                }
              }
            }

            if (amount <= 0 || !rawDate) continue;

            // Normalize Date to YYYY-MM-DD
            const parsedDate = new Date(rawDate);
            const dateStr = !isNaN(parsedDate.getTime())
              ? parsedDate.toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0];

            const hash = generateTransactionHash(dateStr, rawPayee, amount);
            const isDuplicate = existingHashes.has(hash);

            parsedRows.push({
              date: dateStr,
              payee: rawPayee.trim(),
              amount,
              type,
              rawRow: row,
              isDuplicate,
            });
          }

          resolve(parsedRows);
        } catch (err) {
          reject(err);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}
