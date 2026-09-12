"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock } from "lucide-react";

export function DateTimeCard() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (!mounted) {
    return (
      <Card className="flex items-center justify-between p-4 h-[60px]">
        <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="flex flex-row items-center justify-between p-4 shadow-sm">
      <div className="flex items-center gap-2 text-foreground">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <span className="font-semibold text-sm sm:text-base">
          {time.toLocaleDateString("default", { dateStyle: "long" })}
        </span>
      </div>

      <div className="flex items-center gap-2 text-foreground">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span className="font-mono text-sm sm:text-base font-medium tabular-nums">
          {time.toLocaleTimeString()}
        </span>
      </div>
    </Card>
  );
}
