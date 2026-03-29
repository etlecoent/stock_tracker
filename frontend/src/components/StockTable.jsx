import { useState, useMemo } from "react";
import { TICKER_COLORS } from "../hooks/useStocks";

const COLUMNS = [
  { key: "ticker",  label: "Ticker" },
  { key: "date",    label: "Date" },
  { key: "open",    label: "Open",   fmt: (v) => `$${v.toFixed(2)}` },
  { key: "close",   label: "Close",  fmt: (v) => `$${v.toFixed(2)}` },
  { key: "high",    label: "High",   fmt: (v) => `$${v.toFixed(2)}` },
  { key: "low",     label: "Low",    fmt: (v) => `$${v.toFixed(2)}` },
  { key: "volume",  label: "Volume", fmt: (v) => v.toLocaleString() },
  { key: "change",  label: "Change %", fmt: (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%` },
];

export default function StockTable({ priceData, tickers }) {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [hiddenTickers, setHiddenTickers] = useState({});

  function handleSort(key) {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  function toggleTicker(ticker) {
    setHiddenTickers((prev) => ({ ...prev, [ticker]: !prev[ticker] }));
  }

  const colorByTicker = Object.fromEntries(
    tickers.map((t, i) => [t, TICKER_COLORS[i]])
  );

  const rows = useMemo(() => {
    const all = [];
    for (const ticker of tickers) {
      if (hiddenTickers[ticker]) continue;
      for (const d of priceData[ticker] ?? []) {
        all.push({ ...d, ticker, change: ((d.close - d.open) / d.open) * 100 });
      }
    }
    return all.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [priceData, tickers, hiddenTickers, sortKey, sortDir]);

  if (!tickers.length) {
    return <div className="table-empty">Select tickers to begin</div>;
  }

  return (
    <div className="stock-table-container">
      {tickers.length > 1 && (
        <div className="table-ticker-filter">
          {tickers.map((t, i) => (
            <button
              key={t}
              className={`ticker-filter-btn ${hiddenTickers[t] ? "inactive" : ""}`}
              style={{ "--color": TICKER_COLORS[i] }}
              onClick={() => toggleTicker(t)}
            >
              <span className="ticker-dot" />
              {t}
            </button>
          ))}
        </div>
      )}
      <div className="stock-table-wrap">
        <table className="stock-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={sortKey === col.key ? "sorted" : ""}
                >
                  {col.label}
                  <span className="sort-indicator">
                    {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : " ⇅"}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${row.ticker}-${row.date}-${idx}`}>
                {COLUMNS.map((col) => {
                  const val = row[col.key];
                  if (col.key === "ticker") {
                    return (
                      <td key="ticker">
                        <span className="ticker-dot" style={{ background: colorByTicker[val] }} />
                        {val}
                      </td>
                    );
                  }
                  return (
                    <td
                      key={col.key}
                      className={col.key === "change" ? (val >= 0 ? "positive" : "negative") : ""}
                    >
                      {col.fmt ? col.fmt(val) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
