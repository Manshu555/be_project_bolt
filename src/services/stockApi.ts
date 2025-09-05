const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Mock data for fallback when API is unavailable
const mockStockData: { [key: string]: StockData } = {
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.52,
    change: 2.34,
    changePercent: 1.3,
    high: 185.23,
    low: 180.15,
    volume: 45200000
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 2847.34,
    change: -15.67,
    changePercent: -0.55,
    high: 2865.12,
    low: 2820.45,
    volume: 28500000
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: 4.21,
    changePercent: 1.12,
    high: 382.15,
    low: 375.30,
    volume: 32100000
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.42,
    change: -8.93,
    changePercent: -3.47,
    high: 255.67,
    low: 245.12,
    volume: 67800000
  }
};

const generateMockTimeSeriesData = (symbol: string, days: number = 30): TimeSeriesData[] => {
  const basePrice = mockStockData[symbol]?.price || 100;
  const data: TimeSeriesData[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const price = basePrice * (1 + variation);
    const dailyVariation = price * 0.02; // 2% daily range
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      open: price - dailyVariation * Math.random(),
      high: price + dailyVariation * Math.random(),
      low: price - dailyVariation * Math.random(),
      close: price,
      volume: Math.floor(Math.random() * 50000000) + 10000000
    });
  }
  
  return data;
};

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: string;
  peRatio?: number;
}

export interface TimeSeriesData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const fetchStockQuote = async (symbol: string): Promise<StockData> => {
  // Check if API key is available and not demo
  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'demo') {
    console.warn('Using mock data - Alpha Vantage API key not configured');
    const mockData = mockStockData[symbol];
    if (mockData) {
      return mockData;
    }
    throw new Error('Stock symbol not found in mock data');
  }

  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0 || data['Error Message'] || data['Note']) {
      console.warn('API limit reached or invalid response, falling back to mock data');
      const mockData = mockStockData[symbol];
      if (mockData) {
        return mockData;
      }
      throw new Error('API limit reached and no mock data available for this symbol');
    }
    
    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    
    return {
      symbol: quote['01. symbol'],
      name: await getCompanyName(symbol),
      price,
      change,
      changePercent,
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume'])
    };
  } catch (error) {
    console.warn('Error fetching stock quote, trying mock data:', error);
    const mockData = mockStockData[symbol];
    if (mockData) {
      return mockData;
    }
    throw new Error(`Failed to fetch data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const fetchTimeSeriesData = async (symbol: string, interval: string = 'daily'): Promise<TimeSeriesData[]> => {
  // Check if API key is available and not demo
  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'demo') {
    console.warn('Using mock time series data - Alpha Vantage API key not configured');
    return generateMockTimeSeriesData(symbol);
  }

  try {
    const functionMap = {
      '1min': 'TIME_SERIES_INTRADAY',
      '5min': 'TIME_SERIES_INTRADAY',
      '15min': 'TIME_SERIES_INTRADAY',
      '30min': 'TIME_SERIES_INTRADAY',
      '60min': 'TIME_SERIES_INTRADAY',
      'daily': 'TIME_SERIES_DAILY',
      'weekly': 'TIME_SERIES_WEEKLY',
      'monthly': 'TIME_SERIES_MONTHLY'
    };
    
    const func = functionMap[interval as keyof typeof functionMap] || 'TIME_SERIES_DAILY';
    let url = `${BASE_URL}?function=${func}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    if (func === 'TIME_SERIES_INTRADAY') {
      url += `&interval=${interval}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch time series data');
    }
    
    const data = await response.json();
    
    if (data['Error Message'] || data['Note']) {
      console.warn('API limit reached or error, falling back to mock data');
      return generateMockTimeSeriesData(symbol);
    }
    
    let timeSeries;
    if (func === 'TIME_SERIES_INTRADAY') {
      timeSeries = data[`Time Series (${interval})`];
    } else if (func === 'TIME_SERIES_DAILY') {
      timeSeries = data['Time Series (Daily)'];
    } else if (func === 'TIME_SERIES_WEEKLY') {
      timeSeries = data['Weekly Time Series'];
    } else {
      timeSeries = data['Monthly Time Series'];
    }
    
    if (!timeSeries) {
      console.warn('No time series data from API, using mock data');
      return generateMockTimeSeriesData(symbol);
    }
    
    return Object.entries(timeSeries)
      .slice(0, 100) // Limit to last 100 data points
      .map(([timestamp, values]: [string, any]) => ({
        timestamp,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }))
      .reverse(); // Chronological order
  } catch (error) {
    console.warn('Error fetching time series data, using mock data:', error);
    return generateMockTimeSeriesData(symbol);
  }
};

export const searchStocks = async (query: string): Promise<StockData[]> => {
  // If no API key, search in mock data
  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'demo') {
    const results = Object.values(mockStockData).filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
    return results;
  }

  try {
    const response = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search stocks');
    }
    
    const data = await response.json();
    const matches = data.bestMatches || [];
    
    if (data['Error Message'] || data['Note'] || matches.length === 0) {
      // Fallback to mock data search
      const results = Object.values(mockStockData).filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
      return results;
    }
    
    // Get quotes for top 5 matches
    const stockPromises = matches.slice(0, 5).map(async (match: any) => {
      try {
        return await fetchStockQuote(match['1. symbol']);
      } catch {
        return null;
      }
    });
    
    const stocks = await Promise.all(stockPromises);
    return stocks.filter(stock => stock !== null) as StockData[];
  } catch (error) {
    console.warn('Error searching stocks, using mock data:', error);
    const results = Object.values(mockStockData).filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
    return results;
  }
};

const getCompanyName = async (symbol: string): Promise<string> => {
  // Fallback company names for common symbols
  const companyNames: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'AMD': 'Advanced Micro Devices Inc.',
    'INTC': 'Intel Corporation'
  };
  
  return companyNames[symbol] || `${symbol} Corporation`;
};