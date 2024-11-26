'use client';

import { useStockData } from '@/hooks/useStockData';
import StockHeader from './StockHeader';
import StockGraphs from './StockGraphs';

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
        <StockGraphs 
          stock={stock}
          stockData={stockData}
        />
      </main>
    </div>
  );
} 