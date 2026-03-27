// src/utils/marketDataService.js
// ─────────────────────────────────────────────────────────────────────────────
// Multi-source live market data service
//
// SOURCE ROUTING:
//   Crypto  → Finnhub WebSocket (wss://ws.finnhub.io)        real-time ticks
//   Stocks  → Finnhub WebSocket (wss://ws.finnhub.io)        real-time ticks
//   Forex   → Twelve Data REST  (api.twelvedata.com)         polled every 30s
//   Indices → Twelve Data REST  (api.twelvedata.com)         polled every 30s
//
// FREE TIER LIMITS:
//   Finnhub    — 60 API calls/min, WebSocket on free plan ✅
//   Twelve Data— 800 API calls/day, 8 calls/min on free plan ✅
//
// KEYS NEEDED IN .env:
//   REACT_APP_FINNHUB_API_KEY=...
//   REACT_APP_TWELVEDATA_API_KEY=...
// ─────────────────────────────────────────────────────────────────────────────

const FINNHUB_KEY    = process.env.REACT_APP_FINNHUB_API_KEY    || 'YOUR_FINNHUB_KEY';
const TWELVEDATA_KEY = process.env.REACT_APP_TWELVEDATA_API_KEY || 'YOUR_TWELVEDATA_KEY';

const FINNHUB_WS   = `wss://ws.finnhub.io?token=${FINNHUB_KEY}`;
const FINNHUB_REST = 'https://finnhub.io/api/v1';
const TD_REST      = 'https://api.twelvedata.com';

// ─── Symbol registry ──────────────────────────────────────────────────────────
// Each entry carries a `source` field so the context knows where to route it.

export const MARKET_SYMBOLS = {
  crypto: [
    { symbol: 'BINANCE:BTCUSDT',  tdSymbol: null,       label: 'BTC/USD',  name: 'Bitcoin',     source: 'finnhub' },
    { symbol: 'BINANCE:ETHUSDT',  tdSymbol: null,       label: 'ETH/USD',  name: 'Ethereum',    source: 'finnhub' },
    { symbol: 'BINANCE:SOLUSDT',  tdSymbol: null,       label: 'SOL/USD',  name: 'Solana',      source: 'finnhub' },
    { symbol: 'BINANCE:BNBUSDT',  tdSymbol: null,       label: 'BNB/USD',  name: 'BNB',         source: 'finnhub' },
    { symbol: 'BINANCE:XRPUSDT',  tdSymbol: null,       label: 'XRP/USD',  name: 'XRP',         source: 'finnhub' },
    { symbol: 'BINANCE:ADAUSDT',  tdSymbol: null,       label: 'ADA/USD',  name: 'Cardano',     source: 'finnhub' },
  ],
  stocks: [
    { symbol: 'AAPL',  tdSymbol: null, label: 'AAPL',  name: 'Apple Inc.',  source: 'finnhub' },
    { symbol: 'MSFT',  tdSymbol: null, label: 'MSFT',  name: 'Microsoft',   source: 'finnhub' },
    { symbol: 'TSLA',  tdSymbol: null, label: 'TSLA',  name: 'Tesla',       source: 'finnhub' },
    { symbol: 'GOOGL', tdSymbol: null, label: 'GOOGL', name: 'Alphabet',    source: 'finnhub' },
    { symbol: 'AMZN',  tdSymbol: null, label: 'AMZN',  name: 'Amazon',      source: 'finnhub' },
    { symbol: 'NVDA',  tdSymbol: null, label: 'NVDA',  name: 'NVIDIA',      source: 'finnhub' },
  ],
  // Forex — Twelve Data symbol format: "EUR/USD"
  forex: [
    { symbol: 'EUR/USD', tdSymbol: 'EUR/USD', label: 'EUR/USD', name: 'Euro / Dollar',   source: 'twelvedata' },
    { symbol: 'GBP/USD', tdSymbol: 'GBP/USD', label: 'GBP/USD', name: 'Pound / Dollar',  source: 'twelvedata' },
    { symbol: 'USD/JPY', tdSymbol: 'USD/JPY', label: 'USD/JPY', name: 'Dollar / Yen',    source: 'twelvedata' },
    { symbol: 'USD/CHF', tdSymbol: 'USD/CHF', label: 'USD/CHF', name: 'Dollar / Franc',  source: 'twelvedata' },
    { symbol: 'AUD/USD', tdSymbol: 'AUD/USD', label: 'AUD/USD', name: 'Aussie / Dollar', source: 'twelvedata' },
    { symbol: 'USD/CAD', tdSymbol: 'USD/CAD', label: 'USD/CAD', name: 'Dollar / CAD',    source: 'twelvedata' },
  ],
  // Indices — Twelve Data index symbols
  indices: [
    { symbol: 'SPX',   tdSymbol: 'SPX',   label: 'S&P 500', name: 'S&P 500 Index', source: 'twelvedata' },
    { symbol: 'IXIC',  tdSymbol: 'IXIC',  label: 'NASDAQ',  name: 'Nasdaq Composite', source: 'twelvedata' },
    { symbol: 'DJI',   tdSymbol: 'DJI',   label: 'DOW 30',  name: 'Dow Jones', source: 'twelvedata' },
    { symbol: 'FTSE',  tdSymbol: 'FTSE',  label: 'FTSE 100',name: 'FTSE 100', source: 'twelvedata' },
    { symbol: 'GDAXI', tdSymbol: 'GDAXI', label: 'DAX 40',  name: 'DAX 40', source: 'twelvedata' },
    { symbol: 'N225',  tdSymbol: 'N225',  label: 'Nikkei',  name: 'Nikkei 225', source: 'twelvedata' },
  ],
};

export const ALL_SYMBOLS        = Object.values(MARKET_SYMBOLS).flat();
export const FINNHUB_SYMBOLS    = ALL_SYMBOLS.filter(s => s.source === 'finnhub');
export const TWELVEDATA_SYMBOLS = ALL_SYMBOLS.filter(s => s.source === 'twelvedata');

// ─── Finnhub: initial REST quote ─────────────────────────────────────────────
export const fetchFinnhubQuote = async (symbol) => {
  const res = await fetch(`${FINNHUB_REST}/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`);
  if (!res.ok) throw new Error(`Finnhub quote failed for ${symbol}`);
  const d = await res.json();
  if (!d.c) throw new Error(`No data for ${symbol}`);
  return {
    symbol,
    price:         d.c,
    change:        d.d  ?? 0,
    changePercent: d.dp ?? 0,
    high:          d.h,
    low:           d.l,
    open:          d.o,
    prevClose:     d.pc,
    source:        'finnhub',
  };
};

// ─── Twelve Data: batch quote (up to 8 symbols per call on free tier) ─────────
// Returns { [tdSymbol]: quoteObject }
export const fetchTwelveDataBatch = async (symbols) => {
  if (!symbols.length) return {};
  // Join all symbols in one call — TD supports comma-separated
  const joined = symbols.map(s => s.tdSymbol).join(',');
  const url = `${TD_REST}/price?symbol=${encodeURIComponent(joined)}&apikey=${TWELVEDATA_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Twelve Data batch failed');
  const data = await res.json();

  // If only one symbol returned, TD wraps differently
  const results = {};
  symbols.forEach(({ symbol, tdSymbol }) => {
    try {
      // Multi-symbol response: data[tdSymbol].price
      // Single-symbol response: data.price
      const raw = symbols.length === 1 ? data : data[tdSymbol];
      if (!raw || raw.status === 'error') return;
      const price = parseFloat(raw.price);
      if (isNaN(price)) return;
      results[symbol] = { symbol, price, source: 'twelvedata' };
    } catch { /* skip */ }
  });
  return results;
};

// ─── Twelve Data: full quote with change% (uses /quote endpoint, 1 credit each) ─
export const fetchTwelveDataQuote = async ({ symbol, tdSymbol }) => {
  const url = `${TD_REST}/quote?symbol=${encodeURIComponent(tdSymbol)}&apikey=${TWELVEDATA_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TD quote failed for ${tdSymbol}`);
  const d = await res.json();
  if (d.status === 'error' || !d.close) throw new Error(d.message || 'No data');
  const price     = parseFloat(d.close);
  const prevClose = parseFloat(d.previous_close);
  const change    = price - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;
  return {
    symbol,
    price,
    change,
    changePercent: changePct,
    high:          parseFloat(d.high),
    low:           parseFloat(d.low),
    open:          parseFloat(d.open),
    prevClose,
    source:        'twelvedata',
  };
};

// ─── Load ALL initial quotes ──────────────────────────────────────────────────
// Finnhub symbols: batched in groups of 5 to stay under rate limit
// Twelve Data symbols: fetched with full /quote for change% data, 2 at a time
export const fetchAllInitialQuotes = async () => {
  const results = {};

  // — Finnhub batch (crypto + stocks) —
  const fChunks = chunkArray(FINNHUB_SYMBOLS, 5);
  for (const chunk of fChunks) {
    await Promise.all(chunk.map(async ({ symbol }) => {
      try { results[symbol] = await fetchFinnhubQuote(symbol); } catch { /* skip */ }
    }));
    await sleep(250);
  }

  // — Twelve Data (forex + indices) —
  // Use /quote for rich data; stay within 8 calls/min by batching with delay
  const tdChunks = chunkArray(TWELVEDATA_SYMBOLS, 2);
  for (const chunk of tdChunks) {
    await Promise.all(chunk.map(async (item) => {
      try { results[item.symbol] = await fetchTwelveDataQuote(item); } catch { /* skip */ }
    }));
    await sleep(8000 / tdChunks.length); // spread calls over ~8s to stay safe
  }

  return results;
};

// ─── Twelve Data polling (called every 30s for forex + indices) ───────────────
// Uses the lightweight /price endpoint to minimise credit usage
export const pollTwelveDataPrices = async () => {
  if (!TWELVEDATA_SYMBOLS.length) return {};
  try {
    return await fetchTwelveDataBatch(TWELVEDATA_SYMBOLS);
  } catch (err) {
    console.warn('[TwelveData poll]', err.message);
    return {};
  }
};

// ─── Finnhub WebSocket class ──────────────────────────────────────────────────
export class FinnhubWebSocket {
  constructor(onTrade, onError) {
    this.onTrade   = onTrade;
    this.onError   = onError;
    this.ws        = null;
    this.subscribedSymbols = new Set();
    this.reconnectTimer    = null;
    this.reconnectDelay    = 3000;
    this.maxReconnectDelay = 30000;
    this.intentionalClose  = false;
  }

  connect(symbols = []) {
    this.intentionalClose = false;
    this.ws = new WebSocket(FINNHUB_WS);

    this.ws.onopen = () => {
      console.log('[Finnhub WS] Connected');
      this.reconnectDelay = 3000;
      symbols.forEach(s => this.subscribe(s));
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'trade' && msg.data) {
          msg.data.forEach(trade => {
            this.onTrade({ symbol: trade.s, price: trade.p, volume: trade.v, timestamp: trade.t });
          });
        }
      } catch { /* ignore */ }
    };

    this.ws.onerror  = (err) => { this.onError?.(err); };
    this.ws.onclose  = () => {
      if (!this.intentionalClose) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
          this.connect([...this.subscribedSymbols]);
        }, this.reconnectDelay);
      }
    };
  }

  subscribe(symbol) {
    this.subscribedSymbols.add(symbol);
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
  }

  unsubscribe(symbol) {
    this.subscribedSymbols.delete(symbol);
    if (this.ws?.readyState === WebSocket.OPEN)
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
  }

  disconnect() {
    this.intentionalClose = true;
    clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────
export const formatPrice = (price, symbol) => {
  if (price == null || isNaN(price)) return '—';
  const isForexPair = /^[A-Z]{3}\/[A-Z]{3}$/.test(symbol);
  const isIndex     = ['SPX','IXIC','DJI','FTSE','GDAXI','N225'].includes(symbol);
  let decimals;
  if (isForexPair)     decimals = 4;
  else if (isIndex)    decimals = 2;
  else if (price > 1000) decimals = 2;
  else if (price > 1)  decimals = 3;
  else                 decimals = 6;
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// ─── Utilities ────────────────────────────────────────────────────────────────
const sleep      = (ms) => new Promise(r => setTimeout(r, ms));
const chunkArray = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};
