import StockForm from './components/StockForm';


type Top20Stock = {
  ticker: string;
  change_percentage: string;
}

async function getTop20(): Promise<Top20Stock[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('API base URL not configured');
  }

  try {
    const response = await fetch(`${apiBaseUrl}/alphavantage?function=TOP_GAINERS_LOSERS&username=nikhil`, {
      next: {
        revalidate: 3600 // Revalidate every hour (3600 seconds)
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const mostActive = await response.json();
    return mostActive.most_actively_traded;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
}

export default async function Home() {
  const top20 = await getTop20();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Stock Analysis</h1>
          <p className="text-gray-600">Enter a stock symbol to analyze</p>
        </div>

        <StockForm />

        {top20 && top20.length > 0 && (
          <div className="mt-12 w-full max-w-4xl">
            <h2 className="text-2xl font-semibold text-center">Highest Volume Stocks</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">Note: if it fails it is likely that the stock does not have any data</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {top20.map((stock: any) => (
                <a
                  key={stock.ticker}
                  href={`/${stock.ticker}`}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  <div className="text-lg font-bold">{stock.ticker}</div>
                  {/* {stock.name && <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name.split('(')[0].split(',')[0].replace('Inc.', '').replace('Corp.', '').replace('Inc', '').replace('Corp', '').trim()}</div>} */}
                  <div className={`text-sm ${parseFloat(stock.change_percentage) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {parseFloat(stock.change_percentage) >= 0 ? '+' : ''}
                    {stock.change_percentage}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
