import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const params = validateAndGetParams(request);
    const data = await fetchStockData(params);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { 
      status: error instanceof ValidationError ? 400 : 500 
    });
  }
}

class ValidationError extends Error {}

interface StockParams {
  symbol: string;
  date: string;
  minDays: string;
  maxDays: string;
}

function validateAndGetParams(request: NextRequest): StockParams {
  const searchParams = request.nextUrl.searchParams;
  const params = {
    symbol: searchParams.get('symbol'),
    date: searchParams.get('date'),
    minDays: searchParams.get('minDays'),
    maxDays: searchParams.get('maxDays'),
  };

  if (!params.symbol || !params.date || !params.minDays || !params.maxDays) {
    throw new ValidationError('Missing required parameters');
  }

  return params as StockParams;
}

async function fetchStockData(params: StockParams) {
  const response = await fetch(
    `${API_BASE_URL}/customStrategy?` + 
    new URLSearchParams({
      username: 'nikhil',
      ...params
    })
  );
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
} 