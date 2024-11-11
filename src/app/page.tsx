'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    symbol: '',
    minDays: '30',
    maxDays: '365'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${formData.symbol}?minDays=${formData.minDays}&maxDays=${formData.maxDays}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Stock Analysis</h1>
          <p className="text-gray-600">Enter a stock symbol to analyze</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <div>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
              placeholder="Enter stock symbol"
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-800"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Analyze Stock
            </button>
            <button
              type="button"
              onClick={() => router.push('/compare')}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Compare Stocks
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
