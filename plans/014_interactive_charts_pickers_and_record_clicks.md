# Plan 014: Interactive Balance Dot & Tooltip, Fast Date/Time Pickers, Type Switcher Colors, and Clickable Records

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Fix record clicking by properly wiring `onPress` and rendering `TransactionDetailModal`, restore vivid fill colors on Expense/Income/Transfer buttons in Quick Add, add fast Month/Year jump and 2-column scrollable Time picker, clamp chart width, and add interactive balance trajectory dot + tooltip.

---

## 1. Specifications

### 1.1 Fix Record Clickability & Transaction Detail Sheet (`index.tsx` & `records.tsx`)
- In `TransactionItem.tsx`:
  - Ensure root `TouchableOpacity` triggers `onPress` cleanly.
- In `index.tsx`:
  - Remove redundant outer `TouchableOpacity` wrapper.
  - Pass `onPress={() => setSelectedTx(tx)}` directly to `TransactionItem`.
  - Render `<TransactionDetailModal visible={!!selectedTx} ... />` at the root of `index.tsx`.
- In `records.tsx`:
  - Pass `onPress={() => setSelectedTx(tx)}` directly to `TransactionItem`.
  - Render `<TransactionDetailModal visible={!!selectedTx} ... />` at the root of `records.tsx`.

### 1.2 Quick Add Type Switcher Vivid Fill Colors (`quick-add.tsx`)
- Active **Expense**: `bg-expense text-white font-bold` (or `bg-[#EF4444] text-[#FFFFFF]`).
- Active **Income**: `bg-primary text-[#0F1012] font-bold` (or `bg-[#10B981] text-[#0F1012]`).
- Active **Transfer**: `bg-[#3B82F6] text-white font-bold`.

### 1.3 Fast Month & Year Picker (`src/components/ui/DatePickerModal.tsx`)
- Tapping the "MMMM yyyy" month/year title toggles a fast Month/Year selection view:
  - 12-Month grid (`Jan` to `Dec`).
  - Year selector (`<` 2026 `>`).
  - Tapping a month sets the calendar to that month immediately.

### 1.4 2-Column Scrollable Android-style Time Picker (`src/components/ui/TimePickerModal.tsx`)
- 2 side-by-side vertical scroll columns:
  - Left column: Hours (1 to 12) with smooth vertical scrolling.
  - Right column: Minutes (00 to 59 in 5-minute increments) with smooth vertical scrolling.
  - AM/PM segmented pill switcher.

### 1.5 Responsive Clamped Chart Width, X/Y Axis Labels, and Interactive Endpoint Dot (`BalanceTrendLineChart.tsx`)
- Use dynamic container measurement (`onLayout`) clamped to `screenWidth - 32` so chart width never overflows.
- Add horizontal gridlines with compact currency labels on Y-axis.
- Add Start, Mid, and End date labels on X-axis.
- Add an interactive glowing endpoint pulse dot on the latest balance point.
- Tapping the endpoint dot (or any segment of the graph) displays a dark tooltip badge with exact Date & formatted Balance.

---

## 2. Delegation Plan (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1 (Pickers & Quick Add Colors)**:
  - Update `DatePickerModal.tsx` (Month/Year jump grid).
  - Update `TimePickerModal.tsx` (2-column scrollable wheel picker).
  - Update `quick-add.tsx` (vivid Type Switcher fill colors).
- **Subagent 2 (Chart Overhaul & Interactive Tooltip)**:
  - Overhaul `BalanceTrendLineChart.tsx` (responsive width clamping, Y-axis labels, X-axis dates, pulsing endpoint dot, interactive tooltip).
- **Subagent 3 (Clickable Records & Detail Modal Wiring)**:
  - Wire `TransactionDetailModal` and `onPress` in `index.tsx` and `records.tsx`.
- **Subagent 4 (Verification & Commit)**:
  - Run `npm run typecheck` and `npm test`.
  - Commit all changes to `main`.
