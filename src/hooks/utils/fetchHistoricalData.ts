import type { HistoricalQuote, HistoricalOption } from '@/types/stock';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
export const BATCH_SIZE = 30;

export async function fetchHistoricalData(
  stock: string, 
  loadedDays: number
): Promise<[HistoricalQuote[], HistoricalOption[]]> {
  const quotesResponse = await fetch(`${API_BASE_URL}/historicalQuotes?symbol=${stock}&days=${BATCH_SIZE}&skip=${loadedDays}`);
  const optionsResponse = await fetch(`${API_BASE_URL}/historicalOptions?symbol=${stock}&days=${BATCH_SIZE}&skip=${loadedDays}`);
//   const [quotesResponse, optionsResponse] = await Promise.all([
//     fetch(`${API_BASE_URL}/historicalQuotes?symbol=${stock}&days=${BATCH_SIZE}&skip=${loadedDays}`),
//     fetch(`${API_BASE_URL}/historicalOptions?symbol=${stock}&days=${BATCH_SIZE}&skip=${loadedDays}`)
//   ]);

  if (!quotesResponse.ok || !optionsResponse.ok) {
    throw new Error('Failed to fetch data');
  }

  return Promise.all([
    quotesResponse.json(),
    optionsResponse.json()
  ]);
} 