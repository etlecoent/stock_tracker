import { useState, useMemo } from "react";

const COLUMNS = [
  { key: "date",    label: "Date" },
  { key: "open",    label: "Open",   fmt: (v) => `$${v.toFixed(2)}` },
  { key: "close",   label: "Close",  fmt: (v) => `$${v.toFixed(2)}` },
  { key: "high",    label: "High",   fmt: (v) => `$${v.toFixed(2)}` },
  { key: "low",     label: "Low",    fmt: (v) => `$${v.toFixed(2)}` },
  { key: "volume",  label: "Volume", fmt: (v) => v.toLocaleString() },
  { key: "change",  label: "Change %", fmt: (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%` },
];

export default function StockTable({ data }) {
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const rows = useMemo(() => {
    if (!data?.length) return [];
    const enriched = data.map((d) => ({
      ...d,
      change: ((d.close - d.open) / d.open) * 100,
    }));
    return [...enriched].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (!data?.length) {
    return (
      <div className="table-empty">
        {data ? "No data for selected range" : "Select a ticker to begin"}
      </div>
    );
  }

  return (
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
          {rows.map((row) => (
            <tr key={row.date}>
              {COLUMNS.map((col) => {
                const val = row[col.key];
                const isChange = col.key === "change";
                return (
                  <td
                    key={col.key}
                    className={isChange ? (val >= 0 ? "positive" : "negative") : ""}
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
  );
}
