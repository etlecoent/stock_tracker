import { useState, useEffect, useCallback } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "../api/client";

export function useNotes(ticker) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!ticker) { setNotes([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await getNotes({ ticker });
      setNotes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => { fetch(); }, [fetch]);

  async function add(note) {
    await createNote(note);
    await fetch();
  }

  async function edit(id, content) {
    await updateNote(id, content);
    await fetch();
  }

  async function remove(id) {
    await deleteNote(id);
    await fetch();
  }

  return { notes, loading, error, add, edit, remove };
}
