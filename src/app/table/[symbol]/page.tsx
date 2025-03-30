import { redirect } from 'next/navigation';
import TablePageClient from './TablePageClient';

type SymbolParams = Promise<{ symbol: string }>;

export async function generateMetadata({ params }: { params: SymbolParams }) {
  const { symbol } = await params;
  return {
    title: `${symbol.toUpperCase()} - Options Table`,
  };
}

export default async function Page({ params }: { params: SymbolParams }) {
  const { symbol } = await params;
  
  // Redirect to uppercase version if symbol is not already uppercase
  if (symbol !== symbol.toUpperCase()) {
    redirect(`/table/${symbol.toUpperCase()}`);
  }

  return (
    <TablePageClient symbol={symbol.toUpperCase()} />
  );
} 