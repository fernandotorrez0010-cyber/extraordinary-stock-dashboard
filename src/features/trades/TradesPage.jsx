// src/features/trades/TradesPage.jsx
import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown } from 'lucide-react';
import { subscribeTrades } from '../../firebase/firestoreService';
import { useMarket } from '../../context/MarketContext';
import { MARKET_SYMBOLS, formatPrice } from '../../utils/marketDataService';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { Badge, PageHeader, EmptyState } from '../../components/ui';

function LivePriceMini({ item }) {
  const { prices } = useMarket();
  const priceData = prices[item.symbol];
  const changePercent = priceData?.changePercent ?? 0;
  const isUp = changePercent >= 0;
  const flash = priceData?.flash;

  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-300 ${
      flash === 'up' ? 'bg-green-500/10' :
      flash === 'down' ? 'bg-red-500/10' :
      'hover:bg-slate-800/40'
    }`}>
      <div>
        <p className="text-sm font-bold text-slate-200">{item.label}</p>
        <p className="text-[10px] text-slate-500">{item.name}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-mono font-bold transition-colors duration-300 ${
          flash === 'up' ? 'text-green-400' :
          flash === 'down' ? 'text-red-400' :
          'text-slate-200'
        }`}>
          {priceData?.price ? formatPrice(priceData.price, item.symbol) : '···'}
        </p>
        <p className={`text-[10px] font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

export default function TradesPage() {
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState('all');
  const { connected } = useMarket();

  useEffect(() => {
    const unsub = subscribeTrades(setTrades);
    return unsub;
  }, []);

  const filtered = filter === 'all' ? trades : trades.filter(t => t.type === filter);
  const totalProfit = trades.reduce((s, t) => s + (t.profit || 0), 0);
  const wins = trades.filter(t => (t.profit || 0) > 0).length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;

  return (
    <div>
      <PageHeader title="Trade History" subtitle="All managed trades · Live market reference" />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Trades main section */}
        <div className="xl:col-span-3 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Trades', value: trades.length, textColor: 'text-blue-400' },
              { label: 'Total P&L', value: formatCurrency(totalProfit), textColor: totalProfit >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Win Rate', value: `${winRate}%`, textColor: 'text-purple-400' },
              { label: 'Buy / Sell', value: `${trades.filter(t => t.type === 'buy').length} / ${trades.filter(t => t.type === 'sell').length}`, textColor: 'text-slate-200' },
            ].map(({ label, value, textColor }) => (
              <div key={label} className="card p-4">
                <p className={`text-xl font-bold font-mono ${textColor}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl w-fit">
            {['all', 'buy', 'sell'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === f ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Trades list */}
          {filtered.length === 0 ? (
            <EmptyState icon={BarChart2} title="No trades found" description="Trades added by the admin will appear here." />
          ) : (
            <div className="space-y-3">
              {filtered.map(trade => (
                <div key={trade.id} className="card p-5 hover:border-slate-700 transition-all">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${trade.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        {trade.type === 'buy'
                          ? <TrendingUp size={20} className="text-green-400" />
                          : <TrendingDown size={20} className="text-red-400" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-100 text-lg">{trade.symbol}</span>
                          <Badge status={trade.type} />
                          <Badge status={trade.status} />
                        </div>
                        <p className="text-xs text-slate-500">{formatDateTime(trade.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold font-mono ${(trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(trade.profit || 0) >= 0 ? '+' : ''}{formatCurrency(trade.profit || 0)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">P&L</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {[
                      { label: 'Entry Price', value: formatCurrency(trade.entryPrice || 0) },
                      { label: 'Exit Price', value: formatCurrency(trade.exitPrice || 0) },
                      { label: 'Lot Size', value: trade.lotSize || '—' },
                      { label: 'Status', value: <Badge status={trade.status} /> },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-xl bg-slate-800/50">
                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                        <div className="text-sm font-semibold text-slate-200">{value}</div>
                      </div>
                    ))}
                  </div>

                  {trade.imageUrl && (
                    <img src={trade.imageUrl} alt="Trade chart"
                      className="mt-4 rounded-xl w-full max-h-48 object-cover border border-slate-800" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live prices sidebar */}
        <div className="xl:col-span-1">
          <div className="card p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-200 text-sm">Live Prices</h3>
              <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg border ${
                connected
                  ? 'text-green-400 bg-green-400/10 border-green-400/20'
                  : 'text-slate-500 bg-slate-800 border-slate-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                {connected ? 'LIVE' : '···'}
              </div>
            </div>

            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 px-1">Crypto</p>
            <div className="mb-3">
              {MARKET_SYMBOLS.crypto.slice(0, 3).map(item => (
                <LivePriceMini key={item.symbol} item={item} />
              ))}
            </div>

            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 px-1">Forex</p>
            <div className="mb-3">
              {MARKET_SYMBOLS.forex.slice(0, 3).map(item => (
                <LivePriceMini key={item.symbol} item={item} />
              ))}
            </div>

            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 px-1">Stocks</p>
            <div>
              {MARKET_SYMBOLS.stocks.slice(0, 3).map(item => (
                <LivePriceMini key={item.symbol} item={item} />
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <p className="text-[10px] text-slate-600 text-center">Powered by Finnhub.io</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
