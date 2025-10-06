import type { HistoricalQuote, HistoricalOption } from '@/types/stock';
import { fetchWithRetry } from './fetchWithRetry';
export const BATCH_SIZE = 30;

export async function fetchHistoricalData(
  stock: string, 
  loadedDays: number
): Promise<[HistoricalQuote[], HistoricalOption[]]> {
  // Deprecated: raw fetching; replaced by processed historical endpoint. Keeping signature for minimal refactor.
  const response = await fetchWithRetry(`/api/processedHistorical?symbol=${stock}&days=${BATCH_SIZE}&skip=${loadedDays}&minDays=1&maxDays=365&isLatest=${loadedDays === 0}`);
  if (!response.ok) {
    throw new Error('Failed to fetch processed historical data');
  }
  // Bridge: return empty arrays; callers now use processed payload via processQuotesAndOptions bypass
  return [[], []];
} 