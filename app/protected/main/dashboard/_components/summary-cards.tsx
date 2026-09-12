import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatPHP } from "@/lib/utils/currency";
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
      <Card className="hover:shadow-xs transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Gross Sales</CardTitle>
          <PhilippinePeso className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatPHP(grossSale)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total revenue generated today
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-xs transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Net Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatPHP(netProfit)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total earnings after item costs
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-xs transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Products Sold</CardTitle>
          <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
          <p className="text-xs text-muted-foreground mt-1">Total units moved today</p>
        </CardContent>
      </Card>
    </div>
  );
}
