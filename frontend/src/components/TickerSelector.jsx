import { useEffect, useState } from "react";
import { getStocks } from "../api/client";

export default function TickerSelector({ value, onChange }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStocks()
      .then((data) => {
        setStocks(data);
        if (data.length > 0 && !value) onChange(data[0].ticker);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="ticker-selector">
      <label htmlFor="ticker-select">Ticker</label>
      <select
        id="ticker-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        {loading && <option>Loading…</option>}
        {stocks.map((s) => (
          <option key={s.ticker} value={s.ticker}>
            {s.ticker} — {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}
