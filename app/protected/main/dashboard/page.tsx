import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimeCard } from "./_components/date-time";
import { HistoryOrderItem } from "@/lib/models";
import { fetchOrderItems } from "../history/data";
import { twoDecimal } from "@/lib/utils";

export default async function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + 1);

  const items: HistoryOrderItem[] = await fetchOrderItems(
    today.toISOString(),
    nextDay.toISOString()
  );

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

  const totals = calcTotals();

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
              <CardTitle>Top 5 Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>1. Ice Water</p>
              <p>2. Ice Candy</p>
              <p>3. Ice Pop</p>
              <p>4. Ice</p>
              <p>5. Coke Sakto</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Out of Stock Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>1. Ice Water</p>
              <p>2. Ice Candy</p>
              <p>3. Ice Pop</p>
              <p>4. Ice</p>
              <p>5. Coke Sakto</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>1. Ice Water</p>
              <p>2. Ice Candy</p>
              <p>3. Ice Pop</p>
              <p>4. Ice</p>
              <p>5. Coke Sakto</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
