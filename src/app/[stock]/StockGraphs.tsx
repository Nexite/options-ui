'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useStockData } from '@/hooks/useStockData';
import { LoadingProgress } from '@/components/LoadingProgress';
import type { StockOptionData, StockDataResponse } from '@/types/stock';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const StockChart = dynamic(() => import('./StockChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center">Loading chart...</div>
});

function StockInfo({ data }: { data: StockOptionData }) {
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="text-sm space-y-1">
      <p>Strike: ${data.strike}</p>
      <p>Contract: {data.contractID}</p>
      <p>Expiration: {data.expiration}</p>
      <p>Days to Expire: {data.daysToExpire}</p>
      <p>ROI: {formatPercentage(data.roi)}</p>
      <p>Annualized ROI: {formatPercentage(data.annualizedRoi)}</p>
    </div>
  );
}

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

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatPrice = (value: string | number | undefined) => {
    if (value === undefined) return 'N/A';
    return `$${Number(value).toFixed(2)}`;
  };

  const toggleRow = (percentage: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [percentage]: !prev[percentage]
    }));
  };

  return (
    <div className="overflow-x-auto bg-white/[0.8] dark:bg-black/[0.8] rounded-lg shadow mb-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b dark:border-gray-700">
            <th className="text-left p-4">Strike %</th>
            <th className="text-left p-4">Strike Price</th>
            <th className="text-left p-4">Bid Price</th>
            <th className="text-left p-4">Market Price</th>
            <th className="text-left p-4">Ask Price</th>
            <th className="text-left p-4">Contract</th>
            <th className="text-left p-4">Expiration</th>
            <th className="text-left p-4">Days to Expire</th>
            <th className="text-left p-4">ROI</th>
            <th className="text-left p-4">Annualized ROI</th>
          </tr>
        </thead>
        <tbody>
          {percentages.map((percentage) => {
            const contracts = data[latestDate]?.percentages[percentage] || [];
            const bestContract = [...contracts].sort((a, b) => b.annualizedRoi - a.annualizedRoi)[0];
            const nextBestContracts = contracts.slice(1);

            return (
              <React.Fragment key={percentage}>
                {bestContract && (
                  <tr 
                    className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
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
                    <td className="p-4">{formatPrice(bestContract.mark)}</td>
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
                      className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-b dark:border-gray-700/50"
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
  );
}

interface StockGraphsProps {
  stock: string;
  minDays: number;
  maxDays: number;
  sharedMaxScale?: number;  
  onMaxScaleChange?: (scale: number) => void;
}

export default function StockGraphs({ 
  stock, 
  minDays, 
  maxDays, 
  sharedMaxScale,
}: StockGraphsProps) {
  const [displayDays, setDisplayDays] = useState(minDays || 30);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, loading, error, dates, loadMoreData } = useStockData({ 
    stock, 
    minDays, 
    maxDays 
  });

  useEffect(() => {
    setDisplayDays(minDays || 30);
  }, [stock, minDays]);

  useEffect(() => {
    if (!loading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [loading]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    loadMoreData();
  };

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading data: {error}
      </div>
    );
  }

  if (loading && !isLoadingMore) {
    return <LoadingProgress />;
  }

  if (dates.length === 0) {
    return <div className="text-center p-4">No data available</div>;
  }

  const percentages = ['75', '80', '85', '90', '95'];
  const latestDate = dates[dates.length - 1];
  const actualDisplayDays = Math.min(displayDays || minDays, dates.length);

  return (
    <div className="flex flex-col w-full relative">
      {isLoadingMore && <LoadingOverlay />}
      <SummaryTable 
        data={data} 
        dates={dates} 
        expandedRows={expandedRows}
        setExpandedRows={setExpandedRows}
      />
      <div className="flex items-center justify-center gap-4 p-4 bg-white/[0.8] dark:bg-black/[0.8] rounded-lg shadow mb-4">
        <input
          type="range"
          min={Math.min(7, dates.length)}
          max={dates.length}
          value={displayDays}
          onChange={(e) => setDisplayDays(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm text-gray-600">
          {actualDisplayDays} days
        </span>
        <button
          onClick={handleLoadMore}
          disabled={isLoadingMore || dates.length >= maxDays}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Load More
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {percentages.map((percentage) => {
          const contracts = data[latestDate]?.percentages[percentage] || [];
          const bestContract = [...contracts].sort((a, b) => b.annualizedRoi - a.annualizedRoi)[0];
          return (
            <div key={percentage} className="bg-white/[0.8] dark:bg-black/[0.8] rounded-lg shadow w-full">
              <div className="flex justify-between items-start p-3">
                <h2 className="text-lg font-semibold">{percentage}% Strike</h2>
                {bestContract && <StockInfo data={bestContract} />}
              </div>
              <div className="h-[400px] w-full">
                <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
                  <StockChart
                    percentage={percentage}
                    dates={dates}
                    data={data}
                    displayDays={actualDisplayDays}
                    maxScale={sharedMaxScale}
                  />
                </Suspense>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 