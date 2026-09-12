import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Product } from "@/types/domain";
import { ScrollArea } from "@/components/ui/scroll-area";
import { XCircle } from "lucide-react";

type OutOfStockProductsProp = {
  products: Product[];
};

export function OutOfStockProducts({ products }: OutOfStockProductsProp) {
  return (
    <Card className="border-rose-200 dark:border-rose-800/40">
      <CardHeader className="p-3 pb-2 border-b bg-rose-50/50 dark:bg-rose-950/20">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-rose-800 dark:text-rose-300">
          <span>Out of Stock</span>
          <XCircle className="h-4 w-4 text-rose-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-[14vh] pr-2">
          {products.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-6 text-center">
              No products currently out of stock
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {products.map((item, index) => (
                <div key={item.id || index} className="flex justify-between items-center text-sm">
                  <span className="truncate pr-2 text-foreground">
                    <span className="font-semibold text-muted-foreground mr-1.5">{index + 1}.</span>
                    {item.name}
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300">
                    0 left
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
