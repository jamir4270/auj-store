import { DateTimeCard } from "./_components/date-time";
import { HistoryOrderItem, Product } from "@/types/domain";
import { fetchOrderItemsWithDetails, fetchLowStockProducts, fetchOutOfStockProducts } from "@/lib/data";
import { SummaryCards } from "./_components/summary-cards";
import { TopProducts } from "./_components/top-products";
import { OutOfStockProducts } from "./_components/out-of-stock-products";
import { LowStockProducts } from "./_components/low-stock-products";
import { calcTotals, getProductSalesCount } from "./utils";
import { Charts } from "./_components/charts";

export default async function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  const items: HistoryOrderItem[] = await fetchOrderItemsWithDetails(
    today.toISOString(),
    nextDay.toISOString()
  );

  const outOfStockItems: Product[] = await fetchOutOfStockProducts();
  const lowStockItems: Product[] = await fetchLowStockProducts();
  lowStockItems.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));

  const totals = calcTotals(items);
  const productSalesCount = getProductSalesCount(items);

  return (
    <div className="flex flex-col gap-4">
      <DateTimeCard />
      <SummaryCards
        grossSale={totals.grossSale}
        netProfit={totals.netProfit}
        totalProducts={totals.totalProducts}
      />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <Charts />
        </div>
        <div className="flex flex-col gap-3">
          <TopProducts products={productSalesCount} />
          <LowStockProducts products={lowStockItems} />
          <OutOfStockProducts products={outOfStockItems} />
        </div>
      </div>
    </div>
  );
}
