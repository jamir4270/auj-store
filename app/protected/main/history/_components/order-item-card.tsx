import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistoryOrderItem } from "@/lib/models";
import { twoDecimal } from "@/lib/utils";

type OrderItemProp = {
  orderItem: HistoryOrderItem;
};

export function OrderItemCard({ orderItem }: OrderItemProp) {
  return (
    <Card>
      <CardHeader className="flex flex-row">
        <CardTitle className="text-2xl p-0">{orderItem.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row justify-between">
        <div>
          <div className="flex flex-row gap-2">
            <p>Category: </p>
            <p>{orderItem.category}</p>
          </div>
          <div className="flex flex-row gap-2">
            <p>Price: </p>
            <p>{twoDecimal(orderItem.unit_price_at_sale)}</p>
          </div>
          <div className="flex flex-row gap-2">
            <p>Amount: </p>
            <p>{orderItem.quantity}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-center">Total</div>
          <div className="text-3xl">2{twoDecimal(orderItem.subtotal)}</div>
        </div>
      </CardContent>
      <CardFooter>{orderItem.created_at}</CardFooter>
    </Card>
  );
}
