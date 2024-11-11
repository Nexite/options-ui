'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StockGraphs from '../[stock]/StockGraphs';
import ClientWrapper from '../[stock]/ClientWrapper';

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stocks, setStocks] = useState({
    stock1: searchParams.get('stock1') || '',
    stock2: searchParams.get('stock2') || ''
  });
  const [inputStocks, setInputStocks] = useState(stocks);
  const [maxScale, setMaxScale] = useState<number>(0);
  const [scalesReceived, setScalesReceived] = useState({ stock1: false, stock2: false });

  // Update URL when stocks change
  useEffect(() => {
    if (stocks.stock1 && stocks.stock2) {
      router.push(`/compare?stock1=${stocks.stock1.toUpperCase()}&stock2=${stocks.stock2.toUpperCase()}`);
    }
  }, [stocks, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMaxScale(0);
    setScalesReceived({ stock1: false, stock2: false });
    setStocks(inputStocks);
  };

  const handleMaxScaleChange = (stockKey: 'stock1' | 'stock2', newScale: number) => {
    setScalesReceived(prev => ({ ...prev, [stockKey]: true }));
    setMaxScale(prev => Math.max(prev, newScale));
  };

  // Reset scales when stocks change
  useEffect(() => {
    setMaxScale(0);
    setScalesReceived({ stock1: false, stock2: false });
  }, [stocks.stock1, stocks.stock2]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold p-4 text-center">
          Compare Stocks
        </h1>
        <form onSubmit={handleSubmit} className="flex justify-center gap-4 p-4">
          <input
            type="text"
            value={inputStocks.stock1}
            onChange={(e) => setInputStocks(prev => ({ ...prev, stock1: e.target.value }))}
            placeholder="Enter first stock symbol"
            className="px-4 py-2 border rounded-md dark:bg-gray-800"
          />
          <input
            type="text"
            value={inputStocks.stock2}
            onChange={(e) => setInputStocks(prev => ({ ...prev, stock2: e.target.value }))}
            placeholder="Enter second stock symbol"
            className="px-4 py-2 border rounded-md dark:bg-gray-800"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Compare
          </button>
        </form>
      </header>
      
      {stocks.stock1 && stocks.stock2 ? (
        <main className="p-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h2 className="text-lg font-semibold p-4 text-center">{stocks.stock1.toUpperCase()}</h2>
              <ClientWrapper>
                <StockGraphs 
                  stock={stocks.stock1} 
                  minDays={30}
                  maxDays={365}
                  sharedMaxScale={scalesReceived.stock1 && scalesReceived.stock2 ? maxScale : undefined}
                  onMaxScaleChange={(scale) => handleMaxScaleChange('stock1', scale)}
                />
              </ClientWrapper>
            </div>
            <div>
              <h2 className="text-lg font-semibold p-4 text-center">{stocks.stock2.toUpperCase()}</h2>
              <ClientWrapper>
                <StockGraphs 
                  stock={stocks.stock2} 
                  minDays={30}
                  maxDays={365}
                  sharedMaxScale={scalesReceived.stock1 && scalesReceived.stock2 ? maxScale : undefined}
                  onMaxScaleChange={(scale) => handleMaxScaleChange('stock2', scale)}
                />
              </ClientWrapper>
            </div>
          </div>
        </main>
      ) : (
        <div className="text-center p-8 text-gray-600">
          Enter two stock symbols to compare
        </div>
      )}
    </div>
  );
} 