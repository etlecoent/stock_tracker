import asyncio
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, Query
from models import StockListItem, StockPrices, StockInfo, MultiStockPrices
from services import stock_service

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.get("", response_model=list[StockListItem])
async def list_stocks():
    return stock_service.get_stock_list()


@router.get("/{ticker}/prices", response_model=StockPrices)
async def get_prices(
    ticker: str,
    start: str = Query(default=None),
    end: str = Query(default=None),
    interval: str = Query(default="1d", pattern="^(1d|1wk|1mo)$"),
):
    ticker = ticker.upper()
    if ticker not in stock_service.TOP_10_TICKERS:
        raise HTTPException(status_code=404, detail="Ticker not found")

    if end is None:
        end = date.today().isoformat()
    if start is None:
        start = (date.today() - timedelta(days=365)).isoformat()

    prices = stock_service.fetch_prices(ticker, start, end, interval)
    return StockPrices(ticker=ticker, prices=prices)


@router.get("/prices", response_model=MultiStockPrices)
async def get_multi_prices(
    tickers: str = Query(..., description="Comma-separated tickers, e.g. AAPL,MSFT"),
    start: str = Query(default=None),
    end: str = Query(default=None),
    interval: str = Query(default="1d", pattern="^(1d|1wk|1mo)$"),
):
    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    if not ticker_list:
        raise HTTPException(status_code=400, detail="At least one ticker required")
    invalid = [t for t in ticker_list if t not in stock_service.TOP_10_TICKERS]
    if invalid:
        raise HTTPException(status_code=404, detail=f"Unknown tickers: {', '.join(invalid)}")

    if end is None:
        end = date.today().isoformat()
    if start is None:
        start = (date.today() - timedelta(days=365)).isoformat()

    # Run sequentially — yfinance is not thread-safe, concurrent calls corrupt data
    results = {}
    loop = asyncio.get_event_loop()
    for t in ticker_list:
        results[t] = await loop.run_in_executor(
            None, stock_service.fetch_prices, t, start, end, interval
        )
    return results


@router.get("/{ticker}/info", response_model=StockInfo)
async def get_info(ticker: str):
    ticker = ticker.upper()
    if ticker not in stock_service.TOP_10_TICKERS:
        raise HTTPException(status_code=404, detail="Ticker not found")
    return stock_service.fetch_info(ticker)
