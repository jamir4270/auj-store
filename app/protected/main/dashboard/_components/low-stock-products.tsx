import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/models";
import { ScrollArea } from "@/components/ui/scroll-area";

type LowStockProductsProp = {
  products: Product[];
};

export function LowStockProducts({ products }: LowStockProductsProp) {
  return (
    <Card className="border-orange-500">
      <CardHeader>
        <CardTitle className="text-center">Low Stock Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="flex flex-col gap-2 h-[18vh] pr-3">
          {products.map((item, index) => {
            return (
              <div key={item.id} className="flex flex-row justify-between">
                <p>{`${index + 1}. ${item.name}`}</p>
                <p>{item.quantity}</p>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
