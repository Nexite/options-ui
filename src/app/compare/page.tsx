'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import StockGraphs from '../[stock]/StockGraphs';
import ClientWrapper from '../[stock]/ClientWrapper';
import { useStockData } from '@/hooks/useStockData';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

function StockOverviewDisplay({ 
  stock, 
  stockData 
}: { 
  stock: string;
  stockData: ReturnType<typeof useStockData>;
}) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-lg font-semibold">{stock.toUpperCase()}</h2>
      {stockData.loading && <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Loading...</span>}
      {stockData.error && <span className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">Error: {stockData.error}</span>}
      {stockData.stockOverview && (
        <div className="flex items-center gap-4">
          {stockData.stockOverview.price && (
            <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              ${stockData.stockOverview.price.toFixed(2)}
            </span>
          )}
          {stockData.stockOverview['52WeekHigh'] && (
            <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              52W High: ${stockData.stockOverview['52WeekHigh'].toFixed(2)}
            </span>
          )}
          {stockData.stockOverview['52WeekLow'] && (
            <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              52W Low: ${stockData.stockOverview['52WeekLow'].toFixed(2)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stocks, setStocks] = useState({
    stock1: searchParams.get('stock1') || '',
    stock2: searchParams.get('stock2') || ''
  });
  const [inputStocks, setInputStocks] = useState(stocks);
  const [scales, setScales] = useState<Record<'stock1' | 'stock2', number>>({
    stock1: 0,
    stock2: 0
  });

  // Add stock data hooks for both stocks
  const stock1Data = useStockData({ 
    stock: stocks.stock1, 
    minDays: 30, 
    maxDays: 365 
  });
  
  const stock2Data = useStockData({ 
    stock: stocks.stock2, 
    minDays: 30, 
    maxDays: 365 
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScales({ stock1: 0, stock2: 0 });
    setStocks(inputStocks);
  };

  const handleMaxScaleChange = useCallback((stockKey: 'stock1' | 'stock2', newScale: number) => {
    setScales(prev => ({
      ...prev,
      [stockKey]: newScale
    }));
  }, []);

  // Update URL when stocks change
  useEffect(() => {
    if (stocks.stock1 && stocks.stock2) {
      router.push(`/compare?stock1=${stocks.stock1.toUpperCase()}&stock2=${stocks.stock2.toUpperCase()}`);
    }
  }, [stocks, router]);

  // Calculate the shared max scale
  const sharedMaxScale = Math.max(scales.stock1, scales.stock2);

  // Add effect to update document title
  useEffect(() => {
    if (stocks.stock1 && stocks.stock2) {
      document.title = `${stocks.stock1.toUpperCase()}/${stocks.stock2.toUpperCase()} - Options Analysis`;
    } else {
      document.title = 'Compare Stocks - Options Analysis';
    }
  }, [stocks.stock1, stocks.stock2]);

  return (
    <>
      <Head>
        <title>
          {stocks.stock1 && stocks.stock2
            ? `${stocks.stock1.toUpperCase()}/${stocks.stock2.toUpperCase()} - Options Analysis`
            : 'Compare Stocks - Options Analysis'}
        </title>
        <link rel="preconnect" href="https://stocks.nikhilgarg.com" />
      </Head>
      <div className="min-h-screen">
        <header className="sticky top-0 bg-background z-10 border-b dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col py-4 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/')}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Go back"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <h1 className="text-xl font-bold">Compare Stocks</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputStocks.stock1}
                    onChange={(e) => setInputStocks(prev => ({ ...prev, stock1: e.target.value }))}
                    placeholder="First stock"
                    className="px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                  <input
                    type="text"
                    value={inputStocks.stock2}
                    onChange={(e) => setInputStocks(prev => ({ ...prev, stock2: e.target.value }))}
                    placeholder="Second stock"
                    className="px-3 py-1 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Compare
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {stocks.stock1 && (
                  <StockOverviewDisplay 
                    stock={stocks.stock1} 
                    stockData={stock1Data}
                  />
                )}
                {stocks.stock2 && (
                  <StockOverviewDisplay 
                    stock={stocks.stock2} 
                    stockData={stock2Data}
                  />
                )}
              </div>
            </div>
          </div>
        </header>
        
        {stocks.stock1 && stocks.stock2 ? (
          <main className="p-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ClientWrapper>
                <StockGraphs 
                  stock={stocks.stock1} 
                  minDays={30}
                  maxDays={365}
                  stockData={stock1Data}
                  sharedMaxScale={sharedMaxScale > 0 ? sharedMaxScale : undefined}
                  onMaxScaleChange={(scale) => handleMaxScaleChange('stock1', scale)}
                />
              </ClientWrapper>
              <ClientWrapper>
                <StockGraphs 
                  stock={stocks.stock2} 
                  minDays={30}
                  maxDays={365}
                  stockData={stock2Data}
                  sharedMaxScale={sharedMaxScale > 0 ? sharedMaxScale : undefined}
                  onMaxScaleChange={(scale) => handleMaxScaleChange('stock2', scale)}
                />
              </ClientWrapper>
            </div>
          </main>
        ) : (
          <div className="text-center p-8 text-gray-600">
            Enter two stock symbols to compare
          </div>
        )}
      </div>
    </>
  );
} 