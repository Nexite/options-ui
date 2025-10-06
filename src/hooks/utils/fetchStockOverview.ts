import { fetchWithRetry } from './fetchWithRetry';

// Fetch via internal proxy endpoint
export async function fetchStockOverview(stock: string): Promise<{ '52WeekHigh': number, '52WeekLow': number, Name: string }> {
  const response = await fetchWithRetry(`/api/overview?symbol=${stock.toUpperCase()}`);
  const data = await response.json();
  return data;
}