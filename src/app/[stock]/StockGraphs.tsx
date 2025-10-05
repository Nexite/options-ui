'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingProgress } from '@/components/LoadingProgress';
import type { StockOptionData, StockDataResponse } from '@/types/stock';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useStockData } from '@/hooks/useStockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StockChart = dynamic(() => import('./StockChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center">Loading chart...</div>
});

/**
 * StockInfo component displays key information about a stock option
 * Shows strike price, contract details, expiration, and ROI metrics
 */
function StockInfo({ data }: { data: StockOptionData }) {
  /**
   * Formats a decimal value as a percentage with 2 decimal places
   * @param value - The decimal value to format (e.g., 0.15 for 15%)
   * @returns Formatted percentage string or 'N/A' if undefined
   */
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Strike</p>
          <p className="text-foreground font-semibold">${data.strike}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Contract</p>
          <p className="text-foreground font-mono text-xs">{data.contractID}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Expiration</p>
          <p className="text-foreground">{data.expiration}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Days to Expire</p>
          <p className="text-foreground font-semibold">{data.daysToExpire}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">ROI</p>
          <p className="text-foreground font-semibold">{formatPercentage(data.roi)}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Annualized ROI</p>
          <p className="text-foreground font-semibold">{formatPercentage(data.annualizedRoi)}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * SummaryTable component displays a comprehensive table of stock options
 * Shows the best contract for each strike percentage with expandable rows for additional contracts
 */
function SummaryTable({ 
  data, 
  dates,
  expandedRows,
  setExpandedRows
}: { 
  data: StockDataResponse; 
  dates: string[];
  expandedRows: Record<string, boolean>;
  setExpandedRows: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  const latestDate = dates[dates.length - 1];
  const percentages = ['75', '80', '85', '90', '95'];

  /**
   * Formats a decimal value as a percentage with 2 decimal places
   * @param value - The decimal value to format (e.g., 0.15 for 15%)
   * @returns Formatted percentage string or 'N/A' if undefined
   */
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  /**
   * Formats a numeric value as a currency string
   * @param value - The value to format as currency
   * @returns Formatted currency string or 'N/A' if undefined
   */
  const formatPrice = (value: string | number | undefined) => {
    if (value === undefined) return 'N/A';
    return `$${Number(value).toFixed(2)}`;
  };

  /**
   * Toggles the expanded state of a table row
   * @param percentage - The strike percentage to toggle
   */
  const toggleRow = (percentage: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [percentage]: !prev[percentage]
    }));
  };

  return (
    <Card className="mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium">Strike %</th>
              <th className="text-left p-4 font-medium">Strike Price</th>
              <th className="text-left p-4 font-medium">Bid Price</th>
              <th className="text-left p-4 font-medium">Market Price</th>
              <th className="text-left p-4 font-medium">Ask Price</th>
              <th className="text-left p-4 font-medium">Contract</th>
              <th className="text-left p-4 font-medium">Expiration</th>
              <th className="text-left p-4 font-medium">Days to Expire</th>
              <th className="text-left p-4 font-medium">ROI</th>
              <th className="text-left p-4 font-medium">Annualized ROI</th>
            </tr>
          </thead>
          <tbody>
            {percentages.map((percentage) => {
              const contracts = data[latestDate]?.percentages[percentage] || [];
              const bestContract = [...contracts].sort((a, b) => b.annualizedRoi - a.annualizedRoi)[0];
              const nextBestContracts = contracts.slice(1);
              if (bestContract === undefined) {
                console.log(data[latestDate]?.percentages[percentage])
              }
              return (
                <React.Fragment key={percentage}>
                  {bestContract && (
                    <tr 
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => toggleRow(percentage)}
                    >
                      <td className="p-4 flex items-center gap-2">
                        {percentage}%
                        {expandedRows[percentage] ? 
                          <ChevronUpIcon className="h-4 w-4" /> : 
                          <ChevronDownIcon className="h-4 w-4" />
                        }
                      </td>
                      <td className="p-4">{formatPrice(bestContract.strike)}</td>
                      <td className="p-4">{formatPrice(bestContract.bid)}</td>
                      <td className="p-4">{formatPrice(((Number(bestContract.bid) + Number(bestContract.ask)) / 2)) || 'N/A'}</td>
                      <td className="p-4">{formatPrice(bestContract.ask)}</td>
                      <td className="p-4">{bestContract.contractID}</td>
                      <td className="p-4">{bestContract.expiration}</td>
                      <td className="p-4">{bestContract.daysToExpire}</td>
                      <td className="p-4">{formatPercentage(bestContract.roi)}</td>
                      <td className="p-4">{formatPercentage(bestContract.annualizedRoi)}</td>
                    </tr>
                  )}
                  {expandedRows[percentage] && nextBestContracts.length > 0 && (
                    nextBestContracts.map((contract, idx) => (
                      <tr 
                        key={`${percentage}-${contract.contractID}-${idx}`}
                        className="bg-muted/30 text-muted-foreground border-b"
                      >
                        <td className="p-4 pl-8">↳</td>
                        <td className="p-4">{formatPrice(contract.strike)}</td>
                        <td className="p-4">{formatPrice(contract.bid)}</td>
                        <td className="p-4">{formatPrice(contract.mark)}</td>
                        <td className="p-4">{formatPrice(contract.ask)}</td>
                        <td className="p-4">{contract.contractID}</td>
                        <td className="p-4">{contract.expiration}</td>
                        <td className="p-4">{contract.daysToExpire}</td>
                        <td className="p-4">{formatPercentage(contract.roi)}</td>
                        <td className="p-4">{formatPercentage(contract.annualizedRoi)}</td>
                      </tr>
                    ))
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface StockGraphsProps {
  stock: string;
  stockData: ReturnType<typeof useStockData>;
  sharedMaxScale?: number;
  onMaxScaleChange?: (scale: number) => void;
}

/**
 * StockGraphs component displays comprehensive stock analysis with charts and data tables
 * Features interactive charts for different strike percentages and a summary table
 * Supports shared scaling across multiple instances for comparison views
 */
export default function StockGraphs({ 
  stock, 
  stockData,
  sharedMaxScale,
  onMaxScaleChange 
}: StockGraphsProps) {
  const [displayDays, setDisplayDays] = useState(30);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset display days when stock changes
  useEffect(() => {
    setDisplayDays(30);
  }, [stock]);

  // Handle loading state when loading more data
  useEffect(() => {
    if (!stockData.loading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [stockData.loading]);

  // Calculate and notify parent of maximum ROI scale for shared scaling
  useEffect(() => {
    if (onMaxScaleChange && stockData.dates.length > 0 && !stockData.loading) {
      const latestDate = stockData.dates[stockData.dates.length - 1];
      const allRois = Object.values(stockData.data[latestDate]?.percentages || {})
        .flat()
        .map(contract => contract.annualizedRoi);
      
      if (allRois.length > 0) {
        const maxRoi = Math.max(...allRois, 0);
        onMaxScaleChange(maxRoi);
      }
    }
  }, [stockData.dates.length, stockData.loading]);

  /**
   * Handles loading more historical data
   */
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    stockData.loadMoreData();
  };

  if (stockData.error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading data: {stockData.error}
      </div>
    );
  }

  if (stockData.loading && !isLoadingMore) {
    return <LoadingProgress />;
  }

  if (stockData.dates.length === 0) {
    return <div className="text-center p-4">No data available</div>;
  }

  const percentages = ['75', '80', '85', '90', '95'];
  const latestDate = stockData.dates[stockData.dates.length - 1];
  const actualDisplayDays = Math.min(displayDays, stockData.dates.length);

  return (
    <div className="flex flex-col w-full relative">
      {isLoadingMore && <LoadingOverlay />}
      <SummaryTable 
        data={stockData.data} 
        dates={stockData.dates} 
        expandedRows={expandedRows}
        setExpandedRows={setExpandedRows}
      />
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={Math.min(7, stockData.dates.length)}
                max={stockData.dates.length}
                value={displayDays}
                onChange={(e) => setDisplayDays(Number(e.target.value))}
                className="w-48"
                aria-label="Display days"
              />
              <span className="text-sm text-muted-foreground">
                {actualDisplayDays} days
              </span>
            </div>
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              size="sm"
            >
              Load More
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        {percentages.map((percentage) => {
          const contracts = stockData.data[latestDate]?.percentages[percentage] || [];
          const bestContract = [...contracts].sort((a, b) => b.annualizedRoi - a.annualizedRoi)[0];
          
          // Calculate average ROI for this percentage across all dates
          const averageRoi = stockData.dates.reduce((sum, date) => {
            const dayContracts = stockData.data[date]?.percentages[percentage] || [];
            const dayBestContract = dayContracts[0];
            return sum + (dayBestContract?.annualizedRoi || 0);
          }, 0) / stockData.dates.length;
          
          return (
            <Card key={percentage} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center gap-8">
                  <CardTitle className="text-xl font-bold">{percentage}% Strike</CardTitle>
                  {bestContract && (
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Avg ROI</p>
                        <p className="font-semibold">{(averageRoi * 100).toFixed(2)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Current ROI</p>
                        <p className={`font-semibold ${
                          bestContract.annualizedRoi >= averageRoi 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {(bestContract.annualizedRoi * 100).toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground text-xs">Strike</p>
                        <p className="font-semibold">${bestContract.strike}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] w-full">
                  <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
                    <StockChart
                      percentage={percentage}
                      dates={stockData.dates}
                      data={stockData.data}
                      displayDays={actualDisplayDays}
                      maxScale={sharedMaxScale}
                    />
                  </Suspense>
                </div>
                {bestContract && (
                  <div className="p-4 border-t">
                    <StockInfo data={bestContract} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 