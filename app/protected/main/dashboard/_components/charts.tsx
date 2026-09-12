"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MetricTrendChart, MetricType, ViewMode } from "@/components/dashboard/metric-trend-chart";

export function Charts() {
  const [metric, setMetric] = useState<MetricType>("profit");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  const getDescription = () => {
    const metricText = metric === "profit" ? "net profit" : "gross sales";
    const viewText = viewMode === "daily" ? "per day" : "growth over time";
    return `View your ${metricText} ${viewText}.`;
  };

  return (
    <div className="flex flex-col flex-3 w-full h-full border rounded-xl bg-card text-card-foreground shadow-sm gap-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 pb-2 gap-4">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">
            {metric === "profit" ? "Profit Analytics" : "Sales Analytics"}
          </h3>
          <p className="text-sm text-muted-foreground">{getDescription()}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center p-1 bg-muted rounded-lg border">
            <button
              onClick={() => setMetric("profit")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                metric === "profit"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Profit
            </button>
            <button
              onClick={() => setMetric("sales")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                metric === "sales"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sales
            </button>
          </div>

          <div className="flex items-center p-1 bg-muted rounded-lg border">
            <button
              onClick={() => setViewMode("daily")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                viewMode === "daily"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode("accumulated")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                viewMode === "accumulated"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Accumulated
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 flex-1 min-h-0">
        <div
          key={`${metric}-${viewMode}`}
          className="animate-in fade-in zoom-in-95 duration-300"
        >
          <MetricTrendChart metric={metric} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
}
