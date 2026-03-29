from fastapi import APIRouter, HTTPException
from models import Note, NoteCreate, NoteUpdate
from database import get_db

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("", response_model=Note, status_code=201)
async def create_note(note: NoteCreate):
    async with get_db() as db:
        cursor = await db.execute(
            "INSERT INTO notes (ticker, date, content) VALUES (?, ?, ?)",
            (note.ticker.upper(), note.date, note.content),
        )
        await db.commit()
        row = await (await db.execute(
            "SELECT id, ticker, date, content, created_at FROM notes WHERE id = ?",
            (cursor.lastrowid,),
        )).fetchone()
    return Note(id=row[0], ticker=row[1], date=row[2], content=row[3], created_at=row[4])


@router.get("", response_model=list[Note])
async def list_notes(ticker: str | None = None, date: str | None = None):
    query = "SELECT id, ticker, date, content, created_at FROM notes"
    params = []
    filters = []
    if ticker:
        filters.append("ticker = ?")
        params.append(ticker.upper())
    if date:
        filters.append("date = ?")
        params.append(date)
    if filters:
        query += " WHERE " + " AND ".join(filters)
    query += " ORDER BY date DESC, created_at DESC"

    async with get_db() as db:
        rows = await (await db.execute(query, params)).fetchall()
    return [Note(id=r[0], ticker=r[1], date=r[2], content=r[3], created_at=r[4]) for r in rows]


@router.put("/{note_id}", response_model=Note)
async def update_note(note_id: int, body: NoteUpdate):
    async with get_db() as db:
        await db.execute(
            "UPDATE notes SET content = ? WHERE id = ?",
            (body.content, note_id),
        )
        await db.commit()
        row = await (await db.execute(
            "SELECT id, ticker, date, content, created_at FROM notes WHERE id = ?",
            (note_id,),
        )).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Note not found")
    return Note(id=row[0], ticker=row[1], date=row[2], content=row[3], created_at=row[4])


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: int):
    async with get_db() as db:
        result = await db.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Note not found")
