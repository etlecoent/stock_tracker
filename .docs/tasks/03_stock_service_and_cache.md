# Task 03 — Stock service + cache

**Files:** `backend/services/stock_service.py`, `backend/services/cache.py`

**Depends on:** Task 02

## Steps
- `cache.py`: in-memory dict with TTL (60s), `is_stale()`, `get()`, `set()`
- `stock_service.py`:
  - `TOP_10_TICKERS` hardcoded list (AAPL, MSFT, NVDA, AMZN, GOOGL, META, BRK-B, TSLA, UNH, JPM)
  - `fetch_prices(ticker, start, end, interval)` → list[PricePoint] via yfinance
  - `fetch_info(ticker)` → name, sector, marketCap via yfinance

## Done when
- `fetch_prices("AAPL", ...)` returns data without error
