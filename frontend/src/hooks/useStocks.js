import { useState, useEffect, useCallback, useRef } from "react";
import { subMonths, subYears, startOfYear, format } from "date-fns";
import { getMultiStockPrices } from "../api/client";

const POLL_INTERVAL = 60_000;

export const TICKER_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

function getPresetRange(preset) {
  const today = new Date();
  const end = format(today, "yyyy-MM-dd");
  const starts = {
    "1M": format(subMonths(today, 1), "yyyy-MM-dd"),
    "3M": format(subMonths(today, 3), "yyyy-MM-dd"),
    "1Y": format(subYears(today, 1), "yyyy-MM-dd"),
    YTD: format(startOfYear(today), "yyyy-MM-dd"),
  };
  return { start: starts[preset] ?? starts["1Y"], end };
}

export function useStocks() {
  const [selectedTickers, setSelectedTickers] = useState([]);
  const [pendingTickers, setPendingTickers] = useState([]);
  const [interval, setInterval_] = useState("1d");
  const [preset, setPreset] = useState("1Y");
  const [dateRange, setDateRange] = useState(() => getPresetRange("1Y"));
  const [priceData, setPriceData] = useState({});  // { [ticker]: PricePoint[] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetchTickers = useCallback(async (tickers, range, iv) => {
    if (!tickers.length) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMultiStockPrices(tickers, { ...range, interval: iv });
      setPriceData((prev) => ({ ...prev, ...data }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply pending tickers: only fetch newly added ones
  function applyTickers() {
    const newTickers = pendingTickers.filter((t) => !selectedTickers.includes(t));
    // Remove tickers no longer pending
    setPriceData((prev) => {
      const next = {};
      for (const t of pendingTickers) if (prev[t]) next[t] = prev[t];
      return next;
    });
    setSelectedTickers(pendingTickers);
    if (newTickers.length) fetchTickers(newTickers, dateRange, interval);
  }

  function clearTickers() {
    setPendingTickers([]);
    setSelectedTickers([]);
    setPriceData({});
  }

  // Re-fetch all when range/interval changes
  useEffect(() => {
    if (selectedTickers.length) fetchTickers(selectedTickers, dateRange, interval);
  }, [dateRange, interval]);

  // 60s polling
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!selectedTickers.length) return;
    timerRef.current = setInterval(
      () => fetchTickers(selectedTickers, dateRange, interval),
      POLL_INTERVAL
    );
    return () => clearInterval(timerRef.current);
  }, [selectedTickers, dateRange, interval, fetchTickers]);

  function applyPreset(p) {
    setPreset(p);
    setDateRange(getPresetRange(p));
  }

  return {
    selectedTickers,
    pendingTickers, setPendingTickers,
    applyTickers, clearTickers,
    interval, setInterval: setInterval_,
    preset, applyPreset,
    dateRange, setDateRange,
    priceData,
    loading,
    error,
  };
}
