import TickerSelector from "./components/TickerSelector";
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
          {/* StockChart — Task 08 */}
          <div className="placeholder">Chart coming in Task 08</div>
        </div>

        <aside className="notes-area">
          {/* NotesSidebar — Task 10 */}
          <div className="placeholder">Notes coming in Task 10</div>
        </aside>

        <section className="table-area">
          {/* StockTable — Task 09 */}
          <div className="placeholder">Table coming in Task 09</div>
        </section>
      </main>
    </div>
  );
}
