// fetch from the stocks.nikhilgarg.com/alphavantage/overview endpoint
export async function fetchStockOverview(stock: string): Promise<{ '52WeekHigh': number, '52WeekLow': number, Name: string }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/overview?symbol=${stock.toUpperCase()}`);
  const data = await response.json();
  return data;
}