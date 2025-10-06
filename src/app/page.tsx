import StockForm from './components/StockForm';
import AuthButton from '../components/AuthButton';
import ProtectedRoute from '../components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

/**
 * Type definition for top 20 most actively traded stocks
 */
type Top20Stock = {
  ticker: string;
  change_percentage: string;
}

/**
 * Fetches the top 20 most actively traded stocks from the API
 * @returns Promise<Top20Stock[]> Array of stock data
 */
async function getTop20(): Promise<Top20Stock[]> {
  try {
    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) throw new Error('APP_BASE_URL not configured');
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

/**
 * Home page component that displays the main interface for stock analysis
 * Features a stock search form and displays top 20 most actively traded stocks
 */
export default async function Home() {
  const top20 = await getTop20();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header with navigation and authentication */}
        <header className="bg-background shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-semibold text-foreground">Options Analyzer</h1>
              <AuthButton />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Stock Analysis</h1>
            <p className="text-muted-foreground">Enter a stock symbol to analyze</p>
          </div>

          {/* Stock search form */}
          <StockForm />

          {/* Top 20 most actively traded stocks */}
          {top20 && top20.length > 0 && (
            <div className="mt-12 w-full max-w-4xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-foreground">Highest Volume Stocks</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Note: if it fails it is likely that the stock does not have any data
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {top20.map((stock: any) => (
                  <Link key={stock.ticker} href={`/${stock.ticker}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{stock.ticker}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Badge 
                          variant={parseFloat(stock.change_percentage) >= 0 ? "default" : "destructive"}
                          className="text-sm"
                        >
                          {parseFloat(stock.change_percentage) >= 0 ? '+' : ''}
                          {stock.change_percentage}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
