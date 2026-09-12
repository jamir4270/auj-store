import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award } from "lucide-react";

type TopProductsProp = {
  products: { name: string; count: number }[];
};

export function TopProducts({ products }: TopProductsProp) {
  const topFive = products.slice(0, 5);

  return (
    <Card className="border-emerald-200 dark:border-emerald-800/40">
      <CardHeader className="p-3 pb-2 border-b bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-emerald-800 dark:text-emerald-300">
          <span>Top Selling Products</span>
          <Award className="h-4 w-4 text-emerald-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[14vh] pr-2">
          {topFive.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-6 text-center">
              No sales recorded today yet
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {topFive.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span className="truncate pr-2 text-foreground">
                    <span className="font-semibold text-muted-foreground mr-1.5">{index + 1}.</span>
                    {item.name}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                    {item.count} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
