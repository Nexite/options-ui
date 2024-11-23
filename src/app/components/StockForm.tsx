'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function StockForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    minDays: '30',
    maxDays: '365'
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${formData.symbol}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div>
        <input
          ref={inputRef}
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
  );
} 