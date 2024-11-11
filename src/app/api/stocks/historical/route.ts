import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      symbol: searchParams.get('symbol'),
      days: searchParams.get('days'),
      minDays: searchParams.get('minDays'),
      maxDays: searchParams.get('maxDays'),
    };

    if (!params.symbol || !params.days || !params.minDays || !params.maxDays) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/customStrategyHistorical?` + 
      new URLSearchParams(
        Object.fromEntries(
          Object.entries({ username: 'nikhil', ...params })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => [key, String(value)])
        )
      )
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 