# Task 05 — Notes router

**Files:** `backend/routers/notes.py`, `backend/main.py`

**Depends on:** Task 02

## Endpoints
- `POST /notes` body: NoteCreate → INSERT → return Note
- `GET /notes?ticker=&date=` → SELECT with optional WHERE filters
- `PUT /notes/{id}` body: { content } → UPDATE
- `DELETE /notes/{id}` → DELETE, return 204

## Done when
- Full CRUD cycle works via curl
- Notes persist across server restarts
