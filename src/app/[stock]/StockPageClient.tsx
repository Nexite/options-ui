'use client';

import { useStockData } from '@/hooks/useStockData';
import StockGraphs from './StockGraphs';
import Link from 'next/link';
import { ArrowLeft, Settings, Table, Search } from 'lucide-react';
import AuthButton from '@/components/AuthButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

interface StockPageClientProps {
  stock: string;
  minDays: number;
  maxDays: number;
}

/**
 * StockPageClient component displays detailed stock analysis
 * Features stock overview, charts, and navigation controls
 */
export default function StockPageClient({ stock, minDays, maxDays }: StockPageClientProps) {
  const stockData = useStockData({ stock, minDays, maxDays });
  const router = useRouter();
  const [symbol, setSymbol] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [settings, setSettings] = useState({
    minDays: minDays,
    maxDays: maxDays
  });

  /**
   * Handles stock symbol search form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      router.push(`/${symbol.trim().toUpperCase()}?minDays=${settings.minDays}&maxDays=${settings.maxDays}`);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header with navigation and stock information */}
        <header className="sticky top-0 bg-background z-10 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side - Navigation and Stock Info */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/')}
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                      {stock}
                    </h1>
                    {stockData.stockOverview?.Name && (
                      <span className="text-sm text-muted-foreground">
                        ({stockData.stockOverview.Name})
                      </span>
                    )}
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex items-center gap-2">
                    {stockData.loading && (
                      <Badge variant="secondary">Loading...</Badge>
                    )}
                    {stockData.error && (
                      <Badge variant="destructive">Error: {stockData.error}</Badge>
                    )}
                  </div>
                  
                  {/* Stock overview data */}
                  {stockData.stockOverview && (
                    <div className="flex items-center gap-2">
                      {stockData.stockOverview.price && (
                        <Badge variant="outline">
                          ${stockData.stockOverview.price.toFixed(2)}
                        </Badge>
                      )}
                      {stockData.stockOverview['52WeekHigh'] && (
                        <Badge variant="outline">
                          52W High: ${stockData.stockOverview['52WeekHigh'].toFixed(2)}
                        </Badge>
                      )}
                      {stockData.stockOverview['52WeekLow'] && (
                        <Badge variant="outline">
                          52W Low: ${stockData.stockOverview['52WeekLow'].toFixed(2)}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Controls and Auth */}
              <div className="flex items-center gap-4">
                {/* Advanced settings popover */}
                <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Advanced Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="headerMinDays">Min Days</Label>
                        <Input
                          type="number"
                          id="headerMinDays"
                          value={settings.minDays}
                          onChange={(e) => setSettings(prev => ({ ...prev, minDays: parseInt(e.target.value) }))}
                          min={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="headerMaxDays">Max Days</Label>
                        <Input
                          type="number"
                          id="headerMaxDays"
                          value={settings.maxDays}
                          onChange={(e) => setSettings(prev => ({ ...prev, maxDays: parseInt(e.target.value) }))}
                          min={1}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-6" />

                {/* Stock search form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="Enter symbol"
                    className="w-36"
                  />
                  <Button type="submit" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                <Separator orientation="vertical" className="h-6" />

                <AuthButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-2 flex-1">
          <div className="space-y-8">
            <StockGraphs 
              stock={stock}
              stockData={stockData}
            />
            
            {/* Options table link */}
            <div className="flex justify-center">
              <Button asChild>
                <Link href={`/table/${stock}`}>
                  <Table className="h-4 w-4 mr-2" />
                  View Options Table
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 
