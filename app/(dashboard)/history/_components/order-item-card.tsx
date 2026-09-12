import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistoryOrderItem } from "@/types/domain";
import { formatPHP } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils";

type OrderItemProp = {
  orderItem: HistoryOrderItem;
};

export function OrderItemCard({ orderItem }: OrderItemProp) {
  return (
    <Card className="hover:shadow-xs transition-shadow">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{orderItem.name}</CardTitle>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted font-medium">
          {orderItem.category}
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-1 flex flex-row justify-between items-center">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Unit Price: <span className="font-medium text-foreground">{formatPHP(orderItem.unit_price_at_sale)}</span>
          </p>
          <p>
            Quantity: <span className="font-medium text-foreground">{orderItem.quantity}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Subtotal</div>
          <div className="text-2xl font-bold text-foreground">{formatPHP(orderItem.subtotal)}</div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground border-t mt-2 pt-2">
        {orderItem.created_at ? formatDate(new Date(orderItem.created_at)) : "—"}
      </CardFooter>
    </Card>
  );
}
