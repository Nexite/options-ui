import { NextRequest, NextResponse } from 'next/server';
import { parseISO } from 'date-fns';
import { TZDate } from '@date-fns/tz';

export const revalidate = 15; // seconds

function isAdjustedOption(contractId: string): boolean {
  const tickerEnd = contractId.length - 15;
  const ticker = contractId.slice(0, tickerEnd);
  return /\d/.test(ticker);
}

export async function GET(req: NextRequest) {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  const url = new URL(req.url);
  const symbol = url.searchParams.get('symbol')?.toUpperCase();
  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
  }

  const quoteUrl = `${apiBase}/latestQuote?symbol=${symbol}`;
  const optionsUrl = `${apiBase}/latestOptions?symbol=${symbol}`;

  try {
    // Keep upstream uncached to avoid fetch-cache size/duplication issues; cache the final response instead
    const [quoteRes, optionsRes] = await Promise.all([
      fetch(quoteUrl, { cache: 'no-store' }),
      fetch(optionsUrl, { cache: 'no-store' })
    ]);
    if (!quoteRes.ok || !optionsRes.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }

    const quoteData = await quoteRes.json();
    const currentPrice: number = quoteData.price;
    const currentDate: string = quoteData.date;
    const optionsData = await optionsRes.json();

    if (!optionsData.puts) {
      return NextResponse.json({ error: 'No options data available' }, { status: 200 });
    }

    // Process latest options into grouped structure for the table
    const processed = optionsData.puts
      .filter((opt: any) => !isAdjustedOption(opt.contractId))
      .map((opt: any) => {
        const discount = 1 - (opt.strike / currentPrice);
        const expiration = opt.expiration;
        // Calculate days to expire using Eastern timezone for consistency
        const nowET = new TZDate(new Date(), 'America/New_York');
        const expirationDate = parseISO(expiration);
        const year = expirationDate.getUTCFullYear();
        const month = expirationDate.getUTCMonth();
        const day = expirationDate.getUTCDate();
        const expirationStartOfDayET = new TZDate(year, month, day, 'America/New_York');
        const nowStartOfDayET = new TZDate(nowET.getFullYear(), nowET.getMonth(), nowET.getDate(), 'America/New_York');
        
        const daysToExpire = Math.ceil(
          (expirationStartOfDayET.getTime() - nowStartOfDayET.getTime()) / (1000 * 60 * 60 * 24)
        );
        const roi = opt.bid / opt.strike;
        const annualizedRoi = (roi * 365) / daysToExpire;
        return {
          strike: opt.strike,
          discount,
          annualizedRoi,
          daysToExpire,
          expiration,
          contractId: opt.contractId,
          bid: opt.bid,
          ask: opt.ask,
          roi
        };
      })
      .filter((opt: any) => Number.isFinite(opt.annualizedRoi) && !Number.isNaN(opt.annualizedRoi) && opt.strike < currentPrice);

    // Group by strike with per-expiration ROI details
    const grouped: Array<{
      strike: number;
      discount: number;
      rois: Record<string, { annualizedRoi: number; contractDetails: any }>;
    }> = [];

    for (const p of processed) {
      let bucket = grouped.find(g => g.strike === p.strike);
      if (!bucket) {
        bucket = { strike: p.strike, discount: p.discount, rois: {} };
        grouped.push(bucket);
      }
      bucket.rois[p.expiration] = {
        annualizedRoi: p.annualizedRoi,
        contractDetails: {
          strike: p.strike,
          annualizedRoi: p.annualizedRoi,
          daysToExpire: p.daysToExpire,
          expiration: p.expiration,
          contractId: p.contractId,
          bid: p.bid,
          ask: p.ask,
          roi: p.roi
        }
      };
    }

    const expirationDates = Array.from(new Set<string>(processed.map((p: any) => p.expiration)))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const groupedSorted = grouped.sort((a, b) => a.discount - b.discount);

    return NextResponse.json({
      currentPrice,
      expirationDates,
      groupedOptions: groupedSorted
    }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to process table data' }, { status: 500 });
  }
}


