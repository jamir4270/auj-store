import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimeCard } from "./_components/date-time";
import { HistoryOrderItem, Product } from "@/lib/models";
import { fetchOrderItems } from "../history/data";
import { twoDecimal } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchLowStockProducts, fetchOutOfStockProducts } from "@/lib/data";

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

  const calcTotals = () => {
    let sales = 0;
    let products = 0;
    let profit = 0;
    for (const item of items) {
      sales += item.subtotal;
      products += item.quantity;
      profit += item.profit;
    }
    return { grossSale: sales, totalProducts: products, netProfit: profit };
  };

  function getProductSalesCount(items: HistoryOrderItem[]) {
    const salesMap = items.reduce((acc, item) => {
      const currentCount = acc[item.name] || 0;

      acc[item.name] = currentCount + item.quantity;

      return acc;
    }, {} as Record<string, number>);

    const result = Object.entries(salesMap).map(([name, count]) => ({
      name,
      count,
    }));

    return result.sort((a, b) => a.count - b.count);
  }

  const totals = calcTotals();
  const productSalesCount = getProductSalesCount(items);

  return (
    <div className="flex flex-col gap-5 px-5">
      <DateTimeCard />
      <div className="flex flex-row justify-between w-full gap-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Gross Sales</CardTitle>
          </CardHeader>
          <CardContent>{twoDecimal(totals.grossSale)}</CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>{twoDecimal(totals.netProfit)}</CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Products Sold</CardTitle>
          </CardHeader>
          <CardContent>{totals.totalProducts}</CardContent>
        </Card>
      </div>
      <div className="flex flex-row w-full gap-5">
        <div className="flex-3 w-full h-full flex-col border-2 rounded-2xl"></div>
        <div className="flex flex-1 flex-col gap-3 w-full h-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Top 5 Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="flex flex-col gap-2 h-[18vh]">
                {productSalesCount.map((item, index) => {
                  return (
                    <div
                      key={item.name}
                      className="flex flex-row justify-between"
                    >
                      <p>{`${index + 1}. ${item.name}`}</p>
                      <p>{item.count}</p>
                    </div>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Out of Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="flex flex-col gap-2 h-[18vh]">
                {outOfStockItems.map((item, index) => {
                  return (
                    <div key={item.id}>
                      <p>{`${index + 1}. ${item.name}`}</p>
                    </div>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="flex flex-col gap-2 h-[18vh]">
                {lowStockItems.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className="flex flex-row justify-between"
                    >
                      <p>{`${index + 1}. ${item.name}`}</p>
                      <p>{item.quantity}</p>
                    </div>
                  );
                })}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
