import { useState, useEffect, useRef } from 'react';
import type {
  StockDataHookProps,
  StockDataHookState,
  HistoricalQuote,
  HistoricalOption,
} from '@/types/stock';
import { processQuotesAndOptions } from './utils/processQuotesAndOptions';
import { fetchHistoricalData, BATCH_SIZE } from './utils/fetchHistoricalData';
import { fetchStockOverview } from './utils/fetchStockOverview';

// Cache management
const requestCache = new Set<string>();
const dataCache = new Map<string, Promise<[HistoricalQuote[], HistoricalOption[]]>>();

export function useStockData({ stock, minDays, maxDays }: StockDataHookProps) {
  const [state, setState] = useState<Omit<StockDataHookState, 'loadingProgress'>>({
    data: {},
    stockOverview: null,
    loading: true,
    error: null,
    dates: [],
  });
  const [loadedDays, setLoadedDays] = useState(0);
  const prevStockRef = useRef(stock);

  // Reset state when stock changes
  useEffect(() => {
    if (prevStockRef.current !== stock) {
      setLoadedDays(0);
      requestCache.clear();
      clearStockCache(prevStockRef.current);
      prevStockRef.current = stock;
    }
  }, [stock]);

  // Fetch data effect
  useEffect(() => {
    const fetchBatch = async () => {
      const requestKey = `${stock}-${loadedDays}-${minDays}-${maxDays}`;
      
      if (requestCache.has(requestKey)) return;
      
      setState(prev => ({ ...prev, loading: true }));
      requestCache.add(requestKey);
      
      try {
        const [quotes, options] = await fetchHistoricalData(stock, loadedDays);
        const newData = processQuotesAndOptions(quotes, options, loadedDays === 0, minDays, maxDays, stock);
        let overview = state.stockOverview;
        if (overview === null) {
          const stockOverview = await fetchStockOverview(stock);
          console.log('Raw stock overview:', stockOverview);
          
          overview = {
            '52WeekHigh': Number(stockOverview['52WeekHigh']),
            '52WeekLow': Number(stockOverview['52WeekLow']),
            Name: stockOverview.Name,
            price: quotes[0].price
          };
          console.log('Processed overview:', overview);
        }
        setState(prev => ({
          data: { ...prev.data, ...newData },
          stockOverview: overview,
          dates: Object.keys({ ...prev.data, ...newData }).sort(),
          loading: false,
          error: null
        }));
      } catch (err) {
        handleFetchError(requestKey, err, setState);
      }
    };

    if (loadedDays < maxDays) {
      fetchBatch();
    }
  }, [stock, loadedDays, maxDays, minDays]);

  const loadMoreData = () => {
    if (loadedDays < maxDays) {
      setLoadedDays(prev => prev + BATCH_SIZE);
    }
  };

  return {
    ...state,
    loadMoreData
  } as const;
}// Helper functions
function clearStockCache(stock: string) {
  for (const key of dataCache.keys()) {
    if (key.startsWith(`${stock}-`)) {
      dataCache.delete(key);
    }
  }
}

function handleFetchError(
  requestKey: string, 
  err: unknown, 
  setState: React.Dispatch<React.SetStateAction<Omit<StockDataHookState, 'loadingProgress'>>>
) {
  requestCache.delete(requestKey);
  setState(prev => ({
    ...prev,
    error: err instanceof Error ? err.message : 'An error occurred',
    loading: false,
  }));
}

