# Task 01 — Backend project setup

**Files:** `backend/requirements.txt`, `backend/main.py`

## Steps
- Create `backend/` directory
- Write `requirements.txt` with: fastapi, uvicorn, yfinance, apscheduler, aiosqlite, pydantic, httpx
- Write `main.py`: FastAPI app skeleton, CORS middleware (allow localhost:5173), lifespan handler placeholder

## Done when
- `uvicorn main:app --reload` starts without errors
