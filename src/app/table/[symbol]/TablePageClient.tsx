'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import { TZDate } from "@date-fns/tz"
import AuthButton from '@/components/AuthButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';

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

/**
 * ContractPopover component displays detailed information about a specific option contract
 * Shows when hovering over ROI values in the options table
 * @param details - The contract details to display
 * @param position - Whether to show above or below the trigger element
 */
function ContractPopover({ details, position = 'top' }: { details: Omit<ProcessedOption, 'discount'>, position?: 'top' | 'bottom' }) {
  const mark = (details.bid + details.ask) / 2;
  
  return (
    <div className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 w-[24rem] bg-popover shadow-xl rounded-lg p-4 text-sm z-50 border backdrop-blur-sm`}>
      <div className="space-y-3">
        <div className="font-semibold border-b pb-2 mb-3 flex justify-between items-center">
          <span className="text-base text-popover-foreground">Contract Details</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Click to copy ID</span>
        </div>
        <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-2">
          <div className="text-muted-foreground whitespace-nowrap text-right">Contract ID:</div>
          <div className="whitespace-nowrap font-mono text-left bg-muted px-2 py-1 rounded text-popover-foreground">{details.contractId}</div>
          <div className="text-muted-foreground text-right">Strike:</div>
          <div className="text-left font-medium text-popover-foreground">${details.strike.toFixed(2)}</div>
          <div className="text-muted-foreground text-right">Bid:</div>
          <div className="text-left font-medium text-popover-foreground">${details.bid.toFixed(2)}</div>
          <div className="text-muted-foreground text-right">Ask:</div>
          <div className="text-left font-medium text-popover-foreground">${details.ask.toFixed(2)}</div>
          <div className="text-muted-foreground text-right">Mark:</div>
          <div className="text-left font-medium text-popover-foreground">${mark.toFixed(2)}</div>
          <div className="text-muted-foreground text-right">Days to Expire:</div>
          <div className="text-left font-medium text-popover-foreground">{details.daysToExpire}</div>
          <div className="text-muted-foreground text-right">ROI:</div>
          <div className="text-left font-medium text-green-600 dark:text-green-400">{(details.roi * 100).toFixed(2)}%</div>
          <div className="text-muted-foreground text-right">Annualized ROI:</div>
          <div className="text-left font-medium text-blue-600 dark:text-blue-400">{(details.annualizedRoi * 100).toFixed(2)}%</div>
        </div>
      </div>
      {/* Arrow */}
      <div className={`absolute ${position === 'top' ? 'bottom-0 translate-y-full border-t-8 border-t-popover' : 'top-0 -translate-y-full border-b-8 border-b-popover'} left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent`}></div>
    </div>
  );
}

/**
 * Determines if an option contract is an adjusted option
 * Adjusted options have digits in the ticker portion of the contract ID
 * @param contractId - The contract ID to check
 * @returns True if the option is adjusted, false otherwise
 */
function isAdjustedOption(contractId: string): boolean {
  // Option format: {ticker}{optional digit if adjusted}{6 digits for date}{option type}{strike price}
  // Example regular: AAPL240419P00150000
  // Example adjusted: AAPL1240419P00150000
  
  const tickerEnd = contractId.length - 15; // Remove date(6) + type(1) + strike(8)
  const ticker = contractId.slice(0, tickerEnd);
  
  // If ticker part contains any digits, it's an adjusted option
  return /\d/.test(ticker);
}

/**
 * TablePageClient component displays a comprehensive options chain table
 * Shows put options organized by strike price and expiration date
 * Features interactive hover details and contract ID copying
 */
export default function TablePageClient({ symbol }: { symbol: string }) {
  const [groupedOptions, setGroupedOptions] = useState<GroupedOption[]>([]);
  const [expirationDates, setExpirationDates] = useState<string[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; date: string } | null>(null);

  // Add keyboard event listener for closing hover details
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHoveredCell(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Handles copying contract ID to clipboard
   * @param contractId - The contract ID to copy
   * @param event - The mouse event to prevent bubbling
   */
  const handleCopy = async (contractId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent event bubbling
    try {
      await navigator.clipboard.writeText(contractId);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        
        // Fetch current stock price
        const quoteResponse = await fetch(
          `${API_BASE_URL}/latestQuote?symbol=${symbol}`
        );
        if (!quoteResponse.ok) throw new Error('Failed to fetch stock price');
        const quoteData = await quoteResponse.json();
        console.log('Quote data:', quoteData);
        const currentPrice = quoteData.price;
        setCurrentPrice(currentPrice);

        // Fetch options chain
        const optionsResponse = await fetch(
          `${API_BASE_URL}/latestOptions?symbol=${symbol}`
        );
        if (!optionsResponse.ok) throw new Error('Failed to fetch options data');
        const optionsData = await optionsResponse.json();
        console.log('Options data:', optionsData);
        
        if (!optionsData.puts) {
          throw new Error('No options data available');
        }

        // Process options data
        const processedOptions = optionsData.puts
          .filter((option: Option) => !isAdjustedOption(option.contractId)) // Filter out adjusted options
          .map((option: Option) => {
            const discount = 1 - (option.strike / currentPrice);
            const expirationDate = new UTCDate(option.expiration);
            const currentDate = new UTCDate(quoteData.date);
            
            const daysToExpire = Math.ceil(
              (expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) - 1
            );
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

        // Sort by discount ascending (lowest discount first)
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
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="bg-background shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-semibold text-foreground">
                Options Analyzer
              </Link>
              <AuthButton />
            </div>
          </div>
        </header>
        <div className="flex-1">
          <div className="max-w-[95rem] mx-auto px-3 py-4">
            <div className="mb-4">
              <Link 
                href={`/${symbol}`}
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors text-sm"
              >
                <ArrowLeftIcon className="h-3 w-3 mr-1" />
                Back to Analysis
              </Link>
              <div className="mt-2 flex flex-row items-center justify-between gap-4">
                <div className="flex items-baseline gap-4">
                  <h1 className="text-2xl font-bold text-foreground">
                    {symbol} Put Options Chain
                  </h1>
                  {currentPrice > 0 && (
                    <p className="text-base text-muted-foreground">
                      Current Price: <span className="font-semibold text-foreground">${currentPrice.toFixed(2)}</span>
                    </p>
                  )}
                </div>
                {currentPrice > 0 && (
                  <div className="flex items-center gap-6 bg-card px-4 py-2 rounded-lg border">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Options</p>
                      <p className="text-base font-semibold text-foreground">{groupedOptions.length}</p>
                    </div>
                    <div className="border-l pl-6">
                      <p className="text-xs text-muted-foreground">Expiration Dates</p>
                      <p className="text-base font-semibold text-foreground">{expirationDates.length}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

        <Card>
          {loading ? (
            <div className="flex flex-col justify-center items-center h-[300px] gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading options data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[300px] p-6 text-center">
              <div className="text-destructive text-lg mb-2">⚠️</div>
              <p className="text-destructive font-medium text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : groupedOptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] p-6 text-center">
              <div className="text-muted-foreground text-lg mb-2">📊</div>
              <p className="text-muted-foreground text-sm">No eligible put options found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your criteria or check back later</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground text-sm">
                      Discount
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground text-sm">
                      Strike
                    </th>
                    {expirationDates.map(date => {
                      const daysToExpire = Math.ceil(
                        (new TZDate(new UTCDate(date), 'America/New_York').getTime() - new TZDate(new UTCDate(), 'America/New_York').getTime()) / 
                        (1000 * 60 * 60 * 24)
                      );
                      return (
                        <th key={date} className="px-2 py-2 text-center font-medium text-muted-foreground text-sm">
                          <div className="font-medium whitespace-nowrap">{format(new UTCDate(date), 'MMM d, yyyy')}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{daysToExpire}d</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groupedOptions.map((option, index) => (
                    <tr 
                      key={index}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-foreground">
                        {(option.discount * 100).toFixed(2)}%
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-foreground">
                        ${Number(option.strike).toFixed(2)}
                      </td>
                      {expirationDates.map(date => (
                        <td 
                          key={date} 
                          className="px-2 py-2 text-center text-sm relative group"
                          onMouseEnter={() => setHoveredCell({ row: index, date })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {option.rois[date]?.annualizedRoi > 0 ? (
                            <>
                              <span 
                                className="cursor-pointer inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                onClick={(e) => handleCopy(option.rois[date].contractDetails.contractId, e)}
                                title="Click to copy contract ID"
                              >
                                {(option.rois[date].annualizedRoi * 100).toFixed(2)}%
                              </span>
                              {hoveredCell?.row === index && hoveredCell?.date === date && (
                                <ContractPopover 
                                  details={option.rois[date].contractDetails} 
                                  position={index < groupedOptions.length / 3 ? 'bottom' : 'top'}
                                />
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 