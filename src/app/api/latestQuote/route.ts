import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 15; // seconds

export async function GET(req: NextRequest) {
  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return NextResponse.json({ error: 'API_BASE_URL not configured' }, { status: 500 });
  }

  const { search } = new URL(req.url);
  const upstreamUrl = `${apiBase}/latestQuote${search}`;

  try {
    const res = await fetch(upstreamUrl, { next: { revalidate } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch from upstream' }, { status: 502 });
  }
}


