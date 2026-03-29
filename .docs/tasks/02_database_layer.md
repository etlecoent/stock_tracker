# Task 02 — Database layer

**Files:** `backend/database.py`, `backend/models.py`

**Depends on:** Task 01

## Steps
- `database.py`: init SQLite via aiosqlite, create `notes` table on startup
- `models.py`: Pydantic models — NoteCreate, Note, PricePoint, StockPrices

## Done when
- DB initializes on server startup with no errors
- Notes table exists in `stock_tracker.db`
