import { auth0 } from '@/lib/auth0';
import HomeClient from './HomeClient';

type Top20Stock = {
  ticker: string;
  change_percentage: string;
}

export const revalidate = 3600;

async function generateStaticParams(): Promise<Top20Stock[]> {
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
  const top20 = await generateStaticParams();
  const session = await auth0.getSession();
  console.log(session);
  if (!session) {
    return <div>Not logged in</div>;
  }
  return <HomeClient top20={top20} />;
}
