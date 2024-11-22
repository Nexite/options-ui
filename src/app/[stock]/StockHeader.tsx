'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface StockHeaderProps {
  initialStock: string;
}

export default function StockHeader({ initialStock }: StockHeaderProps) {
  const router = useRouter();
  const [symbol, setSymbol] = useState('');

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
            <h1 className="text-xl font-bold">
              {initialStock}
            </h1>
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
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