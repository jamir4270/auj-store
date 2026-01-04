import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/models";
import { ScrollArea } from "@/components/ui/scroll-area";

type OutOfStockProductsProp = {
  products: Product[];
};

export function OutOfStockProducts({ products }: OutOfStockProductsProp) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Out of Stock Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="flex flex-col gap-2 h-[18vh]">
          {products.map((item, index) => {
            return (
              <div key={item.id}>
                <p>{`${index + 1}. ${item.name}`}</p>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
