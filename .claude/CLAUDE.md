# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend
```bash
cd backend
uv venv                          # first time only
source .venv/bin/activate
uv pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # dev server on localhost:5173
npm run build     # production build (use to verify no errors)
```

## Architecture

### Backend (`backend/`)
FastAPI app. All modules are at the package root — no `src/` wrapper. Uvicorn's working directory must be `backend/` for imports to resolve.

- **`main.py`** — app entry point, CORS (localhost:5173), lifespan handler (DB init)
- **`database.py`** — aiosqlite, `init_db()` creates `notes` table, `get_db()` returns a context-managed connection
- **`models.py`** — Pydantic models shared across routers (`PricePoint`, `StockPrices`, `MultiStockPrices`, `Note*`, `StockInfo`, `StockListItem`)
- **`services/stock_service.py`** — `fetch_prices()` calls yfinance and caches results; `TOP_10_TICKERS` is the hardcoded universe. **yfinance is not thread-safe** — the batch endpoint fetches tickers sequentially in `run_in_executor`, not with `asyncio.gather`
- **`services/cache.py`** — in-memory TTL cache (60s), keyed by `"{ticker}:{start}:{end}:{interval}"`
- **`routers/stocks.py`** — `GET /stocks`, `GET /stocks/{ticker}/prices`, `GET /stocks/{ticker}/info`, `GET /stocks/prices?tickers=A,B` (batch)
- **`routers/notes.py`** — CRUD for notes stored in SQLite (`notes` table: id, ticker, date, content, created_at)

### Frontend (`frontend/src/`)
Vite + React, no state management library.

- **`hooks/useStocks.js`** — central state: `selectedTickers[]`, `pendingTickers[]`, `priceData: { [ticker]: PricePoint[] }`, interval, preset, dateRange. `applyTickers()` diffs pending vs selected and only fetches new tickers. Polls every 60s. Exports `TICKER_COLORS` (5-color palette used by every component).
- **`hooks/useNotes.js`** — fetches notes for all selected tickers in parallel, exposes add/edit/remove that refetch after mutation
- **`api/client.js`** — thin fetch wrappers, all pointing to `http://localhost:8000`
- **`App.jsx`** — CSS grid layout: header (TickerSelector), chart+notes (2-col), table (full width below)

### Key cross-cutting conventions
- `TICKER_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"]` — ticker index → color, used identically in chart lines, selector tags, table dots, and note section headers
- Chart Y-axis shows **% change from first data point**, not raw price — enables meaningful multi-ticker comparison
- `pendingTickers` vs `selectedTickers` — the selector operates on pending state; `applyTickers()` triggers the fetch and promotes pending → selected
- SQLite DB file (`stock_tracker.db`) is gitignored and created at runtime in `backend/`
