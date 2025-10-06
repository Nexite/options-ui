import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse(
    JSON.stringify({
      error: 'Deprecated endpoint',
      message: 'Use /api/processedHistorical?symbol=...&days=...&skip=...&minDays=...&maxDays=...&isLatest=... instead.'
    }),
    {
      status: 410,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
        'Deprecation': 'true',
        'Link': '</api/processedHistorical>; rel="successor-version"'
      }
    }
  );
}


