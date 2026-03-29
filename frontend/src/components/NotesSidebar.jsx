import { useState } from "react";
import { useNotes } from "../hooks/useNotes";
import { TICKER_COLORS } from "../hooks/useStocks";

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
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} autoFocus />
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

function TickerSection({ ticker, color, notes, onEdit, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="notes-section">
      <button
        className="notes-section-header"
        onClick={() => setCollapsed((c) => !c)}
      >
        <span className="ticker-tag-small" style={{ borderColor: color, color }}>
          {ticker}
        </span>
        <span className="notes-count">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
        <span className="collapse-icon">{collapsed ? "▶" : "▼"}</span>
      </button>
      {!collapsed && (
        <div className="notes-section-body">
          {notes.length === 0 ? (
            <p className="notes-status">No notes yet.</p>
          ) : (
            notes.map((n) => (
              <NoteItem key={n.id} note={n} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function NotesSidebar({ tickers, selectedTickers }) {
  const { notes, loading, error, add, edit, remove } = useNotes(tickers);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [content, setContent] = useState("");
  const [targetTicker, setTargetTicker] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeTicker = targetTicker || tickers[0] || "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || !activeTicker) return;
    setSubmitting(true);
    try {
      await add({ ticker: activeTicker, date, content: content.trim() });
      setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  // Group notes by ticker
  const byTicker = {};
  for (const t of tickers) byTicker[t] = [];
  for (const n of notes) {
    if (byTicker[n.ticker]) byTicker[n.ticker].push(n);
  }

  const colorByTicker = Object.fromEntries(
    selectedTickers.map((t, i) => [t, TICKER_COLORS[i]])
  );

  return (
    <div className="notes-sidebar">
      <div className="notes-header">
        <h2>Notes</h2>
      </div>

      <form className="notes-form" onSubmit={handleSubmit}>
        {tickers.length > 1 && (
          <select
            value={activeTicker}
            onChange={(e) => setTargetTicker(e.target.value)}
          >
            {tickers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <textarea
          placeholder={tickers.length ? "Add a note…" : "Select tickers first"}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={!tickers.length}
        />
        <button
          type="submit"
          className="note-btn primary"
          disabled={!tickers.length || !content.trim() || submitting}
        >
          {submitting ? "Saving…" : "Add note"}
        </button>
      </form>

      <div className="notes-list">
        {loading && <p className="notes-status">Loading…</p>}
        {error && <p className="notes-status error">{error}</p>}
        {!loading && !error && tickers.length === 0 && (
          <p className="notes-status">No tickers selected.</p>
        )}
        {!loading && !error && tickers.map((t) => (
          <TickerSection
            key={t}
            ticker={t}
            color={colorByTicker[t] || "#8892a4"}
            notes={byTicker[t] || []}
            onEdit={edit}
            onDelete={remove}
          />
        ))}
      </div>
    </div>
  );
}
