from pydantic import BaseModel


class NoteCreate(BaseModel):
    ticker: str
    date: str  # YYYY-MM-DD
    content: str


class Note(NoteCreate):
    id: int
    created_at: str


class NoteUpdate(BaseModel):
    content: str


class PricePoint(BaseModel):
    date: str
    open: float
    close: float
    high: float
    low: float
    volume: int


class StockPrices(BaseModel):
    ticker: str
    prices: list[PricePoint]


class StockInfo(BaseModel):
    ticker: str
    name: str
    sector: str
    market_cap: int | None
    trailing_pe: float | None


class StockListItem(BaseModel):
    ticker: str
    name: str
    sector: str
