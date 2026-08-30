# Plan 004: Precision Dark Gray System Reorganization

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Complete architectural and visual overhaul of Empty-Wallet based on the `/grill-me` design alignment: Linear/Raycast-inspired Precision Dark Gray palette, tight 8-12px geometry, flat borderless surface steps, high-density typography, docked 5-tab bar, and streamlined user flows.

---

## 1. System Architecture & Design Tokens

### 1.1 Color & Surface Tone Palette
- **Ground (`bg-background`)**: `#0F1012` (Cool Dark Slate Ground)
- **Base Surface / Card (`bg-background-card`)**: `#17181C` (Dark Charcoal Step 1)
- **Elevated Surface (`bg-background-elevated`)**: `#212329` (Muted Slate Step 2)
- **Dividers & Subtle Hairlines (`border-background-border`)**: `#2A2D35` (Ultra-subtle rule)
- **Primary / Inflow Accent**: `#10B981` (Electric Precision Emerald)
- **Expense / Outflow Accent**: `#EF4444` (Precision Crimson)
- **Transfer / Account Accent**: `#3B82F6` (Precision Ice Blue)
- **Warning / Alert Accent**: `#F59E0B` (Precision Amber)
- **Goal / Milestone Accent**: `#8B5CF6` (Precision Violet)
- **Text System**:
  - `text-content-primary`: `#F3F4F6` (High-contrast pure text)
  - `text-content-secondary`: `#9CA3AF` (Secondary values & subheaders)
  - `text-content-tertiary`: `#6B7280` (Overlines, labels, timestamps)
  - `text-content-muted`: `#4B5563` (Dividers, disabled states)

### 1.2 Rounding & Geometric Hierarchy
- **Cards & Modals**: `rounded-xl` (12px)
- **Keypad Buttons, Inputs & List Items**: `rounded-lg` (8px - 10px)
- **Badges, Filter Pills & Status Tags**: `rounded-md` (6px)
- **Eliminate**: Bulky 24px-32px pill shapes and excessive bubbles.

### 1.3 Card & Surface System
- Flat surface step contrast (`#0F1012` ground -> `#17181C` card -> `#212329` elevated inner components).
- Borderless flat aesthetic with clean single-pixel divider lines where separation is required.

### 1.4 Typography Hierarchy
- `Hero Balance`: 28pt-32pt Bold with `tabular-nums`
- `Screen Header`: 20pt Bold
- `Section Header`: 14pt-15pt Bold
- `Body / Values`: 13pt-14pt Medium / Bold
- `Metadata / Captions`: 11pt-12pt Medium
- `Overline / Micro-tags`: 10pt Uppercase Bold (`tracking-wider`)

---

## 2. Navigation & User Flow Reorganization

### 2.1 Docked 5-Tab Bottom Bar (`app/(tabs)/_layout.tsx`)
- Docked directly at `#17181C` with `#2A2D35` top divider.
- Tabs: `Today`, `Records`, `Budgets`, `Analytics`, `Settings`.
- Active tint `#10B981`, inactive `#6B7280`.
- Quick Add accessed via clean top header (+) or Records (+) action without floating button overlay.

### 2.2 Dashboard Flow (`app/(tabs)/index.tsx`)
1. Top Header: App icon + Net Balance + Quick Action (+ Add).
2. Minimalist Horizontal Wallets strip (flat card tiles).
3. Compact Safe-to-Spend Daily Velocity bar.
4. 30-Day Balance Trajectory sparkline chart.
5. Recent Ledger list with 1-tap navigation to full Records.

### 2.3 Records Ledger Flow (`app/(tabs)/records.tsx`)
1. Top Search Bar + Filter/Sort bottom sheet.
2. Inflow / Outflow summary pill bar.
3. Grouped ledger rows with category icon, payee, wallet, payment tag, time, and amount.

### 2.4 Quick Add Modal Flow (`app/modal/quick-add.tsx`)
1. Segmented Type Switcher (`Expense`, `Income`, `Transfer`).
2. High-contrast amount display.
3. Tight grid of presets (Wallets, Categories, Date/Time).
4. Compact Haptic Keypad with flat `#212329` buttons.

---

## 3. Subagent Decomposition & Execution Matrix

- **Agent 1 (Design Tokens & Base Components)**:
  - Update `tailwind.config.js`, `src/constants/colors.ts`, `DESIGN.md`.
  - Rebuild `HapticKeypad.tsx`, `SafeToSpendGauge.tsx`, `WalletCard.tsx`, `TransactionItem.tsx`.
- **Agent 2 (Charts & Navigation)**:
  - Rebuild `HorizontalCashFlowChart.tsx`, `BalanceTrendLineChart.tsx`, `CategoryDonutChart.tsx`, `MonthlyTrendBarChart.tsx`.
  - Rebuild `app/(tabs)/_layout.tsx` (Docked 5-Tab bar).
- **Agent 3 (Screens & Modals)**:
  - Rebuild `app/(tabs)/index.tsx`, `app/(tabs)/records.tsx`, `app/(tabs)/budgets.tsx`, `app/(tabs)/analytics.tsx`, `app/(tabs)/settings.tsx`.
  - Rebuild `app/modal/quick-add.tsx`, `app/modal/manage-wallets.tsx`, `app/modal/import-statement.tsx`, `app/_layout.tsx`.
- **Agent 4 (Verification & Tests)**:
  - Run typecheck and full Jest test suites.
