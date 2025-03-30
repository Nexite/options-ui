'use client';

import { useStockData } from '@/hooks/useStockData';
import StockHeader from './StockHeader';
import StockGraphs from './StockGraphs';
import Link from 'next/link';
import { TableCellsIcon } from '@heroicons/react/24/outline';

interface StockPageClientProps {
  stock: string;
  minDays: number;
  maxDays: number;
}

export default function StockPageClient({ stock, minDays, maxDays }: StockPageClientProps) {
  const stockData = useStockData({ stock, minDays, maxDays });

  return (
    <div className="min-h-screen">
      <StockHeader 
        stockOverview={stockData.stockOverview}
        initialStock={stock} 
        loading={stockData.loading}
        error={stockData.error}
        minDays={minDays}
        maxDays={maxDays}
      />
      <main className="p-2">
        <div className="space-y-8">
          <StockGraphs 
            stock={stock}
            stockData={stockData}
          />
          <div className="flex justify-center">
            <Link
              href={`/table/${stock}`}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <TableCellsIcon className="h-5 w-5 mr-2" />
              View Options Table
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 