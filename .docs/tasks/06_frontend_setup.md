# Task 06 — Frontend project setup

**Files:** `frontend/` scaffold, `frontend/src/api/client.js`

**Depends on:** Task 04 + 05 (API must be available to verify)

## Steps
- `npm create vite@latest frontend -- --template react`
- Install: `recharts`, `date-fns`, (use native fetch — no axios needed)
- Write `api/client.js`: base URL `http://localhost:8000`, export functions:
  - `getStocks()`, `getStockPrices(ticker, start, end, interval)`, `getStockInfo(ticker)`
  - `getNotes(ticker, date)`, `createNote(note)`, `updateNote(id, content)`, `deleteNote(id)`

## Done when
- `npm run dev` starts on localhost:5173
- `getStocks()` callable from browser console, returns data
