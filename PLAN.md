# S&P 500 Dashboard — Implementation Plan

## Project Structure

```
s&p500-dashboard/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── routers/
│   │   ├── stocks.py
│   │   └── notes.py
│   ├── services/
│   │   ├── stock_service.py
│   │   └── cache.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StockTable.jsx
│   │   │   ├── StockChart.jsx
│   │   │   ├── NotesSidebar.jsx
│   │   │   └── TickerSelector.jsx
│   │   ├── hooks/
│   │   │   ├── useStocks.js
│   │   │   └── useNotes.js
│   │   ├── api/
│   │   │   └── client.js
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## Backend

### `requirements.txt`
```
fastapi
uvicorn
yfinance
apscheduler
aiosqlite
pydantic
httpx
```

### `database.py`
- Init SQLite via aiosqlite
- Create `notes` table at startup:
```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker TEXT NOT NULL,
  date TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### `models.py`
Pydantic models:
```python
class NoteCreate(BaseModel):
    ticker: str
    date: str  # YYYY-MM-DD
    content: str

class Note(NoteCreate):
    id: int
    created_at: str

class PricePoint(BaseModel):
    date: str
    open: float
    close: float
    high: float
    low: float
    volume: int

class StockPrices(BaseModel):
    ticker: str
    prices: list[PricePoint]
```

### `services/cache.py`
- In-memory dict `{ ticker: { data: [...], fetched_at: datetime } }`
- `is_stale(ticker) -> bool` — TTL 60s
- `set(ticker, data)` and `get(ticker)`

### `services/stock_service.py`
- `TOP_10_TICKERS` — hardcoded list of top 10 S&P companies (AAPL, MSFT, NVDA, AMZN, etc.)
- `fetch_prices(ticker, start, end, interval)` → calls yfinance, returns list of PricePoint
- `fetch_info(ticker)` → returns `{ name, sector, market_cap }`
- APScheduler background task: every 60s, refresh cache for recently-accessed tickers only (not all 50)

### `routers/stocks.py`
```
GET /stocks
  → returns TOP_50_TICKERS with name + sector

GET /stocks/{ticker}/prices
  query params: start (date), end (date), interval (1d|1wk|1mo)
  → check cache → if stale, fetch yfinance → store cache → return

GET /stocks/{ticker}/info
  → yfinance Ticker.info, fields: longName, sector, marketCap, trailingPE
```

### `routers/notes.py`
```
POST /notes
  body: NoteCreate → INSERT → return Note

GET /notes
  query params: ticker? (filter), date? (filter)
  → SELECT with optional WHERE

PUT /notes/{id}
  body: { content: str } → UPDATE content

DELETE /notes/{id}
  → DELETE, return 204
```

### `main.py`
- Instantiate FastAPI
- CORS middleware (allow localhost:5173)
- Lifespan handler: init DB + start APScheduler
- Include routers at `/stocks` and `/notes`

---

## Frontend

### `api/client.js`
- Base URL `http://localhost:8000`
- Functions: `getStocks()`, `getStockPrices(ticker, start, end, interval)`, `getStockInfo(ticker)`, `getNotes(ticker, date)`, `createNote()`, `updateNote()`, `deleteNote()`

### `hooks/useStocks.js`
- State: `selectedTicker`, `priceData`, `interval`, `dateRange`
- Poll every 60s via `setInterval` to refresh prices for selected ticker

### `hooks/useNotes.js`
- CRUD notes for selected ticker
- Refetch after each mutation

### `App.jsx` — Layout
```
┌─────────────────────────────────────────┐
│  TickerSelector (dropdown top 50)        │
├──────────────────────┬──────────────────┤
│  StockChart          │  NotesSidebar    │
│  (Recharts + zoom)   │  (list + form)   │
├──────────────────────┴──────────────────┤
│  StockTable (filterable, sortable)       │
└─────────────────────────────────────────┘
```

### `StockChart.jsx`
- Recharts `ComposedChart` with Line (close price) + Bar (volume)
- `ReferenceArea` for zoom (mousedown → mousemove → mouseup)
- Interval selector: `1d` / `1wk` / `1mo`
- Date range presets: last 1M / 3M / 1Y / YTD

### `StockTable.jsx`
- Columns: Date, Open, Close, High, Low, Volume, Change%
- Sortable by column (click header)
- Filter by date range (same as chart)
- Change% calculated client-side: `(close - open) / open * 100`
- Color coding red/green on Change%

### `NotesSidebar.jsx`
- List notes for selected ticker
- Form: date picker + textarea + submit
- Inline edit + delete
- Highlight date on chart on note hover (optional, time permitting)

---

## README
Sections:
- Setup & run (backend: `uvicorn main:app --reload`, frontend: `npm run dev`)
- Assumptions & decisions
- What I'd do with more time (AI bonus, WebSocket real-time, Postgres)
