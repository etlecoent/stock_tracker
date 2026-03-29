import TickerSelector from "./components/TickerSelector";
import StockChart from "./components/StockChart";
import StockTable from "./components/StockTable";
import NotesSidebar from "./components/NotesSidebar";
import { useStocks } from "./hooks/useStocks";
import "./App.css";

export default function App() {
  const stocks = useStocks();

  return (
    <div className="app">
      <header className="app-header">
        <h1>S&amp;P 500 Tracker</h1>
        <TickerSelector
          selectedTickers={stocks.selectedTickers}
          pendingTickers={stocks.pendingTickers}
          onChange={stocks.setPendingTickers}
          onApply={stocks.applyTickers}
          onClear={stocks.clearTickers}
        />
      </header>

      <main className="app-main">
        <div className="chart-area">
          {stocks.error && (
            <div className="error-banner">Failed to fetch data: {stocks.error}</div>
          )}
          <StockChart
            tickers={stocks.selectedTickers}
            priceData={stocks.priceData}
            interval={stocks.interval}
            onIntervalChange={stocks.setInterval}
            preset={stocks.preset}
            onPresetChange={stocks.applyPreset}
            loading={stocks.loading}
          />
        </div>

        <aside className="notes-area">
          <NotesSidebar
            tickers={stocks.selectedTickers}
            selectedTickers={stocks.selectedTickers}
          />
        </aside>

        <section className="table-area">
          <StockTable
            priceData={stocks.priceData}
            tickers={stocks.selectedTickers}
          />
        </section>
      </main>
    </div>
  );
}
