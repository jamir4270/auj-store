import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { twoDecimal } from "@/lib/utils";

type SummaryCardProps = {
  grossSale: number;
  netProfit: number;
  totalProducts: number;
};

export function SummaryCards({
  grossSale,
  netProfit,
  totalProducts,
}: SummaryCardProps) {
  return (
    <div className="flex flex-row justify-between w-full gap-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gross Sales</CardTitle>
        </CardHeader>
        <CardContent>{twoDecimal(grossSale)}</CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Net Profit</CardTitle>
        </CardHeader>
        <CardContent>{twoDecimal(netProfit)}</CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Products Sold</CardTitle>
        </CardHeader>
        <CardContent>{totalProducts}</CardContent>
      </Card>
    </div>
  );
}
