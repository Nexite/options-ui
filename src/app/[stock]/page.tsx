import StockGraphs from './StockGraphs';
import ClientWrapper from './ClientWrapper';
import StockHeader from './StockHeader';

type StockParams = Promise<{ stock: string }>;
type SearchParams = Promise<{ minDays?: string; maxDays?: string }>;

export default async function Page(props: { 
  params: StockParams;
  searchParams: SearchParams;
}) {
  const { stock } = await props.params;
  const searchParams = await props.searchParams;
  
  // Parse search params with fallback values
  const minDays = parseInt(searchParams?.minDays || '30');
  const maxDays = parseInt(searchParams?.maxDays || '365');

  return (
    <div className="min-h-screen">
      <ClientWrapper>
        <StockHeader initialStock={stock.toUpperCase()} />
      </ClientWrapper>
      <main className="p-2">
        <ClientWrapper>
          <StockGraphs 
            stock={stock} 
            minDays={minDays}
            maxDays={maxDays}
          />
        </ClientWrapper>
      </main>
    </div>
  );
} 