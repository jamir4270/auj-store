"use client";

import { useMemo, useState, useCallback } from "react";
import { getColumns } from "./product-columns";
import { ProductsTable } from "./products-table";
import { Product } from "@/types/domain";
import { useBarcodeScanner, playScanSound } from "@/hooks/use-barcode-scanner";
import { CameraScannerModal } from "@/components/ui/camera-scanner-modal";
import { QuickRegisterModal } from "@/components/inventory/quick-register-modal";
import { lookupBarcodeDetails, BarcodeLookupResult } from "@/lib/services/barcode-lookup.service";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addStock } from "@/lib/actions/inventory.actions";
import { Loader2 } from "lucide-react";

interface ProductsTableProps {
  products: Product[];
  categories: string[];
}

export function ProductsTableWrapper({
  products: initialProducts,
  categories,
}: ProductsTableProps) {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Quick Restock Dialog State (when existing barcode is scanned)
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(1);
  const [isRestocking, setIsRestocking] = useState(false);

  // Quick Register Modal State (when unknown barcode is scanned)
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [activeBarcode, setActiveBarcode] = useState("");
  const [activeLookupResult, setActiveLookupResult] = useState<BarcodeLookupResult | null>(null);

  const columns = useMemo(() => getColumns(categories), [categories]);

  const handleBarcodeScanned = useCallback(
    async (scannedCode: string) => {
      const cleanCode = scannedCode.trim();
      if (!cleanCode) return;

      // 1. Local Inventory Match -> Open Quick Restock Modal
      const localMatch = productList.find(
        (p) => p.barcode && p.barcode.trim() === cleanCode
      );

      if (localMatch) {
        playScanSound("success");
        setRestockProduct(localMatch);
        setRestockAmount(1);
        toast.info(`Found "${localMatch.name}". Enter restock amount.`);
        return;
      }

      // 2. Unknown Barcode -> Lookup 3rd-party
      playScanSound("warning");
      const loadingToast = toast.loading(`Looking up barcode "${cleanCode}"...`);

      try {
        const lookupResult = await lookupBarcodeDetails(cleanCode);
        toast.dismiss(loadingToast);

        setActiveBarcode(cleanCode);
        setActiveLookupResult(lookupResult);
        setIsQuickRegisterOpen(true);
      } catch {
        toast.dismiss(loadingToast);
        setActiveBarcode(cleanCode);
        setActiveLookupResult(null);
        setIsQuickRegisterOpen(true);
      }
    },
    [productList]
  );

  // Hardware scanner listener on Inventory screen
  useBarcodeScanner({
    onScan: handleBarcodeScanned,
    enabled: !restockProduct && !isQuickRegisterOpen && !isCameraOpen,
    ignoreInInputs: true,
  });

  async function handleRestockSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restockProduct) return;

    if (!restockAmount || restockAmount <= 0) {
      toast.error("Please enter a valid restock quantity greater than 0");
      return;
    }

    setIsRestocking(true);
    const loadingToast = toast.loading(`Adding ${restockAmount} to ${restockProduct.name}...`);

    try {
      const result = await addStock({ id: restockProduct.id, amount: restockAmount });
      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error || "Failed to add stock.");
        return;
      }

      toast.success(`Successfully added ${restockAmount} items to ${restockProduct.name}!`);

      // Update local product quantity
      setProductList((prev) =>
        prev.map((p) =>
          p.id === restockProduct.id
            ? { ...p, quantity: (p.quantity || 0) + restockAmount }
            : p
        )
      );

      setRestockProduct(null);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : "Failed to add stock.");
    } finally {
      setIsRestocking(false);
    }
  }

  const handleQuickRegisterSuccess = (newProduct: Product) => {
    setProductList((prev) => [newProduct, ...prev]);
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCameraOpen(true)}
          className="gap-1.5 text-xs"
        >
          <Camera className="h-4 w-4 text-primary" />
          <span>Scan to Restock</span>
        </Button>
      </div>

      <ProductsTable columns={columns} data={productList} />

      {/* Camera Scanner Viewfinder */}
      <CameraScannerModal
        open={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onScan={handleBarcodeScanned}
        title="Restock Camera Scanner"
        description="Point camera at product barcode to restock or register new item."
      />

      {/* Quick Restock Dialog */}
      <Dialog
        open={Boolean(restockProduct)}
        onOpenChange={(open) => !open && setRestockProduct(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleRestockSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Quick Restock: {restockProduct?.name}</DialogTitle>
              <DialogDescription>
                Barcode: <span className="font-mono font-semibold">{restockProduct?.barcode}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 py-2">
              <div className="flex justify-between items-center text-xs p-2 bg-muted rounded">
                <span>Current Stock in Store:</span>
                <span className="font-bold">{restockProduct?.quantity || 0} units</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="inventory-restock-qty" className="text-xs">
                  Quantity to Add
                </Label>
                <Input
                  id="inventory-restock-qty"
                  type="number"
                  min={1}
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value) || 1)}
                  autoFocus
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isRestocking}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isRestocking}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isRestocking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Updating...
                  </>
                ) : (
                  "Confirm Restock"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Register Modal for unknown scanned barcodes */}
      <QuickRegisterModal
        open={isQuickRegisterOpen}
        onOpenChange={setIsQuickRegisterOpen}
        barcode={activeBarcode}
        lookupData={activeLookupResult}
        categories={categories}
        onSuccess={handleQuickRegisterSuccess}
        context="inventory"
      />
    </>
  );
}
