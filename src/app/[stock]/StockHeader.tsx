'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { StockOverview } from '@/types/stock';

interface StockHeaderProps {
  initialStock: string;
  loading: boolean;
  error: string | null;
  stockOverview: StockOverview | null;
  minDays: number;
  maxDays: number;
}

export default function StockHeader({ initialStock, loading, error, stockOverview, minDays, maxDays }: StockHeaderProps) {
  const router = useRouter();
  const [symbol, setSymbol] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [settings, setSettings] = useState({
    minDays: minDays,
    maxDays: maxDays
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      router.push(`/${symbol.trim().toUpperCase()}?minDays=${settings.minDays}&maxDays=${settings.maxDays}`);
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

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  showAdvanced ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
                title="Advanced Settings"
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </button>

              {showAdvanced && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-4 z-20">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="headerMinDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Min Days
                      </label>
                      <input
                        type="number"
                        id="headerMinDays"
                        value={settings.minDays}
                        onChange={(e) => setSettings(prev => ({ ...prev, minDays: parseInt(e.target.value) }))}
                        min={1}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="headerMaxDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Max Days
                      </label>
                      <input
                        type="number"
                        id="headerMaxDays"
                        value={settings.maxDays}
                        onChange={(e) => setSettings(prev => ({ ...prev, maxDays: parseInt(e.target.value) }))}
                        min={1}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={symbol}
                onChange={(e) => {
                  // Only allow letters, numbers, periods, and hyphens, and transform to uppercase
                  const value = e.target.value.replace(/[^a-zA-Z0-9.-]/g, '').toUpperCase();
                  setSymbol(value);
                }}
                placeholder="Enter symbol"
                className="w-36 px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-700"
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
      </div>
    </header>
  );
} 