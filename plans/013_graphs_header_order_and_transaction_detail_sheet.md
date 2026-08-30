# Plan 013: Graphs & Charts Section Header Re-ordering & Read-Only Transaction Receipt Modal

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Position the "Graphs & Charts" section header immediately beneath "Wallets & Accounts" and create a reusable read-only "Transaction Receipt" detail modal with an "Edit Transaction" action.

---

## 1. Specifications

### 1.1 Today Page Section Hierarchy (`empty-wallet/app/(tabs)/index.tsx`)
- Order of elements:
  1. Top Net Balance Header (Logo + Balance + Transfer + Add buttons).
  2. **Wallets & Accounts**:
     - Header: `WALLETS & ACCOUNTS` | `Manage` button.
     - Content: `WalletGrid`.
  3. **Graphs & Charts**:
     - Header: `GRAPHS & CHARTS` | `Manage` button (opens `DashboardWidgetModal`).
     - Content: `SafeToSpendGauge`, `BalanceTrendLineChart`, `HorizontalCashFlowChart` (conditionally rendered).
  4. **Recent Transactions**:
     - Header: `RECENT TRANSACTIONS` | `View All Records`.
     - Content: `TransactionItem` list (tapping opens `TransactionDetailModal`).

### 1.2 Read-Only Transaction Detail Sheet (`src/components/transactions/TransactionDetailModal.tsx`)
- **Visual Presentation**:
  - Dark-themed bottom sheet modal with `statusBarTranslucent={true}`.
  - Large Hero Display: Category Icon + Formatted Amount (`+` / `-` colored by transaction type).
  - Info Matrix in elevated card:
    - Type badge (Expense / Income / Transfer)
    - Category & Macro Group
    - Account / Wallet (& Destination if Transfer)
    - Date & Time (formatted: `EEEE, MMM dd, yyyy 'at' hh:mm a`)
    - Payment Method (Cash, Card, Transfer, etc.)
    - Note / Description
  - Actions:
    - Header: Close button (X) and Delete button (Trash with alert confirmation).
    - Footer: **"Edit Transaction"** primary button with pencil icon -> opens `/modal/quick-add?id=${tx.id}`.

### 1.3 Wiring in Dashboard & Records (`index.tsx` & `records.tsx`)
- In `index.tsx`: Tapping any recent transaction opens `TransactionDetailModal`.
- In `records.tsx`: Tapping any ledger record opens `TransactionDetailModal`.

---

## 2. Subagent Delegation Plan (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1 (TransactionDetailModal Component)**:
  - Create `src/components/transactions/TransactionDetailModal.tsx`.
- **Subagent 2 (Dashboard Section Ordering & Integration)**:
  - Update `index.tsx` (reorder Graphs & Charts header right below Wallets & Accounts, wire `TransactionDetailModal`).
  - Update `records.tsx` (wire `TransactionDetailModal`).
- **Subagent 3 (Verification & Commit)**:
  - Run `npm run typecheck` and `npm test`.
  - Commit all changes to `main`.
