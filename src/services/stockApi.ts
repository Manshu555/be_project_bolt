const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

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
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('Invalid symbol or API limit reached');
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
    console.error('Error fetching stock quote:', error);
    throw error;
  }
};

export const fetchTimeSeriesData = async (symbol: string, interval: string = 'daily'): Promise<TimeSeriesData[]> => {
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
      throw new Error('No time series data available');
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
    console.error('Error fetching time series data:', error);
    throw error;
  }
};

export const searchStocks = async (query: string): Promise<StockData[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search stocks');
    }
    
    const data = await response.json();
    const matches = data.bestMatches || [];
    
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
    console.error('Error searching stocks:', error);
    throw error;
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