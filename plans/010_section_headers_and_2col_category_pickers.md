# Plan 010: Consistent 2-Column Category Pickers & Today Page Section Architecture

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Standardize all category pickers across the app (Budgets & Targets, Subscriptions, Quick Add) to a 2-column grid, restore the clean Net Balance top header on the Today page, and introduce a dedicated "Graphs & Charts" section header with a right-aligned "Manage" button.

---

## 1. Specification

### 1.1 Today Page Section Architecture (`empty-wallet/app/(tabs)/index.tsx`)
- **Top Header**:
  - Revert extra buttons from the Net Balance row: Clean layout with App Logo, "Net Balance" label, and bold currency amount, with "Transfer" and "+ Add" action buttons cleanly placed.
- **Section Headers Pattern**:
  - **Wallets & Accounts**:
    - Left: `Wallets & Accounts` (uppercase 10px tracking-wider).
    - Right: `Manage` (text-primary text-xs font-semibold).
  - **Graphs & Charts** (New section header above the widgets/charts):
    - Left: `Graphs & Charts` (uppercase 10px tracking-wider).
    - Right: `Manage` (text-primary text-xs font-semibold -> opens `DashboardWidgetModal`).
  - **Recent Transactions**:
    - Left: `Recent Transactions` (uppercase 10px tracking-wider).
    - Right: `View All Records` (text-primary text-xs font-semibold).

### 1.2 Universal 2-Column Category Picker (`empty-wallet/app/(tabs)/budgets.tsx` & modals)
- In `budgets.tsx`:
  - **Category Limit Modal**: Ensure the category search picker renders items in a clean 2-column grid (`flex-row flex-wrap justify-between`, each item `w-[48%] mb-2`).
  - **Subscription Category & Wallet Picker**: Ensure category options are rendered in a clean grid or 2-column layout rather than horizontal overflow.
- In `quick-add.tsx`:
  - Verify that all category groups render with `w-[48%] mb-2` inside `flex-row flex-wrap justify-between`.

---

## 2. Delegation Matrix (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1**:
  - Update `empty-wallet/app/(tabs)/index.tsx` (restore top header, add "Graphs & Charts" section header with "Manage" button).
  - Update `empty-wallet/app/(tabs)/budgets.tsx` (2-column category pickers in budget and subscription modals).
- **Subagent 2**:
  - Run verification tests (`npm run typecheck` and `npm test`).
  - Commit all changes to `main`.
