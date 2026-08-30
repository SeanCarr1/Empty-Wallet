# Plan 008: Dashboard Graph Customization, Record Click-to-Edit, and Form Spacing Fixes

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Implement Today page graph visibility toggles, fix record click-to-edit interaction, equalize search and filter bar heights in Records, and fix spacing and 2-column grid in Quick Add modal.

---

## 1. Requirements & Fix Specifications

### 1.1 Dashboard (Today Page) Graph Customization (`empty-wallet/app/(tabs)/index.tsx` & `useSettingsStore.ts`)
- **Settings Store (`useSettingsStore.ts`)**:
  - Add dashboard widget visibility state:
    ```ts
    dashboardWidgets: {
      safeToSpendGauge: boolean;
      sparklineTrend: boolean;
      cashFlowSummary: boolean;
    }
    toggleDashboardWidget(key: keyof DashboardWidgets): void
    ```
- **Dashboard UI (`index.tsx`)**:
  - Add a "Customize Widgets" icon button (`SlidersHorizontal`) in the Today dashboard header.
  - Opens a clean bottom sheet modal with switches for each widget.
  - Conditionally render `SafeToSpendGauge`, `BalanceTrendLineChart` (sparkline), and optional cash flow summary based on `dashboardWidgets` flags.

### 1.2 Record Click-to-Edit (`empty-wallet/src/components/transactions/TransactionItem.tsx` & `records.tsx`)
- In `TransactionItem.tsx`:
  - Add `onPress?: () => void` and `onLongPress?: () => void` props.
  - Root element is a `TouchableOpacity` with `activeOpacity={0.7}`.
  - Tapping anywhere on the row triggers `onPress` -> routes to `/modal/quick-add?id=${tx.id}`.
  - Long pressing triggers `onLongPress` -> quick delete confirmation alert.

### 1.3 Records Search & Filter Bar Alignment (`empty-wallet/app/(tabs)/records.tsx`)
- Lock both the Search bar container and the Filter button to an explicit height `h-11` (`44px` touch floor).
- Use `flex-row items-center` so their borders and heights are visually aligned down to the exact pixel.

### 1.4 Quick Add Modal UI & Spacing Fixes (`empty-wallet/app/modal/quick-add.tsx`)
- **Category Picker Grid**:
  - Render categories in a responsive 2-column grid (`flex-row flex-wrap justify-between`, each item `w-[48%] mb-2`).
- **Date & Time Input Spacing**:
  - Wrap `Calendar`/`Clock` icon with `mr-2.5` and ensure `TextInput` has `p-0` and proper left clearance so text does not touch the icon.
- **Search Bar in Category Modal**:
  - Wrap `Search` icon with `mr-2.5` and ensure `TextInput` has left padding/clearance.

---

## 2. Subagent Delegation (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1 (Store & Settings)**:
  - Add `dashboardWidgets` to `useSettingsStore.ts`.
- **Subagent 2 (TransactionItem & Records Screen)**:
  - Update `TransactionItem.tsx` with root touch handler.
  - Update `records.tsx` with equalized `h-11` search/filter bar and clickable edit rows.
- **Subagent 3 (Dashboard Graph Customization Modal)**:
  - Update `index.tsx` with widget customize modal and conditional widget rendering.
- **Subagent 4 (Quick Add Form Spacing & 2-Column Categories)**:
  - Update `quick-add.tsx` with 2-column category grid and icon spacing fixes.
- **Subagent 5 (Verification & Commit)**:
  - Run `npm run typecheck` and `npm test` inside `empty-wallet/`.
  - Commit all changes to `main`.
