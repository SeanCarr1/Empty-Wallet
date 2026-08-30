# Plan 007: UI Polish, Full Record CRUD, 2-Row Wallets, and Customizable Graphs

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Address all user-reported interaction and visual refinements across Empty-Wallet: smooth scroll, popup keypad sheet, full record CRUD, direct transfer tab navigation, customizable/optional graphs, 2-column wallets grid, and pixel-level layout spacing polish.

---

## 1. Specification Breakdown

### 1.1 Quick Add & Edit Modal (`empty-wallet/app/modal/quick-add.tsx`)
- **Scroll Fix**: Remove sticky bottom keypad from root view; wrap the entire form inside a smooth `ScrollView` with `keyboardShouldPersistTaps="handled"`.
- **Popup Keypad Sheet**: Tapping the Amount field opens a dedicated Numeric Keypad bottom sheet modal with arithmetic operations (`+`, `-`), live calculation, and a "Done" button.
- **Full CRUD Support**:
  - Accept query params: `id` (transaction ID for editing).
  - Pre-populate all fields when editing: Type, Amount, Wallet, Category, Date/Time, Payer, Payee, Payment Type, Note.
  - Header displays "Edit Record" with a Trash icon button for quick deletion.
  - Primary button shows "Update Record" and calls `updateTransaction`.

### 1.2 Store Enhancements (`empty-wallet/src/stores/useTransactionStore.ts` & `useSettingsStore.ts`)
- `useTransactionStore`:
  - Implement `updateTransaction(id: string, newTx: Omit<Transaction, 'id' | 'createdAt'>)`.
  - Reverses old wallet balance impact and applies new wallet balance adjustments safely inside SQLite transaction.
- `useSettingsStore`:
  - Add `enabledCharts`:
    ```ts
    enabledCharts: {
      cashFlow: true,
      balanceTrend: true,
      categoryDonut: true,
      monthlyTrend: true,
      sparklineTrend: true,
    }
    toggleChart: (key: keyof EnabledCharts) => void
    ```

### 1.3 Dashboard Navigation & Wallets Layout (`empty-wallet/app/(tabs)/index.tsx`)
- **Transfer Header Button**: Navigates to `/modal/manage-wallets?tab=transfer` and activates the "Transfer Funds" tab directly.
- **2-Row Wallets Grid**:
  - Replaces horizontal carousel with a 2-column grid (`flex-row flex-wrap`).
  - Card layout: Left icon badge, right wallet name/type & balance.
  - Displays max 2 rows (up to 4 wallets) by default.
  - "Show All (N)" / "Show Less" toggle button if more than 4 wallets exist.

### 1.4 Optional & Customizable Graphs (`empty-wallet/app/(tabs)/analytics.tsx` & `settings.tsx`)
- Add "Customize Charts" modal in Analytics header and toggle switches in Settings.
- Respect `enabledCharts` flags before rendering `HorizontalCashFlowChart`, `BalanceTrendLineChart`, `CategoryDonutChart`, `MonthlyTrendBarChart`, and Dashboard sparkline.
- Show an empty state card with "Customize Charts" trigger if all charts are hidden.

### 1.5 Budgets Category Limit Dropdown (`empty-wallet/app/(tabs)/budgets.tsx`)
- In "Set Category Limit" modal, replace horizontal list with an interactive dropdown/modal picker with search bar and organized 9 macro-category sections.

### 1.6 Layout & Spacing Polish
- **Analytics Header** (`analytics.tsx`): Fix "Export CSV" button overlapping with description text using `flex-row items-start justify-between` and `flex-1 mr-3`.
- **Net Balance Progression Chart** (`BalanceTrendLineChart.tsx`): Fix text colliding with `7D 30D 90D ALL` chips with proper spacing and `flex-wrap`.
- **Records Search & Filter Bar** (`records.tsx`): Match exact heights (`h-11`) of Search input and Filter button (`SlidersHorizontal`).
- **Clickable Ledger Items** (`records.tsx` & `index.tsx`): Clicking any transaction opens `/modal/quick-add?id=${tx.id}` for instant editing.

---

## 2. Subagent Delegation Matrix (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1 (Stores & Data)**:
  - Add `updateTransaction` to `useTransactionStore.ts`.
  - Add `enabledCharts` and `toggleChart` to `useSettingsStore.ts`.
- **Subagent 2 (Quick Add & Edit Modal + Keypad Sheet)**:
  - Update `empty-wallet/app/modal/quick-add.tsx` with popup keypad sheet, smooth scrolling, and full CRUD edit mode.
- **Subagent 3 (Dashboard & Wallets Grid + Transfer Tab Routing)**:
  - Update `empty-wallet/app/(tabs)/index.tsx` (2-column wallets grid, transfer button link).
  - Update `empty-wallet/app/modal/manage-wallets.tsx` (reads `tab=transfer` param).
- **Subagent 4 (Analytics, Spacing & Budgets Category Dropdown)**:
  - Polish `analytics.tsx` and `BalanceTrendLineChart.tsx` header spacing.
  - Add "Customize Charts" modal in `analytics.tsx` and `settings.tsx`.
  - Update `budgets.tsx` category limit dropdown.
  - Update `records.tsx` search/filter bar height and wire edit clicks.
- **Subagent 5 (Verification & Commit)**:
  - Run `npm run typecheck` and `npm test` inside `empty-wallet/`.
  - Commit all changes to `main`.
