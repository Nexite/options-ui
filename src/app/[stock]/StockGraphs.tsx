'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useStockData } from '@/hooks/useStockData';
import { LoadingProgress } from '@/components/LoadingProgress';
import type { StockData, StockDataResponse } from '@/types/stock';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import React from 'react';

const StockChart = dynamic(() => import('./StockChart'), {
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center">Loading chart...</div>
});

function StockInfo({ data }: { data: StockData }) {
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
            const sortedContracts = [...contracts].sort((a, b) => b.annualizedRoi - a.annualizedRoi);
            const bestContract = sortedContracts[0];
            const nextBestContracts = sortedContracts.slice(1, 6);

            return (
              <React.Fragment key={percentage}>
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
                  <td className="p-4">${bestContract?.strike}</td>
                  <td className="p-4">${bestContract?.bid}</td>
                  <td className="p-4">${bestContract?.mark}</td>
                  <td className="p-4">${bestContract?.ask}</td>
                  <td className="p-4">{bestContract?.contractID}</td>
                  <td className="p-4">{bestContract?.expiration}</td>
                  <td className="p-4">{bestContract?.daysToExpire}</td>
                  <td className="p-4">{formatPercentage(bestContract?.roi)}</td>
                  <td className="p-4">{formatPercentage(bestContract?.annualizedRoi)}</td>
                </tr>
                {expandedRows[percentage] && nextBestContracts.map((contract, idx) => (
                  <tr 
                    key={`${percentage}-${contract.contractID}-${idx}`}
                    className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                  >
                    <td className="p-4 pl-8">↳</td>
                    <td className="p-4">${contract.strike}</td>
                    <td className="p-4">${contract.bid}</td>
                    <td className="p-4">${contract.mark}</td>
                    <td className="p-4">${contract.ask}</td>
                    <td className="p-4">{contract.contractID}</td>
                    <td className="p-4">{contract.expiration}</td>
                    <td className="p-4">{contract.daysToExpire}</td>
                    <td className="p-4">{formatPercentage(contract.roi)}</td>
                    <td className="p-4">{formatPercentage(contract.annualizedRoi)}</td>
                  </tr>
                ))}
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
  onLoadingChange?: (loading: boolean) => void;
  sharedMaxScale?: number;
  onMaxScaleChange?: (scale: number) => void;
}

export default function StockGraphs({ 
  stock, 
  minDays, 
  maxDays, 
  onLoadingChange,
  sharedMaxScale,
  onMaxScaleChange 
}: StockGraphsProps) {
  // 1. All useState hooks first
  const [displayDays, setDisplayDays] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // 2. Data fetching hook
  const { data, loading, error, dates } = useStockData({ 
    stock, 
    minDays, 
    maxDays 
  });

  // 3. All useEffect hooks
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(loading);
    }
  }, [loading, onLoadingChange]);

  useEffect(() => {
    if (dates.length > 0) {
      setDisplayDays(dates.length);
    }
  }, [dates.length]);

  useEffect(() => {
    if (!loading && dates.length > 0) {
      const allRois = Object.values(data).flatMap(dateData => 
        Object.values(dateData.percentages).flatMap(contracts => 
          contracts.map(contract => contract.annualizedRoi)
        )
      ).filter(roi => typeof roi === 'number' && !isNaN(roi));

      if (allRois.length > 0) {
        const maxRoi = Math.max(...allRois);
        const suggestedScale = maxRoi * 1.1;
        
        if (!sharedMaxScale || suggestedScale > sharedMaxScale) {
          onMaxScaleChange?.(suggestedScale);
        }
      }
    }
  }, [data, dates, loading, onMaxScaleChange, sharedMaxScale]);

  // Early returns
  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Error loading data: {error}
      </div>
    );
  }

  if (loading) {
    return <LoadingProgress />;
  }

  if (dates.length === 0) {
    return <div className="text-center p-4">No data available</div>;
  }

  // Calculate derived values
  const percentages = ['75', '80', '85', '90', '95'];
  const latestDate = dates[dates.length - 1];
  const actualDisplayDays = Math.min(displayDays, dates.length);

  return (
    <div className="flex flex-col w-full">
      <SummaryTable 
        data={data} 
        dates={dates} 
        expandedRows={expandedRows}
        setExpandedRows={setExpandedRows}
      />
      <div className="flex items-center justify-center gap-4 p-4 bg-white/[0.8] dark:bg-black/[0.8] rounded-lg shadow mb-4">
        <input
          type="range"
          min="7"
          max={dates.length}
          value={displayDays}
          onChange={(e) => setDisplayDays(Number(e.target.value))}
          className="w-48"
        />
        <span className="text-sm text-gray-600">
          {actualDisplayDays} days
        </span>
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