import { useState, useCallback } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
  Legend,
} from "recharts";

const INTERVALS = ["1d", "1wk", "1mo"];
const PRESETS = ["1M", "3M", "1Y", "YTD"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{formatDate(label)}</div>
      <div>Open: <strong>${p?.open?.toFixed(2)}</strong></div>
      <div>Close: <strong>${p?.close?.toFixed(2)}</strong></div>
      <div>High: <strong>${p?.high?.toFixed(2)}</strong></div>
      <div>Low: <strong>${p?.low?.toFixed(2)}</strong></div>
      <div>Volume: <strong>{p?.volume?.toLocaleString()}</strong></div>
    </div>
  );
}

export default function StockChart({
  ticker,
  data,
  interval,
  onIntervalChange,
  preset,
  onPresetChange,
  loading,
}) {
  const [zoomStart, setZoomStart] = useState(null);
  const [zoomEnd, setZoomEnd] = useState(null);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomedData, setZoomedData] = useState(null);

  const displayData = zoomedData ?? data;

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
      setZoomStart(null);
      setZoomEnd(null);
      return;
    }
    const [a, b] = [zoomStart, zoomEnd].sort();
    setZoomedData(data.filter((d) => d.date >= a && d.date <= b));
    setZoomStart(null);
    setZoomEnd(null);
  }, [zoomActive, zoomStart, zoomEnd, data]);

  function resetZoom() {
    setZoomedData(null);
    setZoomStart(null);
    setZoomEnd(null);
  }

  // Reset zoom whenever base data changes
  const prevDataRef = useCallback((node) => {
    if (node !== null) setZoomedData(null);
  }, []);

  const prices = displayData?.map((d) => d.close) ?? [];
  const minPrice = prices.length ? Math.min(...prices) * 0.995 : "auto";
  const maxPrice = prices.length ? Math.max(...prices) * 1.005 : "auto";

  return (
    <div className="stock-chart">
      <div className="chart-controls">
        <div className="control-group">
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
        {zoomedData && (
          <button className="control-btn reset-btn" onClick={resetZoom}>
            Reset zoom
          </button>
        )}
        {loading && <span className="chart-loading">Updating…</span>}
      </div>

      {!displayData?.length ? (
        <div className="chart-empty">
          {ticker ? "No data available" : "Select a ticker to begin"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart
            data={displayData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
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
              yAxisId="price"
              domain={[minPrice, maxPrice]}
              orientation="left"
              tick={{ fill: "#8892a4", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={60}
            />
            <YAxis
              yAxisId="volume"
              orientation="right"
              tick={{ fill: "#8892a4", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              fill="#2a2d3a"
              opacity={0.8}
              name="Volume"
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="Close"
            />
            {zoomActive && zoomStart && zoomEnd && (
              <ReferenceArea
                yAxisId="price"
                x1={zoomStart}
                x2={zoomEnd}
                strokeOpacity={0.3}
                fill="#3b82f6"
                fillOpacity={0.15}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
