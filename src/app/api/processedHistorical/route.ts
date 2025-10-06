import { NextRequest, NextResponse } from 'next/server';
import { processQuotesAndOptions } from '@/hooks/utils/processQuotesAndOptions';
import type { HistoricalOption, HistoricalQuote, StockDataResponse } from '@/types/stock';

// Cache the processed result; avoid caching raw upstream 2MB+ payloads
export const revalidate = 300; // seconds

export async function GET(req: NextRequest) {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  const url = new URL(req.url);
  const symbol = url.searchParams.get('symbol')?.toUpperCase();
  const days = url.searchParams.get('days') ?? '30';
  const skip = url.searchParams.get('skip') ?? '0';
  const minDays = Number(url.searchParams.get('minDays') ?? '1');
  const maxDays = Number(url.searchParams.get('maxDays') ?? '365');
  const isLatestBatch = url.searchParams.get('isLatest') === 'true';

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });
  }

  const quotesUrl = `${apiBase}/historicalQuotes?symbol=${symbol}&days=${days}&skip=${skip}`;
  const optionsUrl = `${apiBase}/historicalOptions?symbol=${symbol}&days=${days}&skip=${skip}`;

  try {
    // Bypass Next fetch cache for large upstream payloads to avoid 2MB limit
    const [quotesRes, optionsRes] = await Promise.all([
      fetch(quotesUrl, { cache: 'no-store' }),
      fetch(optionsUrl, { cache: 'no-store' })
    ]);

    if (!quotesRes.ok || !optionsRes.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }

    const [quotes, options] = await Promise.all([
      quotesRes.json() as Promise<HistoricalQuote[]>,
      optionsRes.json() as Promise<HistoricalOption[]>
    ]);

    const data: StockDataResponse = processQuotesAndOptions(
      quotes,
      options,
      isLatestBatch,
      minDays,
      maxDays,
      symbol
    );

    // Return the compact processed structure
    return NextResponse.json({ data }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to process data' }, { status: 500 });
  }
}


