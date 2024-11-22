import { format } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import type {
  HistoricalQuote,
  HistoricalOption,
  ProcessedOption,
  StockDataResponse,
  StockOptionData,
  DataByPercentage
} from '@/types/stock';

function processOption(
  contract: HistoricalOption['puts'][0],
  quote: HistoricalQuote,
  minDays: number,
  maxDays: number
): ProcessedOption | null {
  const expirationDate = new UTCDate(contract.expiration);
  const currentDate = new UTCDate(quote.date);
  
  const daysToExpire = Math.ceil(
    (expirationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  ) - 1;
  
  if (daysToExpire < minDays || daysToExpire > maxDays) {
    return null;
  }

  const roi = contract.bid / contract.strike;
  const annualizedRoi = (roi * 365) / daysToExpire;
  
  if (isNaN(roi) || isNaN(annualizedRoi) || !isFinite(roi) || !isFinite(annualizedRoi)) {
    return null;
  }

  return {
    contractID: contract.contractId,
    expiration: format(expirationDate, 'yyyy-MM-dd'),
    strike: contract.strike,
    ask: contract.ask,
    bid: contract.bid,
    mark: (contract.ask + contract.bid) / 2,
    daysToExpire,
    roi,
    annualizedRoi
  };
}

export function processQuotesAndOptions(
  quotes: HistoricalQuote[],
  options: HistoricalOption[],
  isLatestBatch: boolean,
  minDays: number,
  maxDays: number,
  stock: string
): StockDataResponse {
  const newData: StockDataResponse = {};
  const percentages = ['75', '80', '85', '90', '95'];

  quotes.forEach(quote => {
    const dateOptions = options.find(opt => opt.date === quote.date);
    if (!dateOptions) {
      newData[format(new UTCDate(quote.date), 'yyyy-MM-dd')] = {
        close: quote.price,
        percentages: {}
      };
      return;
    }

    const processedOptions = dateOptions.puts
      .map(contract => processOption(contract, quote, minDays, maxDays))
      .filter((opt): opt is ProcessedOption => opt !== null);

    const groupedOptions: DataByPercentage = {};
    
    percentages.forEach(percentage => {
      const value = quote.price * (Number(percentage) / 100);
      const relevantOptions = processedOptions
        .filter(opt => opt.strike <= value)
        .map(opt => ({
          contractID: opt.contractID,
          symbol: stock,
          expiration: opt.expiration,
          strike: opt.strike.toString(),
          type: 'put' as const,
          daysToExpire: opt.daysToExpire,
          date: quote.date,
          last: opt.mark.toString(),
          mark: opt.mark.toString(),
          bid: opt.bid.toString(),
          ask: opt.ask.toString(),
          bid_size: '0',
          ask_size: '0',
          volume: '0',
          open_interest: '0',
          delta: '0',
          gamma: '0',
          theta: '0',
          vega: '0',
          rho: '0',
          implied_volatility: '0',
          roi: opt.roi,
          annualizedRoi: opt.annualizedRoi
        } satisfies StockOptionData));

      const sortedOptions = [...relevantOptions].sort((a, b) => {
        const roiDiff = b.annualizedRoi - a.annualizedRoi;
        return roiDiff !== 0 ? roiDiff : Number(b.strike) - Number(a.strike);
      });

      const topOptions = isLatestBatch ? sortedOptions.slice(0, 6) : sortedOptions.slice(0, 1);

      if (topOptions.length > 0) {
        groupedOptions[percentage] = topOptions;
      }
    });

    newData[format(new UTCDate(quote.date), 'yyyy-MM-dd')] = {
      close: quote.price,
      percentages: groupedOptions
    };
  });

  return newData;
} 