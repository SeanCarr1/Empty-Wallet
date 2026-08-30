# Plan 006: Macro Category Grouping System

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Organize categories into 9 comprehensive, structured macro groups (Food & Drinks, Shopping, Housing, Transportation, Vehicle, Life & Entertainment, Financial Expenses, Income, Others) with sectioned visual pickers, category search, and comprehensive presets.

---

## 1. Category Group Architecture

### 1.1 Category Group Schema & Type Definitions
- Add `CategoryGroup` type in `empty-wallet/src/types/index.ts`:
  ```ts
  export type CategoryGroup =
    | 'food_drinks'
    | 'shopping'
    | 'housing'
    | 'transportation'
    | 'vehicle'
    | 'life_entertainment'
    | 'financial_expenses'
    | 'income'
    | 'others';

  export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income';
    group: CategoryGroup;
    isDefault?: boolean;
  }
  ```

### 1.2 The 9 Defined Macro Groups & Curated Presets
1. **Food & Drinks (`food_drinks`)**:
   - Dining Out (`UtensilsCrossed`, `#F59E0B`)
   - Groceries (`ShoppingBag`, `#10B981`)
   - Coffee & Tea (`Coffee`, `#8B5CF6`)
   - Drinks & Bars (`Wine`, `#EC4899`)
   - Food Delivery (`Package`, `#F97316`)
2. **Shopping (`shopping`)**:
   - Clothing & Apparel (`Shirt`, `#3B82F6`)
   - Electronics & Tech (`Smartphone`, `#06B6D4`)
   - Personal Care & Beauty (`Sparkles`, `#EC4899`)
   - Home & Furniture (`Armchair`, `#10B981`)
3. **Housing (`housing`)**:
   - Rent & Mortgage (`Home`, `#6366F1`)
   - Electricity & Power (`Zap`, `#F59E0B`)
   - Water Utility (`Droplets`, `#0EA5E9`)
   - Internet & Mobile (`Wifi`, `#8B5CF6`)
   - Home Repairs (`Wrench`, `#64748B`)
4. **Transportation (`transportation`)**:
   - Public Transit (`Bus`, `#3B82F6`)
   - Commute / Train (`Train`, `#06B6D4`)
   - Taxi / Ride Hailing (`Car`, `#F59E0B`)
5. **Vehicle (`vehicle`)**:
   - Fuel & Gas (`Fuel`, `#EF4444`)
   - Parking & Tolls (`CircleParking`, `#64748B`)
   - Car Insurance (`ShieldCheck`, `#3B82F6`)
   - Maintenance & Service (`Wrench`, `#F97316`)
6. **Life & Entertainment (`life_entertainment`)**:
   - Movies & Streaming (`Tv`, `#8B5CF6`)
   - Gaming (`Gamepad2`, `#6366F1`)
   - Gym & Fitness (`Dumbbell`, `#10B981`)
   - Hobbies & Leisure (`Palette`, `#EC4899`)
   - Travel & Vacation (`Plane`, `#0EA5E9`)
   - Medical & Pharmacy (`HeartPulse`, `#EF4444`)
7. **Financial Expenses (`financial_expenses`)**:
   - Bank Fees & Charges (`Receipt`, `#64748B`)
   - Taxes & Government (`Landmark`, `#EF4444`)
   - Loan Repayment (`CreditCard`, `#F59E0B`)
   - Interest & Charges (`TrendingDown`, `#F43F5E`)
8. **Income (`income`)**:
   - Salary & Wages (`Landmark`, `#10B981`)
   - Freelance & Side Hustle (`Laptop`, `#3B82F6`)
   - Business Revenue (`Building2`, `#8B5CF6`)
   - Investment Dividends (`TrendingUp`, `#10B981`)
   - Gifts & Grants (`Gift`, `#EC4899`)
   - Other Income (`Wallet`, `#06B6D4`)
9. **Others (`others`)**:
   - General / Miscellaneous (`MoreHorizontal`, `#64748B`)
   - Donations & Charity (`Heart`, `#F43F5E`)

---

## 2. UI & Component Enhancements

1. **Category Picker Modal in Quick Add (`empty-wallet/app/modal/quick-add.tsx`)**:
   - Real-time search bar at top.
   - Sectioned vertical grid grouped by the 9 macro groups with sleek group badges.
   - Clean selection animation and tactile haptics.
2. **Records Filter Sheet (`empty-wallet/app/modal/records.tsx`)**:
   - Grouped category chips with macro group section dividers.
3. **Budgets Setup (`empty-wallet/app/modal/budgets.tsx`)**:
   - Grouped category picker when setting category caps.
4. **Database & Persistence (`empty-wallet/src/db/schema.ts` & `client.ts`)**:
   - Add `group` column with safe runtime SQLite migration and fresh seed insertion.

---

## 3. Subagent Execution Tasks
- **Agent 1 (Data & Constants)**:
  - Update `empty-wallet/src/types/index.ts`.
  - Update `empty-wallet/src/constants/categories.ts`.
  - Update `empty-wallet/src/db/schema.ts` and `empty-wallet/src/db/client.ts`.
  - Update `empty-wallet/src/stores/useCategoryStore.ts`.
- **Agent 2 (UI Modals & Screens)**:
  - Update `empty-wallet/app/modal/quick-add.tsx` with sectioned search grid.
  - Update `empty-wallet/app/(tabs)/records.tsx` and `empty-wallet/app/(tabs)/budgets.tsx`.
- **Agent 3 (Verification & Tests)**:
  - Run `npm run typecheck` and `npm test` inside `empty-wallet/`.
