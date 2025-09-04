import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockOverviewProps {
  stock: Stock;
}

const StockOverview: React.FC<StockOverviewProps> = ({ stock }) => {
  const isPositive = stock.change >= 0;
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{stock.symbol}</h2>
          <p className="text-slate-400">{stock.name}</p>
        </div>
        <div className={`p-3 rounded-xl ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          {isPositive ? (
            <TrendingUp className="w-6 h-6 text-green-400" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-400" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Current Price</span>
          </div>
          <div className="text-xl font-bold text-white">${stock.price.toFixed(2)}</div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Change</span>
          </div>
          <div className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Change %</span>
          </div>
          <div className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">Volume</span>
          </div>
          <div className="text-xl font-bold text-white">24.5M</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-slate-400">Day High:</span>
          <span className="text-white ml-2 font-medium">${(stock.price + 5.23).toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400">Day Low:</span>
          <span className="text-white ml-2 font-medium">${(stock.price - 3.17).toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400">52W High:</span>
          <span className="text-white ml-2 font-medium">${(stock.price * 1.2).toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400">52W Low:</span>
          <span className="text-white ml-2 font-medium">${(stock.price * 0.8).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default StockOverview;