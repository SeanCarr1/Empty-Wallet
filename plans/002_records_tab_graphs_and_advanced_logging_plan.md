# Plan 002: Records Tab, Visual Cashflow & Balance Graphs, Advanced Logging & Logo Integration

**Status**: In Progress  
**Date**: 2026-08-30  
**Context**: Enhancing Empty-Wallet with visual financial graphs, dedicated transaction ledger with advanced filtering/sorting, full-featured record creation modal, and brand logo assets.

---

## 1. Feature Specifications

### 1.1 Brand Logo Integration
- Source image: `images/logo.jpg`.
- Targets:
  - Copy to `assets/logo.jpg`, `assets/icon.png`, `assets/splash-icon.png`, `assets/adaptive-icon.png`.
  - Display logo avatar in Dashboard header, Biometric lock gate, and Settings information card.

### 1.2 New Visual Graphs
- **Horizontal Cash Flow Graph** (`src/components/charts/HorizontalCashFlowChart.tsx`):
  - Horizontal proportional comparison bar of Income vs. Expense vs. Net Savings.
  - Inflow and outflow amounts with percentage contribution.
- **Balance Trend Graph** (`src/components/charts/BalanceTrendLineChart.tsx`):
  - Area/line graph showing cumulative wallet balance over selected timeframes (7 Days, 30 Days, 3 Months, 6 Months, All Time).
  - SVG smooth Bezier curve rendering with emerald gradient fill and min/max baseline indicators.
  - Quick Sparkline preview on Today Dashboard + Deep interactive chart on Analytics screen.

### 1.3 Dedicated Records Tab (`app/(tabs)/records.tsx`)
- 5-Tab Navigation Layout:
  1. `Today` (`app/(tabs)/index.tsx`)
  2. `Records` (`app/(tabs)/records.tsx`)
  3. `Budgets` (`app/(tabs)/budgets.tsx`)
  4. `Analytics` (`app/(tabs)/analytics.tsx`)
  5. `Settings` (`app/(tabs)/settings.tsx`)
- Ledger Capabilities:
  - **Instant Search**: Filter by Payee, Payer, Note, or Category.
  - **Multi-Criteria Filter Modal**:
    - By Record Type (`expense`, `income`, `transfer`).
    - By Categories (Multi-select filter chips).
    - By Amount Range (Min Amount to Max Amount).
    - By Date Range / Predefined Intervals (Today, This Week, This Month, Last 30 Days, All).
  - **Sorting Control**:
    - Time: Newest to Oldest, Oldest to Newest.
    - Amount: Highest to Lowest, Lowest to Highest.
    - Alphabetical by Payee/Category.
  - Summary Header: Total Filtered Inflow, Outflow, and Net result count.

### 1.4 Data Model & Schema Updates
- Update `src/types/index.ts`:
  - `PaymentType = 'cash' | 'debit_card' | 'credit_card' | 'transfer' | 'web_payment'`
  - Update `Transaction` interface:
    - `paymentType?: PaymentType | null`
    - `transactionTime?: string | null` (e.g. `14:30`)
    - `payer?: string | null`
- Update SQLite Schema in `src/db/schema.ts` and `src/db/client.ts` with columns:
  - `payment_type TEXT`
  - `transaction_time TEXT`
  - `payer TEXT`

### 1.5 Redesigned Add Record Modal (`app/modal/quick-add.tsx`)
- **1. Record Type**: Tabs for `Expense`, `Income`, `Transfer` (triggers Destination Wallet picker when Transfer).
- **2. Amount**: Large currency display + Haptic Keypad with inline math calculation.
- **3. Wallet Selector**: Dropdown / picker with account balance badges.
- **4. Category Selector**: Dropdown / grid with search and category icons.
- **5. Date & Time Picker**: Calendar date selector (Today, Yesterday, Custom) + Time clock picker (HH:mm AM/PM).
- **6. Other Details**:
  - Payer / Merchant input.
  - Payment Type dropdown: `Cash`, `Debit Card`, `Credit Card`, `Bank Transfer`, `Web Payment / E-Wallet`.
  - Note & memo textarea.

---

## 2. Implementation Subtasks & Agents Coordination
1. **Task A (Data & Models)**: Update `types`, `db/schema.ts`, `db/client.ts`, and `stores` with new fields (`paymentType`, `transactionTime`, `payer`).
2. **Task B (Branding & Logo Assets)**: Copy `images/logo.jpg` into `assets/` and integrate logo components into headers and lock screens.
3. **Task C (Visual Charts)**: Build `HorizontalCashFlowChart.tsx` and `BalanceTrendLineChart.tsx`.
4. **Task D (Records Tab)**: Build `app/(tabs)/records.tsx` with search, filter modal, sort modal, and summary badges.
5. **Task E (Add Record Modal)**: Redesign `app/modal/quick-add.tsx` with the complete 6-step form.
6. **Task F (Verification & Tests)**: Run typechecks and update unit tests for new fields and chart aggregations.
