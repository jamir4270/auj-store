import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrderItem } from "@/lib/models";

type OrderItemProp = {
  orderItem: OrderItem;
};

export function OrderItemCard({ orderItem }: OrderItemProp) {
  return (
    <Card>
      <CardHeader className="flex flex-row">
        <CardTitle className="text-2xl p-0">{`Notebook (Big)`}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row justify-between">
        <div>
          <div className="flex flex-row gap-2">
            <p>Category: </p>
            <p>School Supplies</p>
          </div>
          <div className="flex flex-row gap-2">
            <p>Price: </p>
            <p>10.00</p>
          </div>
          <div className="flex flex-row gap-2">
            <p>Amount: </p>
            <p>2</p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-center">Total</div>
          <div className="text-3xl">20.00</div>
        </div>
      </CardContent>
      <CardFooter>{`Date: 2025-01-03 05:00 PM`}</CardFooter>
    </Card>
  );
}
