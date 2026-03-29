import yfinance as yf
from models import PricePoint, StockListItem, StockInfo
from services import cache

TOP_10_TICKERS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "BRK-B", "TSLA", "UNH", "JPM"]

_info_cache: dict[str, StockListItem] = {}


def fetch_prices(ticker: str, start: str, end: str, interval: str) -> list[PricePoint]:
    cache_key = f"{ticker}:{start}:{end}:{interval}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    df = yf.download(ticker, start=start, end=end, interval=interval, progress=False, auto_adjust=True)
    if df.empty:
        return []

    # yfinance returns MultiIndex columns for a single ticker — flatten them
    if isinstance(df.columns, __import__("pandas").MultiIndex):
        df.columns = df.columns.get_level_values(0)

    prices = []
    for ts, row in df.iterrows():
        prices.append(PricePoint(
            date=str(ts.date()),
            open=round(float(row["Open"]), 4),
            close=round(float(row["Close"]), 4),
            high=round(float(row["High"]), 4),
            low=round(float(row["Low"]), 4),
            volume=int(row["Volume"]),
        ))

    cache.set(cache_key, prices)
    return prices


def fetch_info(ticker: str) -> StockInfo:
    info = yf.Ticker(ticker).info
    return StockInfo(
        ticker=ticker,
        name=info.get("longName") or info.get("shortName") or ticker,
        sector=info.get("sector") or "Unknown",
        market_cap=info.get("marketCap"),
        trailing_pe=info.get("trailingPE"),
    )


def get_stock_list() -> list[StockListItem]:
    """Return cached basic info for all top tickers, fetching missing ones."""
    result = []
    for ticker in TOP_10_TICKERS:
        if ticker not in _info_cache:
            info = yf.Ticker(ticker).info
            _info_cache[ticker] = StockListItem(
                ticker=ticker,
                name=info.get("longName") or info.get("shortName") or ticker,
                sector=info.get("sector") or "Unknown",
            )
        result.append(_info_cache[ticker])
    return result
