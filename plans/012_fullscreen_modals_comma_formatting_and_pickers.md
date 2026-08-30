# Plan 012: Fullscreen Modals, Live Comma Formatting, and Interactive Date/Time Pickers

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Resolve missing dark backdrop space in modals via `statusBarTranslucent`, implement live thousands comma formatting for amount inputs, and build custom dark-themed interactive Calendar and Time picker modals.

---

## 1. Specifications

### 1.1 Fullscreen Modal Backdrop Fix (`statusBarTranslucent={true}`)
- In every `<Modal>` across the entire codebase (`quick-add.tsx`, `DashboardWidgetModal.tsx`, `analytics.tsx`, `budgets.tsx`, `records.tsx`, `manage-wallets.tsx`):
  - Add `statusBarTranslucent={true}`.
  - Set container to `flex-1 bg-black/80 justify-end` to guarantee 100% edge-to-edge dark backdrop coverage over the status bar.

### 1.2 Live Amount Comma Formatter Utility (`src/services/currency.ts` & `src/utils/numberFormat.ts`)
- Create formatting utilities:
  - `formatNumberInput(input: string): string`: Adds thousands commas to numeric portions of the input string while allowing decimal points and arithmetic operators (`+`, `-`).
  - `parseNumberInput(formatted: string): number`: Strips commas and safely parses numeric value.
- Wire into `quick-add.tsx` Amount Card and Keypad popup so amounts like `1000` display as `1,000` live.

### 1.3 Interactive Calendar & Time Picker Modals
- **`src/components/ui/DatePickerModal.tsx`**:
  - Precision Dark Gray styling (`#17181C`, `#212329`, `#10B981`).
  - Header: Previous Month `<` | Current Month & Year | Next Month `>`.
  - Weekday Header: `Su Mo Tu We Th Fr Sa`.
  - Calendar Grid: Day cells with active selection highlight, today indicator, and disabled out-of-month days.
  - Footer: "Today" shortcut button + "Confirm" button.
- **`src/components/ui/TimePickerModal.tsx`**:
  - Header: "Select Time" with close button.
  - Time Display: Large `HH:MM` display with `AM` / `PM` toggle.
  - Hour selector (1-12) & Minute selector (00, 05, 10, ... 55, or fine grid).
  - Footer: "Current Time" shortcut button + "Confirm" button.
- **Integration in `quick-add.tsx`**:
  - Replace raw `TextInput` with touchable cards displaying formatted Date (e.g. `Aug 30, 2026`) and Time (e.g. `02:15 PM`) that open the respective modal pickers.

---

## 2. Subagent Delegation Plan (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1 (Date & Time Picker Components + Comma Utilities)**:
  - Create `src/utils/numberFormat.ts`.
  - Build `src/components/ui/DatePickerModal.tsx` and `src/components/ui/TimePickerModal.tsx`.
- **Subagent 2 (Quick Add & Modal Updates)**:
  - Integrate `DatePickerModal`, `TimePickerModal`, and live comma formatting into `quick-add.tsx`.
  - Add `statusBarTranslucent={true}` to all `<Modal>` components across `budgets.tsx`, `records.tsx`, `analytics.tsx`, `manage-wallets.tsx`, `DashboardWidgetModal.tsx`.
- **Subagent 3 (Verification & Commit)**:
  - Run `npm run typecheck` and `npm test`.
  - Commit all changes to `main`.
