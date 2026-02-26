# Rent‑vs‑Buy Calculator

A simple rent‑vs‑buy calculator web app (React + TypeScript + Vite).

It compares **end net worth** after a chosen horizon, including:

- Mortgage amortization (principal + interest)
- Home appreciation
- Property tax, insurance, maintenance, HOA
- Rent growth and renter’s insurance
- Investing the **up-front cash** (down payment + buy closing costs) and the **monthly cost difference**
- Selling costs at the end of the horizon

## Run locally

```bash
cd rent-vs-buy
npm install
npm run dev
```

Then open the URL shown in the terminal.

## Build

```bash
npm run build
npm run preview
```

## Where the logic lives

- UI: `src/App.tsx`
- Calculation engine: `src/lib/rentVsBuy.ts`

## Model notes / limitations

This is intentionally simplified. It does **not** include things like:

- Income tax effects (mortgage interest deduction, SALT limits, etc.)
- PMI / MIP
- Home improvements beyond “maintenance %”
- Vacancy / rent concessions / moving costs
- Asset allocation changes or taxes on investment gains

Use it as a starting point and stress‑test assumptions.
