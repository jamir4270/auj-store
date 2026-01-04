import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type TopProductsProp = {
  products: { name: string; count: number }[];
};

export function TopProducts({ products }: TopProductsProp) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Top 5 Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="flex flex-col gap-2 h-[18vh]">
          {products.map((item, index) => {
            return (
              <div key={item.name} className="flex flex-row justify-between">
                <p>{`${index + 1}. ${item.name}`}</p>
                <p>{item.count}</p>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
