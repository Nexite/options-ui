import StockGraphs from './StockGraphs';
import ClientWrapper from './ClientWrapper';

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
      <header className="sticky top-0 bg-background z-10">
        <h1 className="text-xl font-bold p-4 text-center">
          Stock Analysis: {stock.toUpperCase()}
        </h1>
      </header>
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