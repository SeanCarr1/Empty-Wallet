# Plan 011: Eliminate White Screen Flash, Remove Input Lag, and Implement Comprehensive Chart Axes & Labels

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Fix screen transition white flashes via React Navigation dark theme and contentStyle lockdowns, optimize Quick Add state management to eliminate input/selection lag, and enrich all charts with visible X/Y axes, currency scales, and data labels.

---

## 1. Architectural Changes

### 1.1 White Screen Flash Elimination (`empty-wallet/app/_layout.tsx` & `empty-wallet/app.json`)
- **`app.json`**:
  - Set root `"backgroundColor": "#0F1012"` and `"userInterfaceStyle": "dark"`.
  - Android navigation bar / status bar background: `#0F1012`.
- **`_layout.tsx`**:
  - Implement custom `DarkTheme` passed to `ThemeProvider`:
    ```ts
    const DarkNavTheme = {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: '#0F1012',
        card: '#17181C',
        text: '#F3F4F6',
        border: '#2A2D35',
        primary: '#10B981',
      },
    };
    ```
  - Set `Stack` `screenOptions={{ contentStyle: { backgroundColor: '#0F1012' } }}`.
  - Set modal screens to have transparent/dark content styles and prevent white background flash during slide transitions.

### 1.2 Input Lag & Tap Delay Elimination (`empty-wallet/app/modal/quick-add.tsx`)
- Isolate keypad state and modal input state so typing never triggers unnecessary re-renders or queries.
- Memoize heavy category and wallet lists.
- Optimize touch responsiveness: replace nested re-rendering with lightweight callbacks and `useCallback`.

### 1.3 Rich Financial Charting: Axes, Values & Labels
- **`BalanceTrendLineChart.tsx`**:
  - Add Y-axis labels with 3 horizontal grid lines (Max balance, Mid balance, Min balance) in compact currency (`formatCurrency(val, currency)`).
  - Add X-axis date ticks (Start date, Midpoint date, Current date) aligned with the grid.
  - Display net change delta badge (`+₱X,XXX (+X.X%)`) in the chart header.
- **`MonthlyTrendBarChart.tsx`**:
  - Add Y-axis gridline scale with currency ticks.
  - Display exact amount values on top of bars and clear Month name labels beneath.
- **`CategoryDonutChart.tsx`**:
  - Add center label showing Total Expenses.
  - Include percentage tags and formatted amount values for each category row in the breakdown list.

---

## 2. Delegation Matrix (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1**: Root theme & flash elimination (`app.json`, `app/_layout.tsx`, `app/(tabs)/_layout.tsx`).
- **Subagent 2**: Quick Add input lag optimization (`app/modal/quick-add.tsx`).
- **Subagent 3**: Financial chart axes, scales, and labels (`src/components/charts/BalanceTrendLineChart.tsx`, `src/components/charts/MonthlyTrendBarChart.tsx`, `src/components/charts/CategoryDonutChart.tsx`).
- **Subagent 4**: Verification & commit (`npm run typecheck`, `npm test`, `git commit`).
