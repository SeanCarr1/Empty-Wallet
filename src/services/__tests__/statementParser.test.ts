import {
  generateTransactionHash,
  parseBankStatementCSV,
} from '../statementParser';
import { Transaction } from '../../types';

describe('Statement Parser Service', () => {
  describe('generateTransactionHash', () => {
    it('should generate consistent hash with normalized lowercase and trimmed strings', () => {
      const hash1 = generateTransactionHash('2026-08-15', 'Starbucks Coffee', 150.5);
      const hash2 = generateTransactionHash('  2026-08-15  ', ' STARBUCKS COFFEE ', 150.5);
      expect(hash1).toBe('2026-08-15_starbucks coffee_150.50');
      expect(hash2).toBe('2026-08-15_starbucks coffee_150.50');
      expect(hash1).toBe(hash2);
    });

    it('should format amount to 2 decimal places in hash', () => {
      const hash = generateTransactionHash('2026-08-15', 'Store', 100);
      expect(hash).toBe('2026-08-15_store_100.00');

      const hashWithDecimals = generateTransactionHash('2026-08-15', 'Store', 100.456);
      expect(hashWithDecimals).toBe('2026-08-15_store_100.46');
    });

    it('should produce different hashes for different dates, payees, or amounts', () => {
      const base = generateTransactionHash('2026-08-15', 'Merchant', 50);
      const diffDate = generateTransactionHash('2026-08-16', 'Merchant', 50);
      const diffPayee = generateTransactionHash('2026-08-15', 'Other', 50);
      const diffAmount = generateTransactionHash('2026-08-15', 'Merchant', 60);

      expect(base).not.toBe(diffDate);
      expect(base).not.toBe(diffPayee);
      expect(base).not.toBe(diffAmount);
    });
  });

  describe('parseBankStatementCSV', () => {
    it('should parse single Amount column with positive (income) and negative (expense) values', async () => {
      const csv = `Date,Description,Amount
2026-08-10,Salary,50000.00
2026-08-11,Supermarket,-2500.75
2026-08-12,Coffee Shop,-180.00`;

      const results = await parseBankStatementCSV(csv);
      expect(results).toHaveLength(3);

      expect(results[0]).toMatchObject({
        date: '2026-08-10',
        payee: 'Salary',
        amount: 50000.0,
        type: 'income',
        isDuplicate: false,
      });

      expect(results[1]).toMatchObject({
        date: '2026-08-11',
        payee: 'Supermarket',
        amount: 2500.75,
        type: 'expense',
        isDuplicate: false,
      });

      expect(results[2]).toMatchObject({
        date: '2026-08-12',
        payee: 'Coffee Shop',
        amount: 180.0,
        type: 'expense',
        isDuplicate: false,
      });
    });

    it('should clean formatted currency symbols and commas in amount strings', async () => {
      const csv = `Date,Description,Amount
2026-08-10,Direct Deposit,"$5,000.00"
2026-08-11,Rent Payment,"-₱15,000.50"`;

      const results = await parseBankStatementCSV(csv);
      expect(results).toHaveLength(2);
      expect(results[0].amount).toBe(5000);
      expect(results[0].type).toBe('income');
      expect(results[1].amount).toBe(15000.5);
      expect(results[1].type).toBe('expense');
    });

    it('should parse separate Debit and Credit columns correctly', async () => {
      const csv = `Transaction Date,Merchant,Debit,Credit
2026-08-01,Client Payment,,25000.00
2026-08-03,Office Supplies,1200.00,
2026-08-04,Software Sub,499.00,0.00`;

      const results = await parseBankStatementCSV(csv);
      expect(results).toHaveLength(3);

      expect(results[0]).toMatchObject({
        date: '2026-08-01',
        payee: 'Client Payment',
        amount: 25000,
        type: 'income',
      });

      expect(results[1]).toMatchObject({
        date: '2026-08-03',
        payee: 'Office Supplies',
        amount: 1200,
        type: 'expense',
      });

      expect(results[2]).toMatchObject({
        date: '2026-08-04',
        payee: 'Software Sub',
        amount: 499,
        type: 'expense',
      });
    });

    it('should recognize various header naming conventions', async () => {
      // Test alternative header synonyms
      const csv1 = `posting_date,particulars,withdrawal,deposit
2026-08-10,ATM Cash Out,3000,
2026-08-12,Bonus,,10000`;

      const results1 = await parseBankStatementCSV(csv1);
      expect(results1).toHaveLength(2);
      expect(results1[0].payee).toBe('ATM Cash Out');
      expect(results1[0].type).toBe('expense');
      expect(results1[0].amount).toBe(3000);
      expect(results1[1].payee).toBe('Bonus');
      expect(results1[1].type).toBe('income');
      expect(results1[1].amount).toBe(10000);

      const csv2 = `trans_date,narrative,trans_amount
2026-08-15,Online Store,-149.99`;

      const results2 = await parseBankStatementCSV(csv2);
      expect(results2).toHaveLength(1);
      expect(results2[0].payee).toBe('Online Store');
      expect(results2[0].type).toBe('expense');
      expect(results2[0].amount).toBe(149.99);

      const csv3 = `Date,Payee,outflow,inflow
2026-08-20,Gas Station,50.00,
2026-08-21,Interest,,5.25`;

      const results3 = await parseBankStatementCSV(csv3);
      expect(results3).toHaveLength(2);
      expect(results3[0].type).toBe('expense');
      expect(results3[1].type).toBe('income');
    });

    it('should fallback payee to "Unknown Merchant" when no payee column matches', async () => {
      const csv = `Date,Amount
2026-08-15,-500.00`;

      const results = await parseBankStatementCSV(csv);
      expect(results).toHaveLength(1);
      expect(results[0].payee).toBe('Unknown Merchant');
      expect(results[0].amount).toBe(500);
      expect(results[0].type).toBe('expense');
    });

    it('should detect duplicate transactions based on existing transactions list', async () => {
      const existingTransactions: Transaction[] = [
        {
          id: 'tx-1',
          walletId: 'w-1',
          amount: 2500.75,
          type: 'expense',
          payee: 'Supermarket',
          transactionDate: '2026-08-11',
          createdAt: '2026-08-11T10:00:00Z',
        },
        {
          id: 'tx-2',
          walletId: 'w-1',
          amount: 50000,
          type: 'income',
          payee: 'Salary',
          transactionDate: '2026-08-10',
          createdAt: '2026-08-10T10:00:00Z',
        },
      ];

      const csv = `Date,Description,Amount
2026-08-10,Salary,50000.00
2026-08-11,Supermarket,-2500.75
2026-08-12,Coffee Shop,-180.00`;

      const results = await parseBankStatementCSV(csv, existingTransactions);
      expect(results).toHaveLength(3);

      // Salary -> duplicate
      expect(results[0].isDuplicate).toBe(true);
      // Supermarket -> duplicate
      expect(results[1].isDuplicate).toBe(true);
      // Coffee Shop -> new transaction
      expect(results[2].isDuplicate).toBe(false);
    });

    it('should skip rows with invalid/zero amounts or missing dates', async () => {
      const csv = `Date,Description,Amount
2026-08-10,Valid Row,-100.00
,Missing Date Row,-200.00
2026-08-12,Zero Amount Row,0.00
2026-08-13,Non-numeric Amount,ABC
2026-08-14,Another Valid Row,350.00`;

      const results = await parseBankStatementCSV(csv);
      expect(results).toHaveLength(2);
      expect(results[0].payee).toBe('Valid Row');
      expect(results[1].payee).toBe('Another Valid Row');
    });

    it('should retain original raw row data in rawRow property', async () => {
      const csv = `Date,Description,Amount,ExtraNotes
2026-08-15,Restaurant,-750.00,Dinner with team`;

      const results = await parseBankStatementCSV(csv);
      expect(results).toHaveLength(1);
      expect(results[0].rawRow).toEqual({
        Date: '2026-08-15',
        Description: 'Restaurant',
        Amount: '-750.00',
        ExtraNotes: 'Dinner with team',
      });
    });

    it('should handle empty CSV and header-only CSV gracefully', async () => {
      const emptyResults = await parseBankStatementCSV('');
      expect(emptyResults).toEqual([]);

      const headerOnly = await parseBankStatementCSV('Date,Description,Amount\n');
      expect(headerOnly).toEqual([]);
    });
  });
});
