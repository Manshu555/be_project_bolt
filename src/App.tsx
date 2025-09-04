import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Brain, DollarSign, BarChart3, Search, Plus, Settings } from 'lucide-react';
import StockChart from './components/StockChart';
import AIPredictor from './components/AIPredictor';
import StockSearch from './components/StockSearch';
import WatchList from './components/WatchList';
import PredictionComparison from './components/PredictionComparison';
import StockOverview from './components/StockOverview';
import type { Stock } from './components/StockSearch';
import type { Prediction } from './components/AIPredictor';
import { fetchStockQuote } from './services/stockApi';

function App() {
  const [selectedStock, setSelectedStock] = useState<Stock>({
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.52,
    change: 2.34,
    changePercent: 1.3,
    high: 185.23,
    low: 180.15,
    volume: 45200000
  });
  
  const [watchList, setWatchList] = useState<Stock[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 2.34, changePercent: 1.3, high: 185.23, low: 180.15, volume: 45200000 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.34, change: -15.67, changePercent: -0.55, high: 2865.12, low: 2820.45, volume: 28500000 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 4.21, changePercent: 1.12, high: 382.15, low: 375.30, volume: 32100000 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -8.93, changePercent: -3.47, high: 255.67, low: 245.12, volume: 67800000 },
  ]);

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleStockSelect = async (stock: Stock) => {
    setSelectedStock(stock);
    
    // Update watchlist if the stock isn't already there
    const isInWatchList = watchList.some(w => w.symbol === stock.symbol);
    if (!isInWatchList) {
      try {
        const freshData = await fetchStockQuote(stock.symbol);
        setWatchList(prev => [freshData, ...prev.slice(0, 9)]); // Keep max 10 stocks
      } catch (error) {
        console.error('Failed to add to watchlist:', error);
      }
    }
  };

  // Load fresh data for selected stock on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const freshData = await fetchStockQuote(selectedStock.symbol);
        setSelectedStock(freshData);
      } catch (error) {
        console.error('Failed to load initial stock data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Stock Predictor</h1>
                <p className="text-sm text-slate-400">Multi-model analysis platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Stock Search & Overview */}
          <div className="lg:col-span-2 space-y-6">
            <StockSearch onStockSelect={handleStockSelect} />
            <StockOverview stock={selectedStock} />
          </div>
          
          {/* Watch List */}
          <div className="lg:col-span-1">
            <WatchList stocks={watchList} onStockSelect={handleStockSelect} selectedSymbol={selectedStock.symbol} />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Stock Chart */}
          <div className="xl:col-span-2">
            <StockChart symbol={selectedStock.symbol} />
          </div>
          
          {/* AI Predictions */}
          <div className="xl:col-span-1">
            <AIPredictor 
              stock={selectedStock} 
              onPredictionsUpdate={setPredictions}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>

        {/* Prediction Comparison */}
        <div className="mt-6">
          <PredictionComparison predictions={predictions} stock={selectedStock} />
        </div>
      </div>
    </div>
  );
}

export default App;