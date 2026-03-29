# Task 04 — Stocks router

**Files:** `backend/routers/stocks.py`, `backend/main.py`

**Depends on:** Task 03

## Endpoints
- `GET /stocks` → list of TOP_10_TICKERS with name + sector
- `GET /stocks/{ticker}/prices?start=&end=&interval=` → check cache, fetch if stale, return prices
- `GET /stocks/{ticker}/info` → longName, sector, marketCap, trailingPE

## Done when
- `curl localhost:8000/stocks` returns ticker list
- `curl localhost:8000/stocks/AAPL/prices?interval=1d` returns price data
