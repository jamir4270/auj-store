import { DateTimeCard } from "@/components/dashboard/date-time";
import { HistoryOrderItem, Product } from "@/types/domain";
import { fetchOrderItemsWithDetails, fetchLowStockProducts, fetchOutOfStockProducts } from "@/lib/data";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TopProducts } from "@/components/dashboard/top-products";
import { OutOfStockProducts } from "@/components/dashboard/out-of-stock-products";
import { LowStockProducts } from "@/components/dashboard/low-stock-products";
import { calcTotals, getProductSalesCount } from "@/lib/utils/dashboard";
import { Charts } from "@/components/dashboard/charts";

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
