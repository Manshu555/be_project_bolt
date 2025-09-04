import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { searchStocks, fetchStockQuote } from '../services/stockApi';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
}

interface StockSearchProps {
  onStockSelect: (stock: Stock) => void;
}

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 2.34, changePercent: 1.3 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.34, change: -15.67, changePercent: -0.55 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 4.21, changePercent: 1.12 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3127.45, change: 23.67, changePercent: 0.76 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -8.93, changePercent: -3.47 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.23, change: 12.45, changePercent: 1.44 },
];

const StockSearch: React.FC<StockSearchProps> = ({ onStockSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [showResults, setShowResults] = useState(false);

  const displayStocks = showResults ? searchResults : popularStocks.filter(stock => 
    searchTerm === '' || 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await searchStocks(searchTerm);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to filtered popular stocks
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value === '') {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleStockClick = async (stock: Stock) => {
    try {
      // Fetch fresh data for the selected stock
      const freshData = await fetchStockQuote(stock.symbol);
      onStockSelect(freshData);
    } catch (error) {
      console.error('Failed to fetch fresh stock data:', error);
      // Fallback to existing data
      onStockSelect(stock);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Stock Search</h2>
      </div>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search stocks by symbol or name..."
            className={`w-full pl-11 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all ${
              isSearching ? 'animate-pulse' : ''
            }`}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </form>

      {showResults && searchResults.length === 0 && !isSearching && (
        <div className="text-center py-4 text-slate-400">
          No stocks found for "{searchTerm}"
        </div>
      )}

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {displayStocks.map((stock) => (
          <button
            key={stock.symbol}
            onClick={() => handleStockClick(stock)}
            className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/60 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">{stock.symbol}</span>
                  <span className="text-xs text-slate-400">{stock.name}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">${stock.price.toFixed(2)}</div>
                <div className={`text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {showResults && (
        <button
          onClick={() => {
            setShowResults(false);
            setSearchTerm('');
            setSearchResults([]);
          }}
          className="mt-4 w-full text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to popular stocks
        </button>
      )}
    </div>
  );
};

export default StockSearch;