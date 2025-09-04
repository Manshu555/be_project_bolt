import React from 'react';
import { Eye, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import type { Stock } from './StockSearch';

interface WatchListProps {
  stocks: Stock[];
  onStockSelect: (stock: Stock) => void;
  selectedSymbol: string;
}

const WatchList: React.FC<WatchListProps> = ({ stocks, onStockSelect, selectedSymbol }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Eye className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Watch List</h3>
        </div>
        <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {stocks.map((stock) => {
          const isSelected = stock.symbol === selectedSymbol;
          const isPositive = stock.change >= 0;
          
          return (
            <button
              key={stock.symbol}
              onClick={() => onStockSelect(stock)}
              className={`w-full p-4 rounded-xl transition-all border ${
                isSelected 
                  ? 'bg-blue-500/20 border-blue-500/50' 
                  : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/60 hover:border-slate-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{stock.symbol}</span>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block truncate">{stock.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">${stock.price.toFixed(2)}</div>
                  <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Portfolio Summary */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Portfolio Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Total Value:</span>
            <span className="text-white ml-2 font-medium">
              ${stocks.reduce((acc, stock) => acc + stock.price, 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Day Change:</span>
            <span className={`ml-2 font-medium ${
              stocks.reduce((acc, stock) => acc + stock.change, 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {stocks.reduce((acc, stock) => acc + stock.change, 0) >= 0 ? '+' : ''}
              ${stocks.reduce((acc, stock) => acc + stock.change, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchList;