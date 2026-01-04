"use client";

import { useState } from "react";
import { AccumulatedProfitChart } from "./accumulated-profit-chart";
import { NetProfitChart } from "./net-profit-chart";
import { cn } from "@/lib/utils";

export function Charts() {
  const [viewMode, setViewMode] = useState<"daily" | "accumulated">("daily");

  return (
    <div className="flex flex-col flex-3 w-full h-full border rounded-xl bg-card text-card-foreground shadow-sm gap-5">
      <div className="flex flex-row items-center justify-between p-6 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold leading-none tracking-tight">
            Revenue Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            {viewMode === "daily"
              ? "View your net profit per day."
              : "View your total profit growth over time."}
          </p>
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
            Daily Net
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

      <div className="p-6 pt-0 flex-1 min-h-0">
        {viewMode === "daily" ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <NetProfitChart />
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <AccumulatedProfitChart />
          </div>
        )}
      </div>
    </div>
  );
}
