// Base option contract data
export interface OptionContract {
  contractID: string;
  symbol: string;
  expiration: string;
  strike: string;
  type: 'put' | 'call';
  daysToExpire: number;
}

// Market data for an option
export interface OptionMarketData {
  last: string;
  mark: string;
  bid: string;
  bid_size: string;
  ask: string;
  ask_size: string;
  volume: string;
  open_interest: string;
}

// Greeks data
export interface OptionGreeks {
  delta: string;
  gamma: string;
  theta: string;
  vega: string;
  rho: string;
  implied_volatility: string;
}

// ROI calculations
export interface OptionROI {
  roi: number;
  annualizedRoi: number;
}

// Complete option data combining all interfaces
export interface StockData extends 
  OptionContract, 
  OptionMarketData, 
  OptionGreeks, 
  OptionROI {
  date: string;
}

// Stock price data
export interface StockPriceData {
  close: number;
  '52weekHigh'?: number;
  '52weekLow'?: number;
}

// Options grouped by strike percentage
export interface DataByPercentage {
  [percentage: string]: StockData[];
}

// Daily stock data including options
export interface DailyStockData extends StockPriceData {
  percentages: DataByPercentage;
}

// Complete response structure
export interface StockDataResponse {
  [date: string]: DailyStockData;
}

// API response for historical data
export interface HistoricalOptionData {
  date: string;
  close: number;
  options: DataByPercentage;
}

export interface HistoricalAPIResponse {
  options: HistoricalOptionData[];
}

// Hook props and state
export interface StockDataHookProps {
  stock: string;
  minDays: number;
  maxDays: number;
}

export interface StockDataHookState {
  data: StockDataResponse;
  loading: boolean;
  loadingProgress: number;
  error: string | null;
  dates: string[];
} 