"use client";

import { ChevronDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { fetchOrdersWithRange } from "@/lib/data";
import { Order } from "@/types/domain";
import { formatPHP } from "@/lib/utils/currency";

export type MetricType = "profit" | "sales";
export type ViewMode = "daily" | "accumulated";

interface MetricTrendChartProps {
  metric: MetricType;
  viewMode: ViewMode;
}

type ChartDataPoint = {
  date: string;
  originalDate: Date;
  value: number;
};

const chartConfig = {
  value: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function MetricTrendChart({ metric, viewMode }: MetricTrendChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [rangeLabel, setRangeLabel] = useState("Last 7 Days");
  const [isLoading, setIsLoading] = useState(false);

  const metricLabel = metric === "profit" ? "Net Profit" : "Gross Sales";
  const viewLabel = viewMode === "daily" ? "Daily" : "Accumulated";

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);

      const end = new Date();
      const start = new Date();

      let daysToSubtract = 7;
      if (rangeLabel === "Last 15 Days") daysToSubtract = 15;
      if (rangeLabel === "Last 30 Days") daysToSubtract = 30;

      start.setDate(end.getDate() - daysToSubtract);
      start.setHours(0, 0, 0, 0);

      const orders = await fetchOrdersWithRange(start.toISOString(), end.toISOString());

      if (!isMounted) return;

      // Group by date
      const groupedData: Record<string, { date: string; originalDate: Date; rawValue: number }> = {};

      // Seed all dates in the range so the chart line is continuous
      for (let i = 0; i <= daysToSubtract; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateKey = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        groupedData[dateKey] = {
          date: dateKey,
          originalDate: d,
          rawValue: 0,
        };
      }

      orders.forEach((order) => {
        if (!order.created_at) return;
        const dateObj = new Date(order.created_at);
        const dateKey = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        const amount = metric === "profit" ? Number(order.total_profit || 0) : Number(order.total || 0);

        if (groupedData[dateKey]) {
          groupedData[dateKey].rawValue += amount;
        } else {
          groupedData[dateKey] = {
            date: dateKey,
            originalDate: dateObj,
            rawValue: amount,
          };
        }
      });

      const sorted = Object.values(groupedData).sort(
        (a, b) => a.originalDate.getTime() - b.originalDate.getTime()
      );

      // Compute running total if accumulated
      let runningTotal = 0;
      const finalData: ChartDataPoint[] = sorted.map((pt) => {
        if (viewMode === "accumulated") {
          runningTotal += pt.rawValue;
          return {
            date: pt.date,
            originalDate: pt.originalDate,
            value: runningTotal,
          };
        }
        return {
          date: pt.date,
          originalDate: pt.originalDate,
          value: pt.rawValue,
        };
      });

      setChartData(finalData);
      setIsLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [metric, viewMode, rangeLabel]);

  const totalValue = useMemo(() => {
    if (viewMode === "accumulated" && chartData.length > 0) {
      return chartData[chartData.length - 1].value;
    }
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData, viewMode]);

  return (
    <Card className="flex flex-col border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
        <div>
          <CardTitle className="text-xl font-bold">
            {viewLabel} {metricLabel}
          </CardTitle>
          <CardDescription>
            Total for period: <span className="font-semibold text-foreground">{formatPHP(totalValue)}</span>
          </CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {rangeLabel}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={rangeLabel} onValueChange={setRangeLabel}>
              <DropdownMenuRadioItem value="Last 7 Days">Last 7 Days</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Last 15 Days">Last 15 Days</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="Last 30 Days">Last 30 Days</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-0 pt-4">
        {isLoading ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
            Loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
            No sales data for this period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            {viewMode === "accumulated" ? (
              <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={20}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(val) => `₱${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(val) => (
                        <span className="font-mono font-medium">{formatPHP(Number(val))}</span>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fill="url(#fillGradient)"
                  fillOpacity={0.4}
                  stroke="var(--color-value)"
                  strokeWidth={2}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ left: 12, right: 12, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={20}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(val) => `₱${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(val) => (
                        <span className="font-mono font-medium">{formatPHP(Number(val))}</span>
                      )}
                    />
                  }
                />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            )}
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="px-0 pt-2 pb-0">
        <div className="flex w-full items-start gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Showing {rangeLabel.toLowerCase()} store transactions</span>
        </div>
      </CardFooter>
    </Card>
  );
}
