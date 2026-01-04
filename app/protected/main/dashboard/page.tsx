import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimeCard } from "./_components/date-time";
import { HistoryOrderItem, Product } from "@/lib/models";
import { fetchOrderItems } from "../history/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchLowStockProducts, fetchOutOfStockProducts } from "@/lib/data";
import { SummaryCards } from "./_components/summary-cards";
import { TopProducts } from "./_components/top-products";
import { OutOfStockProducts } from "./_components/out-of-stock-products";
import { LowStockProducts } from "./_components/low-stock-products";
import { NetProfitChart } from "./_components/charts";
import { calcTotals, getProductSalesCount } from "./utils";

export default async function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  const items: HistoryOrderItem[] = await fetchOrderItems(
    today.toISOString(),
    nextDay.toISOString()
  );

  const outOfStockItems: Product[] = await fetchOutOfStockProducts();
  const lowStockItems: Product[] = await fetchLowStockProducts();
  lowStockItems.sort((a, b) => a.quantity - b.quantity);

  const totals = calcTotals(items);
  const productSalesCount = getProductSalesCount(items);

  return (
    <div className="flex flex-col gap-5 px-5">
      <DateTimeCard />
      <SummaryCards
        grossSale={totals.grossSale}
        netProfit={totals.netProfit}
        totalProducts={totals.totalProducts}
      />
      <div className="flex flex-row w-full gap-5">
        <div className="flex-3 w-full h-full flex-col border-2 rounded-2xl">
          <NetProfitChart />
        </div>
        <div className="flex flex-1 flex-col gap-3 w-full h-full">
          <TopProducts products={productSalesCount} />
          <OutOfStockProducts products={outOfStockItems} />
          <LowStockProducts products={lowStockItems} />
        </div>
      </div>
    </div>
  );
}
