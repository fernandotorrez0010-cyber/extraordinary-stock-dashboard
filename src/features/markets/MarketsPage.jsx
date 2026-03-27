// src/features/markets/MarketsPage.jsx
import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Zap, Clock } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { MARKET_SYMBOLS, formatPrice } from '../../utils/marketDataService';
import { PageHeader } from '../../components/ui';

const TABS = [
  { key: 'all',     label: 'All Markets' },
  { key: 'crypto',  label: 'Crypto' },
  { key: 'stocks',  label: 'Stocks' },
  { key: 'forex',   label: 'Forex' },
  { key: 'indices', label: 'Indices' },
];

const CATEGORY_META = {
  crypto:  { label: 'Cryptocurrencies', color: 'text-orange-400 bg-orange-400/10',  border: 'border-orange-400/20',  source: 'finnhub',    sourceLabel: 'Real-time' },
  stocks:  { label: 'Stocks',           color: 'text-blue-400 bg-blue-400/10',      border: 'border-blue-400/20',    source: 'finnhub',    sourceLabel: 'Real-time' },
  forex:   { label: 'Forex Pairs',      color: 'text-purple-400 bg-purple-400/10',  border: 'border-purple-400/20',  source: 'twelvedata', sourceLabel: '~30s delay' },
  indices: { label: 'Indices',          color: 'text-green-400 bg-green-400/10',    border: 'border-green-400/20',   source: 'twelvedata', sourceLabel: '~30s delay' },
};

function SourcePill({ source }) {
  const isLive = source === 'finnhub';
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
      isLive
        ? 'text-green-400 bg-green-400/10 border-green-400/20'
        : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    }`}>
      {isLive ? <Zap size={8} /> : <Clock size={8} />}
      {isLive ? 'LIVE' : '~30s'}
    </span>
  );
}

function PriceCard({ item, priceData, category }) {
  const price         = priceData?.price;
  const changePercent = priceData?.changePercent ?? 0;
  const change        = priceData?.change ?? 0;
  const high          = priceData?.high;
  const low           = priceData?.low;
  const flash         = priceData?.flash;
  const isUp          = changePercent >= 0;
  const meta          = CATEGORY_META[category];

  return (
    <div className={`card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 ${
      flash === 'up'   ? 'border-green-500/40 bg-green-500/[0.03]' :
      flash === 'down' ? 'border-red-500/40   bg-red-500/[0.03]'   : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${meta.color} border ${meta.border}`}>
              {category.toUpperCase()}
            </span>
            <SourcePill source={meta.source} />
          </div>
          <p className="font-bold text-slate-100 mt-0.5">{item.label}</p>
          <p className="text-xs text-slate-500 leading-none">{item.name}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
          isUp ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
        }`}>
          {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isUp ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>

      {/* Price */}
      <div className={`text-2xl font-bold font-mono mb-2 transition-colors duration-300 ${
        flash === 'up'   ? 'text-green-400' :
        flash === 'down' ? 'text-red-400'   :
        'text-slate-100'
      }`}>
        {price != null
          ? formatPrice(price, item.symbol)
          : <span className="text-slate-600 text-lg animate-pulse">Loading…</span>
        }
      </div>

      {/* Change */}
      {change !== 0 && (
        <p className={`text-xs font-semibold font-mono mb-3 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{formatPrice(Math.abs(change), item.symbol)} today
        </p>
      )}

      {/* High / Low range bar */}
      {high && low && price && high !== low && (
        <div>
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>L {formatPrice(low, item.symbol)}</span>
            <span>H {formatPrice(high, item.symbol)}</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(2, ((price - low) / (high - low)) * 100))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, symbols, prices }) {
  const meta = CATEGORY_META[category];
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${meta.color} border ${meta.border}`}>
          {meta.label.toUpperCase()}
        </span>
        <span className="text-xs text-slate-600">via {meta.source === 'finnhub' ? 'Finnhub WebSocket' : 'Twelve Data REST'}</span>
        <div className="h-px flex-1 bg-slate-800/60" />
        <SourcePill source={meta.source} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {symbols.map(item => (
          <PriceCard
            key={item.symbol}
            item={item}
            priceData={prices[item.symbol]}
            category={category}
          />
        ))}
      </div>
    </div>
  );
}

export default function MarketsPage() {
  const { prices, wsConnected, tdConnected, initialLoaded } = useMarket();
  const [tab, setTab] = useState('all');

  const allPriceValues = Object.values(prices);
  const gainers = allPriceValues.filter(p => (p.changePercent ?? 0) >= 0).length;
  const losers  = allPriceValues.filter(p => (p.changePercent ?? 0) <  0).length;
  const loaded  = allPriceValues.length;

  return (
    <div>
      <PageHeader
        title="Live Markets"
        subtitle="Crypto & stocks via Finnhub · Forex & indices via Twelve Data"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Finnhub status */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
              wsConnected
                ? 'text-green-400 bg-green-400/10 border-green-400/20'
                : 'text-slate-500 bg-slate-800 border-slate-700'
            }`}>
              <Zap size={11} />
              <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
              Finnhub {wsConnected ? 'Live' : 'Connecting'}
            </div>
            {/* Twelve Data status */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${
              tdConnected
                ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                : 'text-slate-500 bg-slate-800 border-slate-700'
            }`}>
              <Clock size={11} />
              <span className={`w-1.5 h-1.5 rounded-full ${tdConnected ? 'bg-yellow-400' : 'bg-slate-600'}`} />
              Twelve Data {tdConnected ? '~30s' : 'Connecting'}
            </div>
          </div>
        }
      />

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Gainers',         value: gainers, Icon: TrendingUp,   color: 'text-green-400 bg-green-400/10' },
          { label: 'Losers',          value: losers,  Icon: TrendingDown, color: 'text-red-400 bg-red-400/10' },
          { label: 'Symbols Loaded',  value: loaded,  Icon: Activity,    color: 'text-blue-400 bg-blue-400/10' },
          { label: 'Data Sources',    value: '2',     Icon: RefreshCw,   color: 'text-purple-400 bg-purple-400/10' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${color}`}><Icon size={16} /></div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="font-bold text-slate-200">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab filter */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-xl w-fit mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Finnhub WebSocket — crypto &amp; stocks update on every trade tick
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          Twelve Data REST — forex &amp; indices refresh every 30 seconds
        </span>
      </div>

      {!initialLoaded ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-green-500 animate-spin" />
          <p className="text-sm text-slate-500">Fetching market data from both sources…</p>
          <p className="text-xs text-slate-600">Twelve Data may take a few extra seconds on first load</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(tab === 'all' || tab === 'crypto') && (
            <CategorySection category="crypto"  symbols={MARKET_SYMBOLS.crypto}  prices={prices} />
          )}
          {(tab === 'all' || tab === 'stocks') && (
            <CategorySection category="stocks"  symbols={MARKET_SYMBOLS.stocks}  prices={prices} />
          )}
          {(tab === 'all' || tab === 'forex') && (
            <CategorySection category="forex"   symbols={MARKET_SYMBOLS.forex}   prices={prices} />
          )}
          {(tab === 'all' || tab === 'indices') && (
            <CategorySection category="indices" symbols={MARKET_SYMBOLS.indices} prices={prices} />
          )}
        </div>
      )}
    </div>
  );
}
