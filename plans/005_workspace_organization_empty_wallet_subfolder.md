# Plan 005: Workspace Organization with `empty-wallet/` Subfolder

**Status**: Ready for Implementation  
**Date**: 2026-08-30  
**Context**: Reorganize the workspace so that root contains only workspace-level files (.git, .agents, .impeccable, plans, markdown files), and all application setup, node configs, app files, assets, and source code reside inside `empty-wallet/`.

---

## 1. Target Directory Architecture

```
Empty-Wallet/ (Root Workspace)
├── .agents/                 # Customization rules & skills
├── .git/                    # Git repository data
├── .impeccable/             # Impeccable design system configs
├── plans/                   # Chronological development plans
├── PRODUCT.md               # Product truth specification
├── DESIGN.md                # Design system specification
├── README.md                # Project documentation
│
└── empty-wallet/            # Application Container
    ├── app/                 # Expo Router file-based screens
    │   ├── (tabs)/
    │   ├── modal/
    │   └── _layout.tsx
    ├── src/                 # Application source code
    │   ├── components/
    │   ├── constants/
    │   ├── db/
    │   ├── stores/
    │   ├── services/
    │   └── types/
    ├── assets/              # App branding assets & splash screens
    ├── images/              # Media & logo files
    ├── node_modules/        # Dependencies
    ├── app.json             # Expo configuration
    ├── package.json         # Dependencies & scripts
    ├── package-lock.json    # Dependency lockfile
    ├── tsconfig.json        # TypeScript configuration
    ├── babel.config.js      # Babel configuration
    ├── tailwind.config.js   # Tailwind CSS configuration
    ├── global.css           # Global Tailwind stylesheet
    ├── drizzle.config.ts    # Drizzle ORM configuration
    └── jest.config.js       # Jest test configuration
```

---

## 2. Execution Steps

1. Create directory `empty-wallet/`.
2. Move the following into `empty-wallet/`:
   - `app/`
   - `src/`
   - `assets/`
   - `images/`
   - `app.json`
   - `package.json`
   - `package-lock.json`
   - `tsconfig.json`
   - `babel.config.js`
   - `tailwind.config.js`
   - `global.css`
   - `drizzle.config.ts`
   - `jest.config.js`
   - `metro.config.js` (if exists)
   - `node_modules/`
3. Verify that the root contains only `.git/`, `.agents/`, `.impeccable/`, `plans/`, `PRODUCT.md`, `DESIGN.md`, and `README.md`.
4. Install/verify dependencies inside `empty-wallet/` and run `npm run typecheck` and `npm test` inside `empty-wallet/`.
5. Commit all changes to `main`.
