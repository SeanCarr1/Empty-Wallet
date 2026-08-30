# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Primary users are individual earners, freelancers, and household budgeters seeking a frictionless, privacy-first way to log expenses, manage multi-account cashflow, track category limits, and visualize financial trends on their iOS and Android devices without mandatory cloud logins or live bank credential scraping.

## Product Purpose

Empty-Wallet exists to eliminate manual budget tracking fatigue. Success means the user can capture an expense or transfer in under 3 seconds with tactile feedback, immediately see their dynamic "Safe-to-Spend" daily pace, and gain clear visibility into cashflow health without latency or privacy compromises.

## Positioning

Unlike cloud-heavy subscription budgeting apps that demand open-banking logins and sell aggregated consumer data, Empty-Wallet is 100% local-first, zero-latency, and runs on an embedded SQLite engine with optional encrypted multi-device backup and biometric hardware locks.

## Operating Context

- **Environment**: Mobile phone in hand while paying at checkout counters, cafes, restaurants, ATMs, or reviewing monthly bills at home.
- **Rituals**: 
  - Rapid 2-tap transaction entry right after making a purchase.
  - Quick morning/evening check of the "Safe-to-Spend" daily allowance gauge.
  - End-of-month review of category budget caps, sinking fund goals, and CSV statement imports.

## Capabilities and Constraints

- **Confirmed Capabilities**:
  - Multi-wallet ledger (Cash, Bank Accounts, Credit Cards, Savings).
  - Hybrid Flexible Budgeting (Category spending caps, recurring subscription reminders, sinking fund goals).
  - Dynamic "Safe-to-Spend" velocity gauge calculating daily allowances.
  - Comprehensive 6-step transaction logger (Type, Amount with math keypad, Wallet, Category, Date/Time, Payer/Payment Type).
  - Records tab with instant full-text search, multi-criteria filtering, and sorting.
  - Visual financial charts (Horizontal Cash Flow bar, Balance Trend progression curve, Category donut).
  - Bank CSV statement import with duplicate transaction hash detection.
  - Hardware Biometric Lock (Face ID / Touch ID / PIN) backed by SecureStore.
- **Constraints**:
  - 100% Offline-capable with embedded SQLite database.
  - Primary default currency is Philippine Peso (`PHP ₱`) with multi-currency formatting support.

## Brand Commitments

- **Name**: Empty-Wallet
- **Logo**: Circular coin wallet emblem (`assets/logo.jpg`, `images/logo.jpg`).
- **Aesthetic Tone**: Modern Dark Fintech Minimalist (Obsidian `#090A0F`, Emerald `#10B981`, Rose `#F43F5E`, Cyber Amber `#F59E0B`, Electric Violet `#8B5CF6`).
- **Tactility**: Haptic feedback on numpad typing, category chips, and confirmation triggers.

## Evidence on Hand

- Brand logo asset: [`images/logo.jpg`](file:///C:/Users/LENOVO/Documents/Personal/Projects/026%20Finance%20Mobile%20App/Empty-Wallet/images/logo.jpg).
- Architectural plans: [`plans/001_initial_architecture_and_phase1_mvp.md`](file:///C:/Users/LENOVO/Documents/Personal/Projects/026%20Finance%20Mobile%20App/Empty-Wallet/plans/001_initial_architecture_and_phase1_mvp.md), [`plans/002_records_tab_graphs_and_advanced_logging_plan.md`](file:///C:/Users/LENOVO/Documents/Personal/Projects/026%20Finance%20Mobile%20App/Empty-Wallet/plans/002_records_tab_graphs_and_advanced_logging_plan.md).
- Verified test suites: 45 / 45 Jest tests in [`src/services/__tests__/`](file:///C:/Users/LENOVO/Documents/Personal/Projects/026%20Finance%20Mobile%20App/Empty-Wallet/src/services/__tests__/).

## Product Principles

1. **Friction is the Enemy**: Transaction logging must take single-digit seconds with haptic keyboards, sensible defaults, and minimal clicks.
2. **Actionable Velocity Over Static Balances**: Knowing how much you can spend per day right now is more impactful than passive backward-looking ledgers.
3. **Uncompromising Privacy**: Your financial numbers belong on your device alone.
4. **Tactile & Responsive Craft**: Every interaction should feel weighty, precise, and hardware-accelerated.

## Accessibility & Inclusion

- Dynamic text scaling and high contrast ratio on deep obsidian background.
- Minimum 44x44pt touch targets on all interactive keypad buttons and tab items.
- Tabular figures (`tabular-nums`) for currency alignments.
