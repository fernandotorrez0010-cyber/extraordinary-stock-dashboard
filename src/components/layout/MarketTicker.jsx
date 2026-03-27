// src/components/layout/MarketTicker.jsx
import { useMarket } from '../../context/MarketContext';
import { MARKET_SYMBOLS, formatPrice } from '../../utils/marketDataService';
import { Zap, Clock } from 'lucide-react';

// 15 symbols spread across all four categories for the scrolling ticker
const TICKER_SYMBOLS = [
  ...MARKET_SYMBOLS.crypto.slice(0, 4),
  ...MARKET_SYMBOLS.stocks.slice(0, 4),
  ...MARKET_SYMBOLS.forex.slice(0, 4),
  ...MARKET_SYMBOLS.indices.slice(0, 3),
];

function TickerItem({ item, priceData }) {
  const price         = priceData?.price;
  const changePercent = priceData?.changePercent ?? 0;
  const flash         = priceData?.flash;
  const isUp          = changePercent >= 0;

  return (
    <span className={`inline-flex items-center gap-2 px-4 border-r border-slate-800/60 whitespace-nowrap transition-colors duration-300 ${
      flash === 'up' ? 'text-green-300' : flash === 'down' ? 'text-red-300' : ''
    }`}>
      <span className="text-slate-500 text-[10px] font-bold tracking-wide">{item.label}</span>
      <span className={`text-xs font-mono font-bold transition-colors duration-300 ${
        flash === 'up' ? 'text-green-400' : flash === 'down' ? 'text-red-400' : 'text-slate-200'
      }`}>
        {price != null ? formatPrice(price, item.symbol) : '···'}
      </span>
      {priceData && (
        <span className={`text-[10px] font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
        </span>
      )}
    </span>
  );
}

export default function MarketTicker() {
  const { prices, wsConnected, tdConnected, initialLoaded } = useMarket();

  return (
    <div className="h-8 bg-[#0a0c12] border-b border-slate-800/60 flex items-center overflow-hidden relative select-none">
      {/* Status indicators */}
      <div className="flex items-center gap-2 px-3 border-r border-slate-800/60 flex-shrink-0 h-full bg-[#0d1018]">
        {/* Finnhub WS dot */}
        <span title="Finnhub WebSocket (crypto + stocks)">
          <Zap size={10} className={wsConnected ? 'text-green-400' : 'text-slate-600'} />
        </span>
        {/* Twelve Data dot */}
        <span title="Twelve Data (forex + indices)">
          <Clock size={10} className={tdConnected ? 'text-yellow-400' : 'text-slate-600'} />
        </span>
        <span className="text-[9px] font-bold text-slate-600 tracking-widest hidden sm:block">MARKETS</span>
      </div>

      {/* Scrolling ticker */}
      {initialLoaded ? (
        <div className="flex-1 overflow-hidden">
          <div className="ticker-track flex items-center h-full">
            {/* Duplicate for seamless infinite loop */}
            {[...TICKER_SYMBOLS, ...TICKER_SYMBOLS].map((item, i) => (
              <TickerItem key={`${item.symbol}-${i}`} item={item} priceData={prices[item.symbol]} />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/60 animate-pulse" />
          <span className="text-[11px] text-slate-600">Loading market data…</span>
        </div>
      )}
    </div>
  );
}
