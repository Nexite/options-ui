'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { UTCDate } from '@date-fns/utc';

interface Option {
  contractId: string;
  strike: number;
  bid: number;
  ask: number;
  expiration: string;
}

interface ProcessedOption {
  strike: number;
  discount: number;
  annualizedRoi: number;
  daysToExpire: number;
  expiration: string;
  contractId: string;
  bid: number;
  ask: number;
  mark: number;
  roi: number;
}

interface GroupedOption {
  strike: number;
  discount: number;
  rois: { [key: string]: { 
    annualizedRoi: number;
    contractDetails: Omit<ProcessedOption, 'discount'>;
  }}; // expiration date -> ROI and contract details
}

function ContractPopover({ details }: { details: Omit<ProcessedOption, 'discount'> }) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 text-sm z-10 border border-gray-200 dark:border-gray-700">
      <div className="space-y-2">
        <div className="font-semibold border-b pb-1 mb-2">Contract Details</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="text-gray-500 dark:text-gray-400">Contract ID:</div>
          <div>{details.contractId}</div>
          <div className="text-gray-500 dark:text-gray-400">Strike:</div>
          <div>${details.strike.toFixed(2)}</div>
          <div className="text-gray-500 dark:text-gray-400">Bid:</div>
          <div>${details.bid.toFixed(2)}</div>
          <div className="text-gray-500 dark:text-gray-400">Ask:</div>
          <div>${details.ask.toFixed(2)}</div>
          <div className="text-gray-500 dark:text-gray-400">Mark:</div>
          <div>${details.mark.toFixed(2)}</div>
          <div className="text-gray-500 dark:text-gray-400">Days to Expire:</div>
          <div>{details.daysToExpire}</div>
          <div className="text-gray-500 dark:text-gray-400">ROI:</div>
          <div>{(details.roi * 100).toFixed(2)}%</div>
          <div className="text-gray-500 dark:text-gray-400">Annualized ROI:</div>
          <div>{(details.annualizedRoi * 100).toFixed(2)}%</div>
        </div>
      </div>
      {/* Arrow */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white dark:border-t-gray-800"></div>
    </div>
  );
}

function isAdjustedOption(contractId: string): boolean {
  // Option format: {ticker}{optional digit if adjusted}{6 digits for date}{option type}{strike price}
  // Example regular: AAPL240419P00150000
  // Example adjusted: AAPL1240419P00150000
  
  const tickerEnd = contractId.length - 15; // Remove date(6) + type(1) + strike(8)
  const ticker = contractId.slice(0, tickerEnd);
  
  // If ticker part contains any digits, it's an adjusted option
  return /\d/.test(ticker);
}

export default function TablePageClient({ symbol }: { symbol: string }) {
  const [groupedOptions, setGroupedOptions] = useState<GroupedOption[]>([]);
  const [expirationDates, setExpirationDates] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; date: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        
        // Fetch current stock price
        const quoteResponse = await fetch(
          `${API_BASE_URL}/historicalQuotes?symbol=${symbol}&days=0`
        );
        if (!quoteResponse.ok) throw new Error('Failed to fetch stock price');
        const quoteData = await quoteResponse.json();
        console.log('Quote data:', quoteData);
        const currentPrice = quoteData[0].price;
        setCurrentPrice(currentPrice);

        // Fetch options chain
        const optionsResponse = await fetch(
          `${API_BASE_URL}/historicalOptions?symbol=${symbol}&days=0`
        );
        if (!optionsResponse.ok) throw new Error('Failed to fetch options data');
        const optionsData = await optionsResponse.json();
        console.log('Options data:', optionsData);
        
        if (!optionsData[0]?.puts) {
          throw new Error('No options data available');
        }

        // Process options data
        const processedOptions = optionsData[0].puts
          .filter((option: Option) => !isAdjustedOption(option.contractId)) // Filter out adjusted options
          .map((option: Option) => {
            const discount = 1 - (option.strike / currentPrice);
            const expirationDate = new UTCDate(option.expiration);
            const currentDate = new UTCDate(quoteData[0].date);
            
            const daysToExpire = Math.ceil(
              (expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
            ) - 1;
            const mark = (option.ask + option.bid) / 2;
            const roi = option.bid / option.strike;
            const annualizedRoi = (roi * 365) / daysToExpire;

            console.log(`Processing option:`, {
              contractId: option.contractId,
              strike: option.strike,
              bid: option.bid,
              ask: option.ask,
              expiration: option.expiration,
              daysToExpire,
              roi,
              annualizedRoi,
              isNaN: isNaN(annualizedRoi),
              isFinite: isFinite(annualizedRoi),
              belowCurrentPrice: option.strike < currentPrice,
              isAdjusted: isAdjustedOption(option.contractId),
              currentPrice
            });

            return {
              strike: option.strike,
              discount,
              annualizedRoi,
              daysToExpire,
              expiration: option.expiration,
              contractId: option.contractId,
              bid: option.bid,
              ask: option.ask,
              mark,
              roi
            };
          })
          .filter((option: ProcessedOption) => {
            const isValid = !isNaN(option.annualizedRoi) && 
              isFinite(option.annualizedRoi) &&
              option.strike < currentPrice;
            
            if (!isValid) {
              console.log(`Filtered out option:`, {
                strike: option.strike,
                annualizedRoi: option.annualizedRoi,
                reason: {
                  isNaN: isNaN(option.annualizedRoi),
                  isNotFinite: !isFinite(option.annualizedRoi),
                  notBelowCurrentPrice: option.strike >= currentPrice
                }
              });
            }
            return isValid;
          });

        console.log('Processed options:', processedOptions);

        // Get unique expiration dates
        const uniqueDates = [...new Set(processedOptions.map((opt: ProcessedOption) => opt.expiration))];
        const dates = uniqueDates
          .map(date => date as string)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        console.log('Expiration dates:', dates);
        setExpirationDates(dates);

        // Group options by strike price
        const grouped = processedOptions.reduce((acc: GroupedOption[], curr: ProcessedOption) => {
          const existing = acc.find(g => g.strike === curr.strike);
          if (existing) {
            existing.rois[curr.expiration] = {
              annualizedRoi: curr.annualizedRoi,
              contractDetails: {
                strike: curr.strike,
                annualizedRoi: curr.annualizedRoi,
                daysToExpire: curr.daysToExpire,
                expiration: curr.expiration,
                contractId: curr.contractId,
                bid: curr.bid,
                ask: curr.ask,
                mark: curr.mark,
                roi: curr.roi
              }
            };
          } else {
            const rois: GroupedOption['rois'] = {};
            rois[curr.expiration] = {
              annualizedRoi: curr.annualizedRoi,
              contractDetails: {
                strike: curr.strike,
                annualizedRoi: curr.annualizedRoi,
                daysToExpire: curr.daysToExpire,
                expiration: curr.expiration,
                contractId: curr.contractId,
                bid: curr.bid,
                ask: curr.ask,
                mark: curr.mark,
                roi: curr.roi
              }
            };
            acc.push({
              strike: curr.strike,
              discount: curr.discount,
              rois
            });
          }
          return acc;
        }, []);

        console.log('Grouped options before sorting:', grouped);

        // Sort by discount ascending (lowest discount first, like in the image)
        const sortedGrouped = grouped.sort((a: GroupedOption, b: GroupedOption) => a.discount - b.discount);
        console.log('Sorted grouped options:', sortedGrouped);
        setGroupedOptions(sortedGrouped);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link 
              href={`/${symbol}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Analysis
            </Link>
            <h1 className="text-3xl font-bold mt-2">
              {symbol} Put Options Chain
            </h1>
            {currentPrice > 0 && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Current Price: ${currentPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-8">
              {error}
            </div>
          ) : groupedOptions.length === 0 ? (
            <div className="text-gray-500 text-center p-8">
              No eligible put options found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">
                      CURRENT PRICE (${currentPrice.toFixed(2)})
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-300">
                      Days
                    </th>
                    {expirationDates.map(date => {
                      
                      const daysToExpire = Math.ceil(
                        (new UTCDate(date).getTime() - new UTCDate().getTime()) / 
                        (1000 * 60 * 60 * 24)
                      ) - 1;
                      return (
                        <th key={date} className="px-4 py-2 text-center font-medium text-gray-500 dark:text-gray-300">
                          <div>{format(new Date(date), 'M/d/yy')}</div>
                          <div className="text-xs">{daysToExpire}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupedOptions.map((option, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {(option.discount * 100).toFixed(2)}%
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        ${option.strike.toFixed(2)}
                      </td>
                      {expirationDates.map(date => (
                        <td 
                          key={date} 
                          className="px-4 py-2 text-center text-sm relative group"
                          onMouseEnter={() => {
                            console.log('Mouse enter:', { row: index, date });
                            setHoveredCell({ row: index, date });
                          }}
                          onMouseLeave={() => {
                            console.log('Mouse leave');
                            setHoveredCell(null);
                          }}
                        >
                          {option.rois[date]?.annualizedRoi > 0 ? (
                            <>
                              <span className="cursor-help">
                                {(option.rois[date].annualizedRoi * 100).toFixed(2)}%
                              </span>
                              {hoveredCell?.row === index && hoveredCell?.date === date && (
                                <ContractPopover details={option.rois[date].contractDetails} />
                              )}
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 