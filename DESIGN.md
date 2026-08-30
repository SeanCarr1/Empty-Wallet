# Design System: Precision Dark Gray

<!-- impeccable:design-schema 1 -->

## 1. Visual Identity & Aesthetic Thesis

**Empty-Wallet** is styled in the **Precision Dark Gray** visual world: a high-density, Linear/Raycast-inspired slate-and-charcoal aesthetic that emphasizes geometric precision, flat borderless surface steps, pure contrast typography, and vibrant precision accents. It delivers a fast, tactile, finance-first experience with zero visual fluff.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Surfaces & Grounds
- **Ground (`bg-background`)**: Cool Dark Slate Ground `#0F1012`
- **Primary Card (`bg-background-card`)**: Dark Charcoal Step 1 `#17181C`
- **Elevated Card (`bg-background-elevated`)**: Muted Slate Step 2 `#212329`
- **Hairline Border (`border-background-border`)**: Ultra-subtle Hairline `#2A2D35`

### 2.2 Typography & Ink
- **Primary Content (`text-content-primary`)**: High-contrast Pure Text `#F3F4F6` (Hero numbers, titles, primary labels)
- **Secondary Content (`text-content-secondary`)**: Secondary Text `#9CA3AF` (Subheadings, values, descriptions)
- **Tertiary Content (`text-content-tertiary`)**: Muted Slates `#6B7280` (Overlines, timestamps, captions)
- **Muted Rules (`text-content-muted`)**: Dark Muted `#4B5563` (Inactive states, bullet dividers)

### 2.3 Semantic Status & Accents
- **Precision Emerald (`#10B981` / `#34D399`)**: Inflow, positive savings, healthy velocity status, safe daily allowance.
- **Precision Crimson (`#EF4444` / `#F87171`)**: Outflow, expenses, over-budget warnings, negative cashflow.
- **Precision Amber (`#F59E0B`)**: Cautionary velocity pace, alerts, secondary badges.
- **Precision Violet (`#8B5CF6`)**: Goals, milestones, sinking funds.
- **Precision Ice Blue (`#3B82F6`)**: Bank transfers, inter-wallet accounts, subscriptions.

---

## 3. Typography & Geometric Hierarchy

- **Scale**:
  - `Hero Display`: 28–32pt bold (`tabular-nums` for currency values)
  - `Screen Title`: 20pt bold (`text-xl`)
  - `Section Header`: 14–15pt bold (`text-sm`)
  - `Body / Ledger Item`: 13–14pt medium / bold (`text-xs` to `text-sm`)
  - `Metadata & Tags`: 10–11pt medium (`text-[10px]` to `text-[11px]`)
  - `Overline / Tracking`: 9–10pt uppercase bold (`text-[9px]` to `text-[10px] uppercase tracking-wider`)
- **Rounding**:
  - Cards & Modals: `rounded-xl` (12px)
  - Keypad Buttons, Inputs & List Items: `rounded-lg` (8px - 10px)
  - Badges, Filter Pills & Status Tags: `rounded-md` (6px)
- **Touch Target Floor**:
  - Minimum 44×44pt for all buttons, tabs, category chips, and keypad keys.

---

## 4. Component Craft & Micro-Interactions

- **Cards**: Flat surface step contrast (`#0F1012` ground -> `#17181C` card -> `#212329` elevated inner components) with `rounded-xl` and single hairline dividers.
- **Tactile Keypad**: Precision `#212329` keys with `rounded-lg` geometry and emerald `#10B981` submit button.
- **Charts**: Crisp SVG sparklines and donuts with precision emerald `#10B981` and ice blue `#3B82F6` data series.
- **Haptics**:
  - `triggerHaptic.selection()` on tab navigation, timeframe switches, and category selection.
  - `triggerHaptic.medium()` on modal open and segmented control changes.
  - `triggerHaptic.success()` on transaction save and budget configuration.
  - `triggerHaptic.error()` on invalid zero amounts or transfer loops.
