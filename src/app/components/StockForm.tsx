'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function StockForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    minDays: '30',
    maxDays: '365'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${formData.symbol}?minDays=${formData.minDays}&maxDays=${formData.maxDays}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={formData.symbol}
          onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
          placeholder="Enter stock symbol"
          className="w-full px-4 py-2 border rounded-md dark:bg-gray-800"
        />
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${showAdvanced ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          title="Advanced Settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>

        {showAdvanced && (
          <div className="
            absolute z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-4
            md:left-[calc(100%+1rem)] md:top-0 md:w-72
            w-full mt-2 
            mobile-settings-open:mb-4
          ">
            <div className="space-y-4 md:space-y-4">
              <div>
                <label htmlFor="minDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Min Expiration Days
                </label>
                <input
                  type="number"
                  id="minDays"
                  name="minDays"
                  value={formData.minDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, minDays: e.target.value }))}
                  min={1}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
              </div>
              <div>
                <label htmlFor="maxDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Expiration Days
                </label>
                <input
                  type="number"
                  id="maxDays"
                  name="maxDays"
                  value={formData.maxDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxDays: e.target.value }))}
                  min={1}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className={`flex gap-4 transition-all ${showAdvanced ? 'mt-32 md:mt-4' : ''}`}>
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