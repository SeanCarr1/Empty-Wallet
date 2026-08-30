# Design System: Warm Archival & Monocle Editorial

<!-- impeccable:design-schema 1 -->

## 1. Visual Identity & Aesthetic Thesis

**Empty-Wallet** is styled in the **Warm Archival / Monocle Editorial** visual world: an organic, warm charcoal and ivory aesthetic that evokes high-grade Japanese stationery, precision horology ledgers, and physical brass-and-leather pocket notebooks. It rejects cold, sterile crypto-black and neon glow clichés in favor of tactile warmth, serene typography, and high contrast legibility.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Surfaces & Grounds
- **Ground (`bg-background`)**: Deep Warm Charcoal `#141312`
- **Primary Card (`bg-background-card`)**: Warm Dark Slate/Leather `#1D1B19`
- **Elevated Card (`bg-background-elevated`)**: Warm Stone `#282522`
- **Hairline Border (`border-background-border`)**: Warm Ochre Rule `#3B3632`

### 2.2 Typography & Ink
- **Primary Content (`text-content-primary`)**: Ivory Parchment `#F5F2EB` (Hero numbers, titles, primary labels)
- **Secondary Content (`text-content-secondary`)**: Warm Sand `#D6CFBF` (Subheadings, values, descriptions)
- **Tertiary Content (`text-content-tertiary`)**: Muted Ochre `#948B7E` (Overlines, timestamps, captions)
- **Muted Rules (`text-content-muted`)**: Dark Warm Muted `#5A5248` (Inactive states, bullet dividers)

### 2.3 Semantic Status & Accents
- **Sage Forest (`#2A9D60` / `#34D399`)**: Inflow, positive savings, healthy velocity status, safe daily allowance.
- **Terracotta Vermilion (`#DC4C38` / `#F87171`)**: Outflow, expenses, over-budget warnings, negative cashflow.
- **Warm Amber (`#D97706` / `#FBBF24`)**: Cautionary velocity pace, alerts, secondary badges.
- **Warm Ochre Gold (`#C69230`)**: Sinking funds, savings goals, milestones.
- **Washed Indigo / Denim (`#4338CA` / `#6366F1`)**: Bank transfers, inter-wallet accounts, subscriptions.

---

## 3. Typography & Spacing Rhythm

- **Scale**:
  - `Hero Display`: 36–40pt bold (`tabular-nums` for currency values)
  - `Screen Title`: 24pt bold (`text-2xl`)
  - `Section Header`: 16pt bold (`text-base`)
  - `Ledger Item Title`: 14pt bold (`text-sm`)
  - `Metadata & Tags`: 11–12pt medium (`text-xs`)
  - `Overline / Tracking`: 10pt uppercase bold (`text-[10px] uppercase tracking-wider`)
- **Touch Target Floor**:
  - Minimum 44×44pt for all buttons, tabs, category chips, and keypad keys.

---

## 4. Component Craft & Micro-Interactions

- **Cards**: `rounded-2xl` and `rounded-3xl` with warm `border border-background-border` (`#3B3632`).
- **Tactile Keypad**: Debossed `#282522` keys with haptic feedback on every number strike and operator evaluation.
- **Charts**: Smooth cubic Bezier curves in SVG with soft sage green gradient fills and minimal hairline gridlines.
- **Haptics**:
  - `triggerHaptic.selection()` on tab navigation, timeframe switches, and category selection.
  - `triggerHaptic.medium()` on floating Quick Add open.
  - `triggerHaptic.success()` on transaction save and budget configuration.
  - `triggerHaptic.error()` on invalid zero amounts or transfer loops.
