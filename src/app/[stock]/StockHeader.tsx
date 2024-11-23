'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StockOverview } from '@/types/stock';

interface StockHeaderProps {
  initialStock: string;
  loading: boolean;
  error: string | null;
  stockOverview: StockOverview | null;
}

export default function StockHeader({ initialStock, loading, error, stockOverview }: StockHeaderProps) {
  const router = useRouter();
  const [symbol, setSymbol] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      router.push(`/${symbol.trim().toUpperCase()}`);
    }
  };

  return (
    <header className="sticky top-0 bg-background z-10 border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">
                {initialStock} {stockOverview && stockOverview.Name && `(${stockOverview.Name})`}
              </h1>
              {loading && <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Loading...</span>}
              {error && <span className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">Error: {error}</span>}
              {stockOverview && (
                <div className="flex items-center gap-4">
                  {stockOverview.price && (
                    <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      ${stockOverview.price.toFixed(2)}
                    </span>
                  )}
                  {stockOverview['52WeekHigh'] && (
                    <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      52W High: ${stockOverview['52WeekHigh'].toFixed(2)}
                    </span>
                  )}
                  {stockOverview['52WeekLow'] && (
                    <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      52W Low: ${stockOverview['52WeekLow'].toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter symbol"
              className="px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
            <button
              type="submit"
              className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </header>
  );
} 