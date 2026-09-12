"use client";

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order, ProductAtSale } from "@/types/domain";
import { formatPHP } from "@/lib/utils/currency";
import { getStockStatusMetadata } from "@/lib/utils/stock-status";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  Camera,
  ScanLine,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { submitNewOrder } from "@/lib/actions/orders.actions";
import { cn } from "@/lib/utils";
import { useBarcodeScanner, playScanSound } from "@/hooks/use-barcode-scanner";
import { CameraScannerModal } from "@/components/ui/camera-scanner-modal";
import { QuickRegisterModal } from "@/components/inventory/quick-register-modal";
import { lookupBarcodeDetails, BarcodeLookupResult } from "@/lib/services/barcode-lookup.service";

type OrderProps = {
  products: ProductAtSale[];
};

export function OrderInterface({ products: initialProducts }: OrderProps) {
  const [productList, setProductList] = useState<ProductAtSale[]>(initialProducts);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderList, setOrderList] = useState<ProductAtSale[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 200);

  // Barcode & Scanner States
  const [scanMode, setScanMode] = useState<"add" | "deduct">("add");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [activeScannedBarcode, setActiveScannedBarcode] = useState("");
  const [activeLookupResult, setActiveLookupResult] = useState<BarcodeLookupResult | null>(null);

  // Extract unique categories for quick register modal
  const existingCategories = useMemo(() => {
    const cats = productList
      .map((p) => p.category)
      .filter((c): c is string => Boolean(c));
    return [...new Set(cats)];
  }, [productList]);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return productList;
    return productList.filter((product) => {
      const nameMatch = (product.name || "").toLowerCase().includes(query);
      const catMatch = (product.category || "").toLowerCase().includes(query);
      const barcodeMatch = (product.barcode || "").toLowerCase().includes(query);
      return nameMatch || catMatch || barcodeMatch;
    });
  }, [productList, debouncedSearch]);

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

  // Add or increment a product in cart
  const handleAddToCart = useCallback((prod: ProductAtSale) => {
    const availableStock = prod.quantity || 0;
    if (availableStock <= 0) {
      playScanSound("warning");
      toast.warning(`"${prod.name}" is currently out of stock!`);
      return;
    }

    setIsOrdering(true);
    setOrderList((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (existing) {
        const currentQty = existing.amount ?? 1;
        if (currentQty >= availableStock) {
          playScanSound("warning");
          toast.warning(`Maximum stock reached for "${prod.name}" (${availableStock} in inventory).`);
          return prev;
        }
        const updatedQty = currentQty + 1;
        const price = existing.price ?? 0;
        const cost = existing.cost ?? 0;
        toast.info(`Increased "${prod.name}" quantity to ${updatedQty}`);
        return prev.map((item) =>
          item.id === prod.id
            ? {
                ...item,
                amount: updatedQty,
                subtotal: price * updatedQty,
                profit: (price - cost) * updatedQty,
              }
            : item
        );
      } else {
        const price = prod.price ?? 0;
        const cost = prod.cost ?? 0;
        toast.success(`Added "${prod.name}" to cart`);
        return [
          ...prev,
          {
            ...prod,
            amount: 1,
            subtotal: price,
            profit: price - cost,
          },
        ];
      }
    });
  }, []);

  // Deduct or remove product from cart
  const handleDeductFromCart = useCallback((prod: ProductAtSale) => {
    setOrderList((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (!existing) {
        playScanSound("warning");
        toast.info(`"${prod.name}" is not in the active cart.`);
        return prev;
      }

      const currentQty = existing.amount ?? 1;
      if (currentQty <= 1) {
        toast.info(`Removed "${prod.name}" from cart`);
        return prev.filter((item) => item.id !== prod.id);
      } else {
        const updatedQty = currentQty - 1;
        const price = existing.price ?? 0;
        const cost = existing.cost ?? 0;
        toast.info(`Decreased "${prod.name}" quantity to ${updatedQty}`);
        return prev.map((item) =>
          item.id === prod.id
            ? {
                ...item,
                amount: updatedQty,
                subtotal: price * updatedQty,
                profit: (price - cost) * updatedQty,
              }
            : item
        );
      }
    });
  }, []);

  // Contextual Barcode Handler (POS checkout)
  const handleBarcodeScan = useCallback(
    async (scannedCode: string) => {
      const cleanCode = scannedCode.trim();
      if (!cleanCode) return;

      // 1. Tier 1: Local Product Match
      const localMatch = productList.find(
        (p) => p.barcode && p.barcode.trim() === cleanCode
      );

      if (localMatch) {
        if (scanMode === "add") {
          handleAddToCart(localMatch);
        } else {
          handleDeductFromCart(localMatch);
        }
        return;
      }

      // 2. Tier 2 & 3: Unknown Barcode -> Trigger 3rd-Party Lookup
      playScanSound("warning");
      const lookupToast = toast.loading(`Looking up new barcode "${cleanCode}"...`);

      try {
        const lookupResult = await lookupBarcodeDetails(cleanCode);
        toast.dismiss(lookupToast);

        setActiveScannedBarcode(cleanCode);
        setActiveLookupResult(lookupResult);
        setIsQuickRegisterOpen(true);
      } catch {
        toast.dismiss(lookupToast);
        setActiveScannedBarcode(cleanCode);
        setActiveLookupResult(null);
        setIsQuickRegisterOpen(true);
      }
    },
    [productList, scanMode, handleAddToCart, handleDeductFromCart]
  );

  // Hardware Scanner Hook listener
  useBarcodeScanner({
    onScan: handleBarcodeScan,
    enabled: !isQuickRegisterOpen && !isCameraOpen,
    ignoreInInputs: true,
  });

  // Callback when a newly scanned unknown product is saved
  const handleQuickProductRegistered = (newProduct: ProductAtSale) => {
    // Add to local product catalog
    setProductList((prev) => [newProduct, ...prev]);
    // Automatically add to active cart
    handleAddToCart(newProduct);
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

      // Update local product inventory quantities
      setProductList((prev) =>
        prev.map((p) => {
          const soldItem = orderList.find((item) => item.id === p.id);
          if (soldItem) {
            const soldQty = soldItem.amount ?? 1;
            const newQty = Math.max(0, (p.quantity || 0) - soldQty);
            return { ...p, quantity: newQty };
          }
          return p;
        })
      );

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
        {/* Header with Scan controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Point of Sale</h1>
            <p className="text-sm text-muted-foreground">Scan or select products for customer checkout</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Scan Action Mode Toggle (Add vs Deduct) */}
            <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setScanMode("add")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all",
                  scanMode === "add"
                    ? "bg-emerald-600 text-white shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Barcode scans will add item to cart"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setScanMode("deduct")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all",
                  scanMode === "deduct"
                    ? "bg-rose-600 text-white shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Barcode scans will deduct item from cart"
              >
                <MinusCircle className="h-3.5 w-3.5" />
                <span>Deduct Mode</span>
              </button>
            </div>

            {/* Camera Scanner Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCameraOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Camera className="h-4 w-4 text-primary" />
              <span>Camera Scan</span>
            </Button>

            {/* Cart drawer/toggle */}
            <Button
              onClick={() => setIsOrdering(true)}
              disabled={isOrdering || orderList.length === 0}
              className="gap-2 text-xs"
              size="sm"
            >
              <ShoppingBag className="h-4 w-4" />
              Active Cart ({orderList.length})
            </Button>
          </div>
        </div>

        <Card className="flex flex-col flex-1">
          <CardHeader className="p-4 pb-2">
            <div className="relative">
              <ScanLine className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name, category, or barcode..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9"
              />
            </div>
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
                        if (scanMode === "add") {
                          handleAddToCart(prod);
                        } else {
                          handleDeductFromCart(prod);
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
                    Your cart is empty. Scan or select products to add.
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

      {/* Camera Viewfinder Modal */}
      <CameraScannerModal
        open={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onScan={handleBarcodeScan}
        title="POS Camera Scanner"
        description="Point camera at product barcode to add/deduct from cart."
      />

      {/* 3-Tier Rapid Registration Modal */}
      <QuickRegisterModal
        open={isQuickRegisterOpen}
        onOpenChange={setIsQuickRegisterOpen}
        barcode={activeScannedBarcode}
        lookupData={activeLookupResult}
        categories={existingCategories}
        onSuccess={handleQuickProductRegistered}
        context="pos"
      />
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
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">{product.category || "Uncategorized"}</span>
              {product.barcode && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                  {product.barcode}
                </span>
              )}
            </div>
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{formatPHP(price)} each</span>
            {product.barcode && (
              <span className="text-[10px] font-mono text-muted-foreground">({product.barcode})</span>
            )}
          </div>
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
