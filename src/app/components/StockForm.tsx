'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * StockForm component for searching and analyzing stocks
 * Features a main search input with advanced settings for expiration days
 */
export default function StockForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    minDays: '30',
    maxDays: '365'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-focus the input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  /**
   * Handles form submission and navigates to stock analysis page
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.symbol.trim()) {
      router.push(`/${formData.symbol}?minDays=${formData.minDays}&maxDays=${formData.maxDays}`);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-center">Search Stocks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main stock symbol input with advanced settings */}
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={formData.symbol}
              onChange={(e) => {
                // Only allow letters and numbers, and transform to uppercase
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                setFormData(prev => ({ ...prev, symbol: value }));
              }}
              placeholder="Enter stock symbol (e.g., AAPL)"
              className="pr-10 [&::placeholder]:normal-case uppercase"
              required
            />
            <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  title="Advanced Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minDays">Min Expiration Days</Label>
                    <Input
                      type="number"
                      id="minDays"
                      value={formData.minDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, minDays: e.target.value }))}
                      min={1}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDays">Max Expiration Days</Label>
                    <Input
                      type="number"
                      id="maxDays"
                      value={formData.maxDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDays: e.target.value }))}
                      min={1}
                      placeholder="365"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.symbol.trim()}
            >
              Analyze Stock
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/compare')}
              className="flex-1"
            >
              Compare Stocks
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 