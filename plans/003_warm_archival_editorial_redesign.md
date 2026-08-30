# Plan 003: Warm Archival / Monocle Editorial Redesign

**Status**: In Progress  
**Date**: 2026-08-30  
**Context**: Complete visual redesign of Empty-Wallet from generic dark mode into an organic, sophisticated Warm Archival & Monocle Editorial aesthetic.

---

## 1. Visual World Specification: "Warm Archival / Monocle Editorial"

### 1.1 Color Palette
- **Ground & Surfaces**:
  - Ground: Deep Warm Charcoal `#141312`
  - Card Surface: `#1D1B19`
  - Elevated Card: `#282522`
  - Card Border / Dividers: `#3B3632`
- **Typography & Content**:
  - Primary Ivory Parchment: `#F5F2EB`
  - Secondary Warm Sand: `#D6CFBF`
  - Tertiary Muted Ochre: `#948B7E`
  - Muted Rule: `#5A5248`
- **Semantic Accents**:
  - Inflow / Safe Pace: Sage Forest `#2A9D60` / `#34D399`
  - Outflow / Expense: Terracotta Vermilion `#DC4C38` / `#FB7185`
  - Warning: Warm Amber `#D97706` / `#FBBF24`
  - Sinking Funds / Goals: Warm Ochre Gold `#C69230`
  - Transfers & Wallets: Muted Denim `#4338CA` / `#6366F1`

### 1.2 Layout & Typography Character
- Refined editorial headers with generous breathing room.
- Tabular figures (`tabular-nums`) with clear accounting ledger alignment.
- Minimalist hairline rules between ledger rows.
- Tactile warm buttons with debossed feedback.

---

## 2. Redesign Implementation Tasks
1. **Design Tokens & Theme**:
   - Update `tailwind.config.js` with the Warm Archival color tokens.
   - Update `src/constants/colors.ts` with the new palette.
2. **Component Redesign**:
   - `HapticKeypad.tsx`: Warm tactile keys, warm amber/parchment action button.
   - `SafeToSpendGauge.tsx`: Organic paper-style daily allowance card with sage forest indicator.
   - `WalletCard.tsx`: Warm leather/card surfaces with gold/denim emblems.
   - `TransactionItem.tsx`: Editorial ledger row with refined category badges and hairline separators.
   - `HorizontalCashFlowChart.tsx` & `BalanceTrendLineChart.tsx`: Sage green & Terracotta vermilion color grading.
   - `CategoryDonutChart.tsx`: Organic earth and jewel tones.
3. **Screen Redesigns**:
   - `app/(tabs)/index.tsx` (Today Dashboard)
   - `app/(tabs)/records.tsx` (Records Ledger)
   - `app/(tabs)/budgets.tsx` (Budgets & Targets)
   - `app/(tabs)/analytics.tsx` (Financial Insights)
   - `app/(tabs)/settings.tsx` (Settings & Data)
   - `app/(tabs)/_layout.tsx` (Warm tab bar)
   - `app/modal/quick-add.tsx` (Add Record modal)
4. **Verification**:
   - Typecheck and run all 45 test suites.
   - Generate `DESIGN.md` at finish.
