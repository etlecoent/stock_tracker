import { useEffect, useState, useRef } from "react";
import { getStocks } from "../api/client";
import { TICKER_COLORS } from "../hooks/useStocks";

export default function TickerSelector({
  selectedTickers,
  pendingTickers,
  onChange,
  onApply,
  onClear,
}) {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    getStocks().then(setStocks).catch(console.error);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = stocks.filter(
    (s) =>
      !pendingTickers.includes(s.ticker) &&
      (s.ticker.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase()))
  );

  function addTicker(ticker) {
    if (pendingTickers.length >= 5) return;
    onChange([...pendingTickers, ticker]);
    setSearch("");
  }

  function removeTicker(ticker) {
    onChange(pendingTickers.filter((t) => t !== ticker));
  }

  const hasChanges =
    JSON.stringify([...pendingTickers].sort()) !==
    JSON.stringify([...selectedTickers].sort());

  return (
    <div className="ticker-selector">
      <div className="ticker-tags">
        {pendingTickers.map((ticker, i) => (
          <span
            key={ticker}
            className="ticker-tag"
            style={{ borderColor: TICKER_COLORS[i], color: TICKER_COLORS[i] }}
          >
            {ticker}
            <button className="tag-remove" onClick={() => removeTicker(ticker)}>×</button>
          </span>
        ))}

        {pendingTickers.length < 5 && (
          <div className="ticker-dropdown-wrap" ref={wrapRef}>
            <input
              className="ticker-search"
              placeholder="Add ticker…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
            />
            {open && filtered.length > 0 && (
              <ul className="ticker-dropdown">
                {filtered.map((s) => (
                  <li key={s.ticker} onMouseDown={() => addTicker(s.ticker)}>
                    <strong>{s.ticker}</strong> — {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="ticker-actions">
        <button
          className="control-btn active"
          onClick={onApply}
          disabled={!hasChanges && selectedTickers.length > 0}
        >
          Apply
        </button>
        {(pendingTickers.length > 0 || selectedTickers.length > 0) && (
          <button className="control-btn" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
