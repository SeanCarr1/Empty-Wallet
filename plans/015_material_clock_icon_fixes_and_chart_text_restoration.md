# Plan 015: Material Circular Clock Picker, Icon Rendering Fix, Type Button Spacing, Date Button Polish & Chart Text Restoration

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Fix missing Lucide icon rendering in TransactionDetailModal, add proper spacing between Type buttons in Quick Add, make DatePicker Month/Year header look like an interactive button, implement a Material Design 3 circular clock face for TimePickerModal, and restore full rich text headers, axes, and metrics in BalanceTrendLineChart (both sparkline and full modes).

---

## 1. Specifications

### 1.1 Scope Protocol Rule Update (`.agents/rules/orchestration.md`)
- Add rule: **Comprehensive Systemic Scope**: Whenever any component or feature is mentioned, always audit and apply fixes to both the primary target block and all related occurrences across the app.

### 1.2 Fix Icon Rendering in Transaction Receipt Modal (`src/components/transactions/TransactionDetailModal.tsx`)
- Import `<Icon />` from `src/components/ui/Icon.tsx`.
- Replace `<Text>{category?.icon}</Text>` with:
  ```tsx
  <View style={[styles.badge, { backgroundColor: `${category?.color || wallet?.color || '#10B981'}25` }]}>
    <Icon
      name={category?.icon || wallet?.icon || 'Receipt'}
      size={26}
      color={category?.color || wallet?.color || '#10B981'}
    />
  </View>
  ```
- Also ensure Category row and Wallet row inside the breakdown list render `<Icon />` with appropriate colors.

### 1.3 Quick Add Type Switcher Button Spacing (`app/modal/quick-add.tsx`)
- Update the Type Switcher container:
  - Use `flex-row bg-background-card p-1.5 rounded-xl border border-background-border mb-4 gap-x-2`
  - Each button has `flex-1 py-2.5 rounded-lg items-center justify-center` with distinct solid active fill and clear margin.

### 1.4 Interactive Month/Year Button in Date Picker (`src/components/ui/DatePickerModal.tsx`)
- Style the Month/Year header as an explicit, high-affordance button:
  - `<TouchableOpacity onPress={toggleViewMode} className="flex-row items-center bg-background-elevated border border-background-border px-3.5 py-1.5 rounded-lg active:opacity-80">`
  - Displays `format(currentMonth, 'MMMM yyyy')` with a `ChevronDown` icon.
  - Tapping opens the 12-month + year grid.

### 1.5 Material Design 3 Circular Clock Time Picker (`src/components/ui/TimePickerModal.tsx`)
- **Digital Header**:
  - `HH : MM` with active section highlight (Hour vs Minute).
  - Segmented `AM` / `PM` toggle button.
- **Material Circular Clock Dial**:
  - 12 numbers placed radially around a circle at $30^\circ$ increments:
    $$x = R \cdot \sin(\theta) + C_x, \quad y = -R \cdot \cos(\theta) + C_y$$
  - Radial pointer line connecting center pivot to selected number.
  - Selecting an hour automatically transitions to the minute dial ($00, 05, 10, \dots, 55$).
  - Toggle between Hour and Minute dial anytime.
- **Footer**:
  - Quick presets: "Now", "Morning (9 AM)", "Noon (12 PM)", "Evening (7 PM)".
  - "Confirm" button.

### 1.6 Balance Trend Chart Text & Metric Restoration (`BalanceTrendLineChart.tsx`)
- In **Sparkline Mode** (Today Page):
  - Add top header row:
    - Left: "30-Day Balance Trajectory" title + Net change badge (`+₱X,XXX (+X.X%)`).
    - Right: Current total balance in bold `tabular-nums`.
  - Add Y-axis min/max reference labels.
  - Add Start date and Today date labels on X-axis.
  - Glowing pulsing endpoint dot with interactive tooltip.
- In **Full Mode** (Analytics):
  - High-contrast Net Balance title and timeframe chips.
  - 3 Y-axis gridlines with compact currency labels (`₱50k`, `₱25k`, `₱0`).
  - X-axis date labels.
  - Interactive touch scrubber tooltip showing exact Date and Balance.

---

## 2. Delegation Plan (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1 (TransactionDetailModal & Quick Add Colors/Spacing)**:
  - Fix Icon rendering in `TransactionDetailModal.tsx`.
  - Fix Type button spacing in `quick-add.tsx`.
- **Subagent 2 (DatePicker Button & Material Circular Clock Face)**:
  - Update `DatePickerModal.tsx` with explicit Month/Year button.
  - Overhaul `TimePickerModal.tsx` with Material circular clock face dial.
- **Subagent 3 (BalanceTrendLineChart Text & Metrics Restoration)**:
  - Overhaul `BalanceTrendLineChart.tsx` with full sparkline and analytics text, axis labels, and tooltip.
- **Subagent 4 (Verification & Commit)**:
  - Run `npm run typecheck` and `npm test`.
  - Commit all changes to `main`.
