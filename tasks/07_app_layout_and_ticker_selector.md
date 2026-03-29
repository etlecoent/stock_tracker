# Task 07 — App layout + TickerSelector

**Files:** `frontend/src/App.jsx`, `frontend/src/components/TickerSelector.jsx`, `frontend/src/hooks/useStocks.js`

**Depends on:** Task 06

## Steps
- `App.jsx`: CSS grid layout — TickerSelector top, chart+sidebar middle, table bottom
- `TickerSelector.jsx`: dropdown of top 10 tickers fetched from `GET /stocks`
- `useStocks.js`: state for selectedTicker, priceData, interval, dateRange; poll prices every 60s via setInterval

## Done when
- Selecting a ticker updates app state
- Price fetch triggered on ticker change
