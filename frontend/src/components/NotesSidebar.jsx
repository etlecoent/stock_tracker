import { useState } from "react";
import { useNotes } from "../hooks/useNotes";

function NoteItem({ note, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);

  async function handleSave() {
    if (!draft.trim()) return;
    await onEdit(note.id, draft.trim());
    setEditing(false);
  }

  function handleCancel() {
    setDraft(note.content);
    setEditing(false);
  }

  return (
    <div className="note-item">
      <div className="note-meta">
        <span className="note-date">{note.date}</span>
        <div className="note-actions">
          {!editing && (
            <>
              <button className="note-btn" onClick={() => setEditing(true)}>Edit</button>
              <button className="note-btn danger" onClick={() => onDelete(note.id)}>Delete</button>
            </>
          )}
        </div>
      </div>
      {editing ? (
        <div className="note-edit">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="note-edit-actions">
            <button className="note-btn primary" onClick={handleSave}>Save</button>
            <button className="note-btn" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <p className="note-content">{note.content}</p>
      )}
    </div>
  );
}

export default function NotesSidebar({ ticker }) {
  const { notes, loading, error, add, edit, remove } = useNotes(ticker);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || !ticker) return;
    setSubmitting(true);
    try {
      await add({ ticker, date, content: content.trim() });
      setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="notes-sidebar">
      <div className="notes-header">
        <h2>Notes {ticker ? `· ${ticker}` : ""}</h2>
      </div>

      <form className="notes-form" onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <textarea
          placeholder={ticker ? "Add a note…" : "Select a ticker first"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={!ticker}
        />
        <button
          type="submit"
          className="note-btn primary"
          disabled={!ticker || !content.trim() || submitting}
        >
          {submitting ? "Saving…" : "Add note"}
        </button>
      </form>

      <div className="notes-list">
        {loading && <p className="notes-status">Loading…</p>}
        {error && <p className="notes-status error">{error}</p>}
        {!loading && !error && notes.length === 0 && (
          <p className="notes-status">No notes yet.</p>
        )}
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} onEdit={edit} onDelete={remove} />
        ))}
      </div>
    </div>
  );
}
