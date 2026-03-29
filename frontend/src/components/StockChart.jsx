import { useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TICKER_COLORS } from "../hooks/useStocks";

const INTERVALS = ["1d", "1wk", "1mo"];
const PRESETS = ["1M", "3M", "1Y", "YTD"];
const DASH_PATTERNS = ["", "8 4", "4 4", "12 4 4 4", "2 4"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

function normalizeData(priceData, tickers) {
  // Build a map of date -> { date, [ticker]: pctChange }
  const byDate = {};
  for (const ticker of tickers) {
    const points = priceData[ticker] ?? [];
    if (!points.length) continue;
    const base = points[0].close;
    for (const p of points) {
      if (!byDate[p.date]) byDate[p.date] = { date: p.date };
      byDate[p.date][ticker] = +((( p.close - base) / base) * 100).toFixed(3);
      byDate[p.date][`${ticker}_raw`] = p.close;
    }
  }
  return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
}

function CustomTooltip({ active, payload, label, tickers, rawData }) {
  if (!active || !payload?.length) return null;
  const row = rawData?.find((d) => d.date === label);
  const byTicker = Object.fromEntries(payload.map((p) => [p.dataKey, p]));
  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{formatDate(label)}</div>
      {tickers.map((t, i) => {
        const p = byTicker[t];
        if (!p) return null;
        const raw = row?.[`${t}_raw`];
        return (
          <div key={t} style={{ color: TICKER_COLORS[i] }}>
            <strong>{t}</strong>: {p.value >= 0 ? "+" : ""}{p.value?.toFixed(2)}%
            {raw != null && <span className="tooltip-raw"> (${raw.toFixed(2)})</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function StockChart({
  tickers,
  priceData,
  interval,
  onIntervalChange,
  preset,
  onPresetChange,
  loading,
}) {
  const [hidden, setHidden] = useState({});
  const [zoomStart, setZoomStart] = useState(null);
  const [zoomEnd, setZoomEnd] = useState(null);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomedDates, setZoomedDates] = useState(null);

  const allData = normalizeData(priceData, tickers);
  const displayData = zoomedDates
    ? allData.filter((d) => d.date >= zoomedDates[0] && d.date <= zoomedDates[1])
    : allData;

  const handleMouseDown = useCallback((e) => {
    if (!e?.activeLabel) return;
    setZoomStart(e.activeLabel);
    setZoomEnd(null);
    setZoomActive(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!zoomActive || !e?.activeLabel) return;
    setZoomEnd(e.activeLabel);
  }, [zoomActive]);

  const handleMouseUp = useCallback(() => {
    if (!zoomActive) return;
    setZoomActive(false);
    if (!zoomStart || !zoomEnd || zoomStart === zoomEnd) {
      setZoomStart(null); setZoomEnd(null); return;
    }
    const sorted = [zoomStart, zoomEnd].sort();
    setZoomedDates(sorted);
    setZoomStart(null); setZoomEnd(null);
  }, [zoomActive, zoomStart, zoomEnd]);

  function resetZoom() { setZoomedDates(null); }

  function toggleTicker(ticker) {
    setHidden((prev) => ({ ...prev, [ticker]: !prev[ticker] }));
  }

  return (
    <div className="stock-chart">
      <div className="chart-controls">
        <div className="control-group" title="Set the date range for chart and table">
          {PRESETS.map((p) => (
            <button
              key={p}
              className={`control-btn ${preset === p ? "active" : ""}`}
              onClick={() => { onPresetChange(p); resetZoom(); }}
            >
              {p}
            </button>
          ))}
          <span className="help-icon" data-tip="Set the date range for chart and table">?</span>
        </div>
        <div className="control-group">
          {INTERVALS.map((iv) => (
            <button
              key={iv}
              className={`control-btn ${interval === iv ? "active" : ""}`}
              onClick={() => { onIntervalChange(iv); resetZoom(); }}
            >
              {iv}
            </button>
          ))}
          <span className="help-icon" data-tip="Set data granularity (daily, weekly, monthly)">?</span>
        </div>
        {zoomedDates && (
          <button className="control-btn reset-btn" onClick={resetZoom}>Reset zoom</button>
        )}
        {loading && <span className="chart-loading">Updating…</span>}
      </div>

      {!tickers.length ? (
        <div className="chart-empty">Select tickers to begin</div>
      ) : !displayData.length ? (
        <div className="chart-empty">No data for selected range</div>
      ) : (
        <>
          <div className="chart-legend">
            {tickers.map((t, i) => (
              <button
                key={t}
                className={`legend-item ${hidden[t] ? "legend-hidden" : ""}`}
                onClick={() => toggleTicker(t)}
                style={{ "--color": TICKER_COLORS[i] }}
              >
                <svg width="16" height="8" className="legend-line">
                  <line
                    x1="0" y1="4" x2="16" y2="4"
                    stroke={TICKER_COLORS[i]}
                    strokeWidth="2"
                    strokeDasharray={DASH_PATTERNS[i]}
                  />
                </svg>
                {t}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={displayData}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ userSelect: "none" }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "#8892a4", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#2a2d3a" }}
                minTickGap={60}
              />
              <YAxis
                tick={{ fill: "#8892a4", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`}
                width={64}
              />
              <Tooltip content={<CustomTooltip tickers={tickers.filter((t) => !hidden[t])} rawData={displayData} />} />
              {tickers.map((t, i) =>
                hidden[t] ? null : (
                  <Line
                    key={t}
                    type="monotone"
                    dataKey={t}
                    stroke={TICKER_COLORS[i]}
                    dot={false}
                    strokeWidth={2}
                    strokeDasharray={DASH_PATTERNS[i]}
                    connectNulls
                  />
                )
              )}
              {zoomActive && zoomStart && zoomEnd && (
                <ReferenceArea
                  x1={zoomStart}
                  x2={zoomEnd}
                  strokeOpacity={0.3}
                  fill="#3b82f6"
                  fillOpacity={0.15}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
