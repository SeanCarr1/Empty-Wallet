# Plan 009: Impeccable UI Polish - Header Spacing, High-Contrast Toggle Colors, and Settings Cleanup

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Fix the Today page header spacing where the Customize button was touching text, enhance the Customize Widgets popup toggles with unmistakable Emerald `#10B981` active states and text indicators, and remove the Chart & Widget visibility section from the Settings screen.

---

## 1. Specifications

### 1.1 Today Page Header Spacing (`empty-wallet/app/(tabs)/index.tsx`)
- In the top header of the Today Dashboard:
  - Header row: `flex-row items-center justify-between mb-4 gap-x-3`.
  - Left side: App Logo + Net Balance with `flex-1 mr-2`.
  - Right side: Clean action pills (`Transfer` and `Customize`) with `flex-row items-center gap-x-2 shrink-0`.
  - Guarantee zero collision or touching regardless of balance string length or screen width.

### 1.2 High-Contrast Widget Toggles (`empty-wallet/src/components/ui/DashboardWidgetModal.tsx`)
- Update the `Switch` components to have high-contrast emerald feedback:
  - `trackColor={{ false: '#2A2D35', true: '#10B981' }}`
  - `thumbColor={isActive ? '#FFFFFF' : '#9CA3AF'}`
  - `ios_backgroundColor="#2A2D35"`
- Add an explicit status pill badge (`ON` / `OFF`):
  - `bg-[#10B981]/20 text-[#10B981]` when enabled.
  - `bg-[#2A2D35] text-[#6B7280]` when disabled.
- Also update `empty-wallet/app/(tabs)/analytics.tsx` chart customize modal toggles with the same high-contrast styling.

### 1.3 Remove Widget Visibility from Settings (`empty-wallet/app/(tabs)/settings.tsx`)
- Remove the "Chart & Widget Visibility" section and its toggles completely from `settings.tsx`.

---

## 2. Delegation Matrix (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1**:
  - Update `empty-wallet/app/(tabs)/index.tsx` (header spacing).
  - Update `empty-wallet/src/components/ui/DashboardWidgetModal.tsx` and `empty-wallet/app/(tabs)/analytics.tsx` (toggle colors and ON/OFF badges).
  - Update `empty-wallet/app/(tabs)/settings.tsx` (remove widget visibility section).
- **Subagent 2**:
  - Run verification tests (`npm run typecheck` and `npm test`).
  - Commit all changes to `main`.
