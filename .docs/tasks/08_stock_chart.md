# Task 08 — StockChart

**Files:** `frontend/src/components/StockChart.jsx`

**Depends on:** Task 07

## Steps
- Recharts `ComposedChart`: Line (close price) + Bar (volume), dual Y-axes
- Zoom: `ReferenceArea` on mousedown → mousemove → mouseup, updates dateRange state
- Controls:
  - Interval selector buttons: 1d / 1wk / 1mo
  - Date range preset buttons: 1M / 3M / 1Y / YTD
  - Reset zoom button

## Done when
- Chart renders price + volume for selected ticker
- Zoom interaction narrows visible date range
- Interval/preset buttons update data
