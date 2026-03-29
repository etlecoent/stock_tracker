# Task 09 — StockTable

**Files:** `frontend/src/components/StockTable.jsx`

**Depends on:** Task 07

## Steps
- Columns: Date, Open, Close, High, Low, Volume, Change%
- Change% = `(close - open) / open * 100`, calculated client-side
- Sortable by clicking column headers (asc/desc toggle)
- Color-code Change%: green if positive, red if negative
- Shares dateRange from useStocks (filtered to same window as chart)

## Done when
- Table renders data matching chart date range
- Clicking headers sorts correctly
