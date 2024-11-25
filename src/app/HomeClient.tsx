'use client';

import { useUser } from '@auth0/nextjs-auth0';
import StockForm from './components/StockForm';

type Top20Stock = {
  ticker: string;
  change_percentage: string;
}

interface HomeClientProps {
  top20: Top20Stock[];
}

export default function HomeClient({ top20 }: HomeClientProps) {

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center p-8">
        {/* redirect to logout */} 
        <a href="/auth/login">Logout</a>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Stock Analysis</h1>
          <p className="text-gray-600">Enter a stock symbol to analyze</p>
        </div>

        <StockForm />

        {top20 && top20.length > 0 && (
          <div className="mt-12 w-full max-w-4xl">
            <h2 className="text-2xl font-semibold text-center">Highest Volume Stocks</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">Note: if it fails it is likely that the stock does not have any data</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {top20.map((stock: any) => (
                <a
                  key={stock.ticker}
                  href={`/${stock.ticker}`}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-lg font-bold">{stock.ticker}</div>
                  <div className={`text-sm ${parseFloat(stock.change_percentage) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {parseFloat(stock.change_percentage) >= 0 ? '+' : ''}
                    {stock.change_percentage}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 