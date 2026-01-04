"use client";

import { ChevronDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
import { Order } from "@/lib/models";
import { twoDecimal } from "@/lib/utils";

type ChartDataPoint = {
  date: string;
  originalDate: Date;
  profit: number;
};

const chartConfig = {
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function NetProfitChart() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [position, setPosition] = useState("Last 7 Days");
  const [isLoading, setIsLoading] = useState(false);

  const processData = (orders: Order[]): ChartDataPoint[] => {
    const groupedData: Record<string, ChartDataPoint> = {};

    orders.forEach((order) => {
      if (!order.created_at) return;

      const dateObj = new Date(order.created_at);

      const dateKey = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          originalDate: dateObj,
          profit: 0,
        };
      }

      groupedData[dateKey].profit += Number(order.total_profit || 0);
    });

    return Object.values(groupedData).sort(
      (a, b) => a.originalDate.getTime() - b.originalDate.getTime()
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const end = new Date();
      const start = new Date();

      let daysToSubtract = 7;
      if (position === "Last 15 Days") daysToSubtract = 15;
      if (position === "Last 30 Days") daysToSubtract = 30;

      start.setDate(end.getDate() - daysToSubtract);

      const orders: Order[] = await fetchOrdersWithRange(
        start.toISOString(),
        end.toISOString()
      );

      const processed = processData(orders);

      setStartDate(start);
      setEndDate(end);
      setChartData(processed);
      setIsLoading(false);
    };

    fetchData();
  }, [position]);

  const totalProfit = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.profit, 0);
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Net Profit</CardTitle>
          <CardDescription>
            {startDate.toLocaleDateString("default", { month: "long" })}{" "}
            {startDate.getDate()} -{" "}
            {endDate.toLocaleDateString("default", { month: "long" })}{" "}
            {endDate.getDate()}
          </CardDescription>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex flex-row">
                {position}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup
                value={position}
                onValueChange={setPosition}
              >
                <DropdownMenuRadioItem value="Last 7 Days">
                  Last 7 Days
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Last 15 Days">
                  Last 15 Days
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Last 30 Days">
                  Last 30 Days
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading data...
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="overflow-x-auto">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                dataKey="profit"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => twoDecimal(value)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="profit"
                type="linear"
                stroke="var(--color-profit)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Total Profit: ₱{totalProfit.toLocaleString()}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing profit for the selected period
        </div>
      </CardFooter>
    </Card>
  );
}
