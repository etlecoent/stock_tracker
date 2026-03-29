import { useState, useEffect, useCallback, useRef } from "react";
import { subMonths, subYears, startOfYear, format } from "date-fns";
import { getStockPrices } from "../api/client";

const POLL_INTERVAL = 60_000;

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
  const [ticker, setTicker] = useState(null);
  const [interval, setInterval_] = useState("1d");
  const [preset, setPreset] = useState("1Y");
  const [dateRange, setDateRange] = useState(() => getPresetRange("1Y"));
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetchPrices = useCallback(async (t, range, iv) => {
    if (!t) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStockPrices(t, { ...range, interval: iv });
      setPriceData(data.prices);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on ticker / range / interval change
  useEffect(() => {
    fetchPrices(ticker, dateRange, interval);
  }, [ticker, dateRange, interval, fetchPrices]);

  // 60s polling
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!ticker) return;
    timerRef.current = setInterval(() => fetchPrices(ticker, dateRange, interval), POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [ticker, dateRange, interval, fetchPrices]);

  function applyPreset(p) {
    setPreset(p);
    setDateRange(getPresetRange(p));
  }

  return {
    ticker, setTicker,
    interval, setInterval: setInterval_,
    preset, applyPreset,
    dateRange, setDateRange,
    priceData,
    loading,
    error,
  };
}
