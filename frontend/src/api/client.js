const BASE_URL = "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getStocks() {
  return request("/stocks");
}

export function getStockPrices(ticker, { start, end, interval = "1d" } = {}) {
  const params = new URLSearchParams({ interval });
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  return request(`/stocks/${ticker}/prices?${params}`);
}

export function getStockInfo(ticker) {
  return request(`/stocks/${ticker}/info`);
}

export function getMultiStockPrices(tickers, { start, end, interval = "1d" } = {}) {
  const params = new URLSearchParams({ tickers: tickers.join(","), interval });
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  return request(`/stocks/prices?${params}`);
}

export function getNotes({ ticker, date } = {}) {
  const params = new URLSearchParams();
  if (ticker) params.set("ticker", ticker);
  if (date) params.set("date", date);
  return request(`/notes?${params}`);
}

export function createNote(note) {
  return request("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
}

export function updateNote(id, content) {
  return request(`/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export function deleteNote(id) {
  return request(`/notes/${id}`, { method: "DELETE" });
}
