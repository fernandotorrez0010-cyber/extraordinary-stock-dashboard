// src/context/MarketContext.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Manages live market data from two sources:
//   • Finnhub WebSocket  → crypto + stocks  (real-time ticks)
//   • Twelve Data REST   → forex + indices  (polled every 30 seconds)
//
// All consumers just call useMarket() — the source routing is invisible.
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  FinnhubWebSocket,
  fetchAllInitialQuotes,
  pollTwelveDataPrices,
  FINNHUB_SYMBOLS,
  formatPrice,
} from '../utils/marketDataService';

const MarketContext = createContext(null);

// How often to re-poll Twelve Data (forex + indices), in ms.
// 30s is a good balance: feels "live" but stays well within 800 calls/day.
const TD_POLL_INTERVAL = 30_000;

export const MarketProvider = ({ children }) => {
  // prices: { [symbol]: { price, change, changePercent, high, low, prevClose, flash, source } }
  const [prices,        setPrices       ] = useState({});
  const [wsConnected,   setWsConnected  ] = useState(false);   // Finnhub WS status
  const [tdConnected,   setTdConnected  ] = useState(false);   // Twelve Data poll status
  const [initialLoaded, setInitialLoaded] = useState(false);
  const wsRef        = useRef(null);
  const tdTimerRef   = useRef(null);
  const flashTimers  = useRef({});

  // ── Helper: flash a symbol briefly on price change ──────────────────────────
  const triggerFlash = useCallback((symbol, direction) => {
    setPrices(prev => ({
      ...prev,
      [symbol]: prev[symbol] ? { ...prev[symbol], flash: direction } : prev[symbol],
    }));
    clearTimeout(flashTimers.current[symbol]);
    flashTimers.current[symbol] = setTimeout(() => {
      setPrices(prev => ({
        ...prev,
        [symbol]: prev[symbol] ? { ...prev[symbol], flash: null } : prev[symbol],
      }));
    }, 800);
  }, []);

  // ── Helper: merge incoming price data into state ────────────────────────────
  const mergePrice = useCallback((symbol, incoming) => {
    setPrices(prev => {
      const existing = prev[symbol];
      // Compute direction for flash
      const prevPrice = existing?.price;
      const newPrice  = incoming.price;
      const direction = prevPrice != null && newPrice !== prevPrice
        ? (newPrice > prevPrice ? 'up' : 'down')
        : null;

      const merged = existing
        ? { ...existing, ...incoming, flash: direction }
        : { ...incoming, flash: direction };
      if (direction) {
        // schedule flash clear
        clearTimeout(flashTimers.current[symbol]);
        flashTimers.current[symbol] = setTimeout(() => {
          setPrices(p => ({
            ...p,
            [symbol]: p[symbol] ? { ...p[symbol], flash: null } : p[symbol],
          }));
        }, 800);
      }
      return { ...prev, [symbol]: merged };
    });
  }, []);

  // ── 1. Initial load: REST quotes from both sources ──────────────────────────
  useEffect(() => {
    fetchAllInitialQuotes()
      .then(quotes => {
        setPrices(quotes);
        setInitialLoaded(true);
        // If TD returned anything, mark it as connected
        const hasTD = Object.values(quotes).some(q => q.source === 'twelvedata');
        if (hasTD) setTdConnected(true);
      })
      .catch(err => {
        console.error('[MarketContext] Initial load error:', err);
        setInitialLoaded(true); // still show page even if data partially failed
      });
  }, []);

  // ── 2. Finnhub WebSocket (crypto + stocks) ──────────────────────────────────
  useEffect(() => {
    const finnhubSymbols = FINNHUB_SYMBOLS.map(s => s.symbol);

    const ws = new FinnhubWebSocket(
      ({ symbol, price }) => {
        mergePrice(symbol, {
          symbol, price,
          // keep existing change/changePercent from REST; update on tick
          source: 'finnhub',
        });
        setWsConnected(true);
      },
      (err) => {
        console.error('[Finnhub WS]', err);
        setWsConnected(false);
      }
    );

    ws.connect(finnhubSymbols);
    wsRef.current = ws;

    return () => {
      ws.disconnect();
    };
  }, [mergePrice]);

  // ── 3. Twelve Data polling (forex + indices, every 30 seconds) ──────────────
  useEffect(() => {
    const poll = async () => {
      try {
        const updates = await pollTwelveDataPrices();
        if (Object.keys(updates).length > 0) {
          setTdConnected(true);
          Object.entries(updates).forEach(([symbol, data]) => {
            mergePrice(symbol, data);
          });
        }
      } catch (err) {
        console.warn('[TwelveData poll]', err.message);
        setTdConnected(false);
      }
    };

    // Start polling after initial load (slight delay to not compete with REST burst)
    const startTimer = setTimeout(() => {
      poll(); // immediate first poll after delay
      tdTimerRef.current = setInterval(poll, TD_POLL_INTERVAL);
    }, 5000);

    return () => {
      clearTimeout(startTimer);
      clearInterval(tdTimerRef.current);
      Object.values(flashTimers.current).forEach(clearTimeout);
    };
  }, [mergePrice]);

  // ── Convenience accessors ───────────────────────────────────────────────────
  const getPrice = useCallback(
    (symbol) => prices[symbol] || null,
    [prices]
  );

  const getFormattedPrice = useCallback(
    (symbol) => {
      const p = prices[symbol];
      return p?.price != null ? formatPrice(p.price, symbol) : '—';
    },
    [prices]
  );

  // Overall "connected" — true if either source is live
  const connected = wsConnected || tdConnected;

  return (
    <MarketContext.Provider value={{
      prices,
      connected,
      wsConnected,
      tdConnected,
      initialLoaded,
      getPrice,
      getFormattedPrice,
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
