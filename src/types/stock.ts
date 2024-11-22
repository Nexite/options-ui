import { useStockData } from "@/hooks/useStockData";

// Core option data types
export interface BaseOptionContract {
  contractID: string;
  symbol: string;
  expiration: string;
  strike: string;
  type: 'put' | 'call';
  daysToExpire: number;
}

export interface MarketData {
  last: string;
  mark: string;
  bid: string;
  ask: string;
  bid_size: string;
  ask_size: string;
  volume: string;
  open_interest: string;
}

export interface Greeks {
  delta: string;
  gamma: string;
  theta: string;
  vega: string;
  rho: string;
  implied_volatility: string;
}

export interface ROIMetrics {
  roi: number;
  annualizedRoi: number;
}

// Combined option data
export type StockOptionData = BaseOptionContract & MarketData & Greeks & ROIMetrics & {
  date: string;
};

// Historical data types
export interface HistoricalQuote {
  date: string;
  price: number;
}

export interface HistoricalOption {
  date: string;
  puts: Array<{
    contractId: string;
    expiration: string;
    strike: number;
    ask: number;
    bid: number;
  }>;
}

export interface ProcessedOption {
  contractID: string;
  expiration: string;
  strike: number;
  ask: number;
  bid: number;
  mark: number;
  daysToExpire: number;
  roi: number;
  annualizedRoi: number;
}

// Response data structures
export interface StockPriceData {
  close: number;
  '52weekHigh'?: number;
  '52weekLow'?: number;
}

export interface DataByPercentage {
  [percentage: string]: StockOptionData[];
}

export interface DailyStockData extends StockPriceData {
  percentages: DataByPercentage;
}

export interface StockDataResponse {
  [date: string]: DailyStockData;
}

// Hook types
export interface StockDataHookProps {
  stock: string;
  minDays: number;
  maxDays: number;
}

export interface StockOverview {
  '52WeekHigh': number;
  '52WeekLow': number;
  price: number;
}

export interface StockDataHookState {
  data: StockDataResponse;
  stockOverview: StockOverview | null;
  loading: boolean;
  error: string | null;
  dates: string[];
}

// Chart types
export interface ChartDataPoint {
  date: string;
  roi: number;
  close: number;
  strike: number;
}

export interface ChartProps {
  percentage: string;
  dates: string[];
  data: StockDataResponse;
  displayDays: number;
  maxScale?: number;
}

export interface StockGraphsProps {
  stock: string;
  minDays: number;
  maxDays: number;
  stockData: ReturnType<typeof useStockData>;
  sharedMaxScale?: number;
  onMaxScaleChange?: (scale: number) => void;
} 