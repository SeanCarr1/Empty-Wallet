# Plan 016: Official Native DateTimePicker Integration

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Install `@react-native-community/datetimepicker` and integrate authentic native Google Material TimePicker (Android) and Apple Wheel TimePicker (iOS) into `quick-add.tsx` and `TimePickerModal.tsx`.

---

## 1. Specifications

### 1.1 Install `@react-native-community/datetimepicker`
- In `empty-wallet/`, run `npx expo install @react-native-community/datetimepicker`.

### 1.2 Native Time Picker Integration (`src/components/ui/TimePickerModal.tsx`)
- Implement `TimePickerModal` using `DateTimePicker` from `@react-native-community/datetimepicker`:
  - On Android: Spawns the authentic Material Time Picker dialog (`mode="time"`, `display="default"` or `display="clock"`).
  - On iOS: Spawns the authentic Apple HIG Wheel Picker modal.
  - Handles time change and formats back to `HH:mm` string.

### 1.3 Wiring in `quick-add.tsx`
- Tapping the **Time** card opens the native TimePicker directly with smooth UX.
- Date picker can also use native dialog or our custom dark calendar.

---

## 2. Delegation Plan (Using 3.7 Flash Low `flash_lite`)

- **Subagent 1 (Package Install & Component Integration)**:
  - Run package install and update `TimePickerModal.tsx` & `quick-add.tsx`.
- **Subagent 2 (Verification & Commit)**:
  - Run `npm run typecheck` and `npm test`.
  - Commit all changes to `main`.
