import { useState, useEffect } from 'react';
import type { StockDataResponse, StockDataHookProps, StockDataHookState } from '@/types/stock';

const MAX_DAYS_TO_FETCH = 100;

export function useStockData({ stock, minDays, maxDays }: StockDataHookProps): Omit<StockDataHookState, 'loadingProgress'> {
  const [state, setState] = useState<Omit<StockDataHookState, 'loadingProgress'>>({
    data: {},
    loading: true,
    error: null,
    dates: [],
  });

  useEffect(() => {
    const fetchStockData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await fetch(
          `/api/stocks/historical?symbol=${stock}&days=${MAX_DAYS_TO_FETCH}&minDays=${minDays}&maxDays=${maxDays}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const { options } = await response.json();
        
        if (!options.length) {
          throw new Error('No data available');
        }

        const formattedData: StockDataResponse = {};
        options.forEach((dayData: { date: string; close: number; options: any }) => {
          formattedData[dayData.date] = {
            close: dayData.close,
            percentages: dayData.options
          };
        });

        const dates = options.map((day: { date: string }) => day.date).sort();
        
        setState(prev => ({
          ...prev,
          data: formattedData,
          dates,
          loading: false,
        }));
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'An error occurred',
          loading: false,
        }));
      }
    };

    fetchStockData();
  }, [stock, minDays, maxDays]);

  return state;
}