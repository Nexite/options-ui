import { useState, useEffect } from 'react';
import type { StockDataResponse, StockDataHookProps, StockDataHookState } from '@/types/stock';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
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
          `${API_BASE_URL}/customStrategyHistorical?` + 
          new URLSearchParams({
            username: 'nikhil',
            symbol: stock,
            days: String(MAX_DAYS_TO_FETCH),
            minDays: String(minDays),
            maxDays: String(maxDays)
          })
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const { options } = await response.json();
        
        if (!options?.length) {
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