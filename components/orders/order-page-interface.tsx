"use client";

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order, ProductAtSale } from "@/types/domain";
import { formatPHP } from "@/lib/utils/currency";
import { getStockStatusMetadata } from "@/lib/utils/stock-status";
import { useDebounce } from "@/hooks/use-debounce";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { submitNewOrder } from "@/lib/actions/orders.actions";
import { cn } from "@/lib/utils";

type OrderProps = {
  products: ProductAtSale[];
};

export function OrderInterface({ products }: OrderProps) {
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderList, setOrderList] = useState<ProductAtSale[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 200);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => {
      const nameMatch = (product.name || "").toLowerCase().includes(query);
      const catMatch = (product.category || "").toLowerCase().includes(query);
      return nameMatch || catMatch;
    });
  }, [products, debouncedSearch]);

  const orderSummary = useMemo(() => {
    return orderList.reduce(
      (acc, item) => {
        const qty = item.amount ?? 1;
        const price = item.price ?? 0;
        const cost = item.cost ?? 0;
        const subtotal = price * qty;
        const profit = (price - cost) * qty;
        return {
          total: acc.total + subtotal,
          totalProfit: acc.totalProfit + profit,
        };
      },
      { total: 0, totalProfit: 0 }
    );
  }, [orderList]);

  const handleOrderListUpdate = (newList: ProductAtSale[]) => {
    setOrderList(newList);
  };

  const handleCheckout = async () => {
    if (orderList.length === 0 || orderSummary.total === 0) return;

    setIsSubmitting(true);
    const orderPayload: Partial<Order> = {
      total: orderSummary.total,
      status: "complete",
      total_profit: orderSummary.totalProfit,
      partial_payment: null,
    };

    const loadingToast = toast.loading("Processing order checkout...");

    try {
      const result = await submitNewOrder(orderPayload, orderList);

      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error || "Checkout failed. Please review items.");
        return;
      }

      toast.success("Order processed successfully!", {
        description: `Total: ${formatPHP(orderSummary.total)}`,
      });

      // Clear cart
      setOrderList([]);
      setIsOrdering(false);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      {/* Product Catalog Column */}
      <div className="flex flex-col flex-1 gap-4">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-sm text-muted-foreground">Select products to record an order</p>
          </div>
          <Button
            onClick={() => setIsOrdering(true)}
            disabled={isOrdering || orderList.length === 0}
            className="gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Active Cart ({orderList.length})
          </Button>
        </div>

        <Card className="flex flex-col flex-1">
          <CardHeader className="p-4 pb-2">
            <Input
              type="search"
              placeholder="Search products by name or category..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </CardHeader>
          <CardContent className="p-4 pt-2 flex-1">
            <ScrollArea className="h-[calc(100vh-280px)]">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No products found matching &ldquo;{searchInput}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pr-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      orderList={orderList}
                      onSelect={(prod) => {
                        setIsOrdering(true);
                        const exists = orderList.some((item) => item.id === prod.id);
                        if (!exists) {
                          const price = prod.price ?? 0;
                          const cost = prod.cost ?? 0;
                          setOrderList((prev) => [
                            ...prev,
                            {
                              ...prod,
                              amount: 1,
                              subtotal: price,
                              profit: price - cost,
                            },
                          ]);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout Column */}
      {isOrdering && (
        <div className="w-full lg:w-96 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
          <Card className="flex flex-col h-[calc(100vh-140px)]">
            <CardHeader className="p-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold">Current Order</CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {orderList.length} items
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex-1 min-h-0">
              <ScrollArea className="h-full p-4">
                {orderList.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    Your cart is empty. Click a product to add it.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {orderList.map((item) => (
                      <OrderItemCard
                        key={item.id}
                        product={item}
                        orderList={orderList}
                        updateProductList={handleOrderListUpdate}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 p-4 border-t bg-muted/20">
              <div className="flex justify-between items-center w-full">
                <span className="text-muted-foreground font-medium">Order Total:</span>
                <span className="text-2xl font-bold tracking-tight">
                  {formatPHP(orderSummary.total)}
                </span>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setOrderList([]);
                    setIsOrdering(false);
                  }}
                  disabled={isSubmitting}
                >
                  Clear
                </Button>
                <Button
                  className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={handleCheckout}
                  disabled={isSubmitting || orderList.length === 0 || orderSummary.total === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Sale
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  orderList,
  onSelect,
}: {
  product: ProductAtSale;
  orderList: ProductAtSale[];
  onSelect: (product: ProductAtSale) => void;
}) {
  const isSelected = orderList.some((item) => item.id === product.id);
  const statusMeta = getStockStatusMetadata(product.status || "in_stock");
  const isOutOfStock = (product.quantity || 0) <= 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md border",
        isOutOfStock && "opacity-50 cursor-not-allowed bg-muted/40",
        isSelected && !isOutOfStock && "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/20"
      )}
      onClick={() => {
        if (!isOutOfStock) {
          onSelect(product);
        }
      }}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h4 className="font-semibold text-sm truncate">{product.name || "Unnamed Product"}</h4>
            <p className="text-xs text-muted-foreground">{product.category || "Uncategorized"}</p>
          </div>
          <span className="font-bold text-sm shrink-0">{formatPHP(product.price)}</span>
        </div>
      </CardHeader>
      <CardFooter className="p-3 pt-0 flex justify-between items-center text-xs">
        <span className={cn("px-2 py-0.5 rounded-full border text-[11px] font-medium", statusMeta.className)}>
          {statusMeta.label}
        </span>
        <span className="text-muted-foreground font-mono">Stock: {product.quantity || 0}</span>
      </CardFooter>
    </Card>
  );
}

function OrderItemCard({
  product,
  orderList,
  updateProductList,
}: {
  product: ProductAtSale;
  orderList: ProductAtSale[];
  updateProductList: (newList: ProductAtSale[]) => void;
}) {
  const amount = product.amount ?? 1;
  const price = product.price ?? 0;
  const cost = product.cost ?? 0;
  const maxStock = product.quantity || 0;

  const handleQtyChange = (newQty: number) => {
    const validQty = Math.max(1, Math.min(maxStock, newQty));
    const updated = orderList.map((item) => {
      if (item.id === product.id) {
        const itemPrice = item.price ?? 0;
        const itemCost = item.cost ?? 0;
        return {
          ...item,
          amount: validQty,
          subtotal: itemPrice * validQty,
          profit: (itemPrice - itemCost) * validQty,
        };
      }
      return item;
    });
    updateProductList(updated);
  };

  const handleRemove = () => {
    updateProductList(orderList.filter((item) => item.id !== product.id));
  };

  return (
    <div className="flex flex-col gap-2 p-3 border rounded-lg bg-card text-card-foreground shadow-xs">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{product.name || "Unnamed Product"}</p>
          <p className="text-xs text-muted-foreground">
            {formatPHP(price)} each
          </p>
        </div>
        <span className="font-bold text-sm">
          {formatPHP(price * amount)}
        </span>
      </div>

      <div className="flex justify-between items-center pt-1 border-t">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQtyChange(amount - 1)}
            disabled={amount <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <Input
            type="number"
            min={1}
            max={maxStock}
            value={amount}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) {
                handleQtyChange(val);
              }
            }}
            className="h-7 w-12 text-center text-xs p-0 font-mono"
          />

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQtyChange(amount + 1)}
            disabled={amount >= maxStock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
          onClick={handleRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
