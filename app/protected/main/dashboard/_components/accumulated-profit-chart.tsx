"use client";

import { ChevronDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"; // Changed to AreaChart for accumulated look
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

type ChartDataPoint = {
  date: string;
  originalDate: Date;
  accumulated: number;
  dailyProfit: number;
};

const chartConfig = {
  accumulated: {
    label: "Accumulated Profit",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AccumulatedProfitChart() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [position, setPosition] = useState("Last 7 Days");
  const [isLoading, setIsLoading] = useState(false);

  const processData = (orders: Order[]): ChartDataPoint[] => {
    const groupedData: Record<
      string,
      { date: string; originalDate: Date; dailyProfit: number }
    > = {};

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
          dailyProfit: 0,
        };
      }

      groupedData[dateKey].dailyProfit += Number(order.total_profit || 0);
    });

    const sortedData = Object.values(groupedData).sort(
      (a, b) => a.originalDate.getTime() - b.originalDate.getTime()
    );

    let runningTotal = 0;
    return sortedData.map((item) => {
      runningTotal += item.dailyProfit;
      return {
        date: item.date,
        originalDate: item.originalDate,
        dailyProfit: item.dailyProfit,
        accumulated: runningTotal,
      };
    });
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

      try {
        const orders: Order[] = await fetchOrdersWithRange(
          start.toISOString(),
          end.toISOString()
        );

        const processed = processData(orders);

        setStartDate(start);
        setEndDate(end);
        setChartData(processed);
      } catch (error) {
        console.error("Error fetching accumulated data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [position]);

  const totalAccumulated = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData[chartData.length - 1].accumulated;
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Accumulated Profit</CardTitle>
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
            <AreaChart
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
                dataKey="accumulated"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                domain={[0, "auto"]}
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <defs>
                <linearGradient
                  id="fillAccumulated"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-accumulated)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-accumulated)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                dataKey="accumulated"
                type="natural"
                fill="url(#fillAccumulated)"
                fillOpacity={0.4}
                stroke="var(--color-accumulated)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Total Accumulated: ₱{totalAccumulated.toLocaleString()}{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Running total for the selected period
        </div>
      </CardFooter>
    </Card>
  );
}
