# Task 10 — NotesSidebar

**Files:** `frontend/src/components/NotesSidebar.jsx`, `frontend/src/hooks/useNotes.js`

**Depends on:** Task 07

## Steps
- `useNotes.js`: fetch notes for selected ticker, expose createNote, updateNote, deleteNote; refetch after each mutation
- `NotesSidebar.jsx`:
  - List notes sorted by date
  - Add form: date input + textarea + submit button
  - Per-note: inline edit mode + delete button

## Done when
- Notes persist for a ticker across page reload
- CRUD operations update list without full refresh
