import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Product } from "@/types/domain";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle } from "lucide-react";

type LowStockProductsProp = {
  products: Product[];
};

export function LowStockProducts({ products }: LowStockProductsProp) {
  return (
    <Card className="border-amber-200 dark:border-amber-800/40">
      <CardHeader className="p-3 pb-2 border-b bg-amber-50/50 dark:bg-amber-950/20">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-amber-800 dark:text-amber-300">
          <span>Low Stock Alerts</span>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[14vh] pr-2">
          {products.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-6 text-center">
              All inventory levels are healthy
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {products.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-center text-sm">
                  <span className="truncate pr-2 text-foreground">
                    <span className="font-semibold text-muted-foreground mr-1.5">{index + 1}.</span>
                    {item.name}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    {item.quantity} left
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
