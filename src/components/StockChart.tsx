import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, RefreshCw } from 'lucide-react';
import { fetchTimeSeriesData } from '../services/stockApi';
import type { TimeSeriesData } from '../services/stockApi';

interface StockChartProps {
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<TimeSeriesData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadChartData = async (selectedTimeframe?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const interval = selectedTimeframe || timeframe;
      const intervalMap: { [key: string]: string } = {
        '1D': '60min',
        '1W': 'daily',
        '1M': 'daily',
        '3M': 'daily',
        '1Y': 'weekly',
        'ALL': 'monthly'
      };
      
      const data = await fetchTimeSeriesData(symbol, intervalMap[interval]);
      setChartData(data);
    } catch (err) {
      console.warn('Chart data loading issue:', err);
      // Don't set error state since the API service now provides fallback data
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [symbol]);

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    loadChartData(tf);
  };

  const handleRefresh = () => {
    loadChartData();
  };

  const maxPrice = Math.max(...chartData.map(d => d.close));
  const minPrice = Math.min(...chartData.map(d => d.close));

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Price Chart - {symbol}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-1 mb-6 bg-slate-700/30 rounded-lg p-1">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => handleTimeframeChange(tf)}
            disabled={isLoading}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              timeframe === tf
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-600/50 disabled:opacity-50'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="h-80 bg-slate-900/30 rounded-xl border border-slate-600/30 p-4 mb-4">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-slate-400 text-sm">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 text-sm mb-2">Failed to load chart data</p>
              <p className="text-slate-500 text-xs">{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="w-full h-full flex items-end justify-between space-x-1">
            {chartData.slice(-20).map((point, index) => {
              const height = maxPrice > minPrice ? ((point.close - minPrice) / (maxPrice - minPrice)) * 100 : 50;
              const isPositive = index === 0 || point.close >= chartData[chartData.indexOf(point) - 1]?.close;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div 
                    className={`w-full rounded-t-sm transition-all cursor-pointer ${
                      isPositive 
                        ? 'bg-gradient-to-t from-green-500 to-green-300 hover:from-green-400 hover:to-green-200' 
                        : 'bg-gradient-to-t from-red-500 to-red-300 hover:from-red-400 hover:to-red-200'
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${point.timestamp}: $${point.close.toFixed(2)}`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-slate-400 text-sm">No chart data available</p>
          </div>
        )}
      </div>

      {/* Chart Controls */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Volume: {chartData.length > 0 ? (chartData[chartData.length - 1]?.volume / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
        <span>Data Points: {chartData.length}</span>
        <span>Timeframe: {timeframe}</span>
      </div>
    </div>
  );
};

export default StockChart;