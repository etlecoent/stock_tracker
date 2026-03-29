import TickerSelector from "./components/TickerSelector";
import StockChart from "./components/StockChart";
import StockTable from "./components/StockTable";
import { useStocks } from "./hooks/useStocks";
import "./App.css";

export default function App() {
  const stocks = useStocks();

  return (
    <div className="app">
      <header className="app-header">
        <h1>S&amp;P 500 Tracker</h1>
        <TickerSelector value={stocks.ticker} onChange={stocks.setTicker} />
      </header>

      <main className="app-main">
        <div className="chart-area">
          <StockChart
            ticker={stocks.ticker}
            data={stocks.priceData}
            interval={stocks.interval}
            onIntervalChange={stocks.setInterval}
            preset={stocks.preset}
            onPresetChange={stocks.applyPreset}
            loading={stocks.loading}
          />
        </div>

        <aside className="notes-area">
          {/* NotesSidebar — Task 10 */}
          <div className="placeholder">Notes coming in Task 10</div>
        </aside>

        <section className="table-area">
          <StockTable data={stocks.priceData} />
        </section>
      </main>
    </div>
  );
}
