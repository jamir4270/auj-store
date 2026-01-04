import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { twoDecimal } from "@/lib/utils";
import { TrendingUp, Package, PhilippinePeso } from "lucide-react";

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
    <div className="grid gap-4 md:grid-cols-3 w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross Sales</CardTitle>
          <PhilippinePeso className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{twoDecimal(grossSale)}</div>
          <p className="text-xs text-muted-foreground">
            Total revenue generated
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{twoDecimal(netProfit)}</div>
          <p className="text-xs text-muted-foreground">
            Total earnings after costs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground">Total items ordered</p>
        </CardContent>
      </Card>
    </div>
  );
}
