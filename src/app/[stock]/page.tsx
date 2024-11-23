import StockPageClient from './StockPageClient';
import { redirect } from 'next/navigation';

type StockParams = Promise<{ stock: string }>;
type SearchParams = Promise<{ minDays?: string; maxDays?: string }>;
export async function generateMetadata({ params }: { params: StockParams }) {
  const { stock } = await params;
  return {
    title: `${stock.toUpperCase()} - Options Analyzer`
  };
}

export default async function Page(props: { 
  params: StockParams;
  searchParams: SearchParams;
}) {
  const { stock } = await props.params;
  const searchParams = await props.searchParams;
  
  // Redirect to uppercase version if stock is not already uppercase
  if (stock !== stock.toUpperCase()) {
    redirect(`/${stock.toUpperCase()}`);
  }

  // Parse search params with fallback values
  const minDays = parseInt(searchParams?.minDays || '30');
  const maxDays = parseInt(searchParams?.maxDays || '365');

  return (
    <StockPageClient 
      stock={stock.toUpperCase()}
      minDays={minDays}
      maxDays={maxDays}
    />
  );
} 