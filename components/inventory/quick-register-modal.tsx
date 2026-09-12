"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/types/domain";
import { quickCreateAndSellProduct } from "@/lib/actions/inventory.actions";
import { BarcodeLookupResult } from "@/lib/services/barcode-lookup.service";
import { toast } from "sonner";
import { Loader2, Sparkles, PlusCircle } from "lucide-react";

interface QuickRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barcode: string;
  lookupData?: BarcodeLookupResult | null;
  categories: string[];
  onSuccess: (newProduct: Product) => void;
  context?: "pos" | "inventory";
}

export function QuickRegisterModal({
  open,
  onOpenChange,
  barcode,
  lookupData,
  categories,
  onSuccess,
  context = "pos",
}: QuickRegisterModalProps) {
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "General");
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [stockThreshold, setStockThreshold] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (lookupData && lookupData.found) {
        setName(lookupData.name || "");
        if (lookupData.category) {
          // If category exists in store categories, select it; otherwise mark as new
          const matched = categories.find(
            (c) => c.toLowerCase() === lookupData.category?.toLowerCase()
          );
          if (matched) {
            setSelectedCategory(matched);
            setIsNewCategory(false);
          } else {
            setIsNewCategory(true);
            setNewCategoryName(lookupData.category);
          }
        }
      } else {
        setName("");
        setIsNewCategory(categories.length === 0);
        setSelectedCategory(categories[0] || "General");
        setNewCategoryName("");
      }
      setCost("");
      setPrice("");
      setQuantity(context === "pos" ? "10" : "20");
    }
  }, [open, lookupData, categories, context]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const finalCategory = isNewCategory ? newCategoryName.trim() : selectedCategory;
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!finalCategory) {
      toast.error("Category is required.");
      return;
    }

    const costNum = parseFloat(cost) || 0;
    const priceNum = parseFloat(price) || 0;
    const qtyNum = parseInt(quantity) || 0;
    const thresholdNum = parseInt(stockThreshold) || 5;

    if (priceNum <= 0) {
      toast.error("Selling price must be greater than 0.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Registering new product...");

    try {
      const payload = {
        barcode: barcode.trim(),
        name: name.trim(),
        category: finalCategory,
        quantity: qtyNum,
        stock_threshold: thresholdNum,
        cost: costNum,
        price: priceNum,
      };

      const result = await quickCreateAndSellProduct(payload);
      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error || "Failed to register product.");
        return;
      }

      toast.success(
        context === "pos"
          ? `Registered "${result.data.name}" & added to cart!`
          : `Registered "${result.data.name}" in inventory!`
      );

      onOpenChange(false);
      onSuccess(result.data);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                {lookupData?.found ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
              </div>
              <DialogTitle className="text-base font-bold">
                {lookupData?.found ? "New Item Identified" : "Quick Register Product"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            {lookupData?.found
              ? "Product information was auto-fetched. Set the price and stock to continue."
              : `Barcode "${barcode}" is new. Enter details to register it instantly.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
          <FieldGroup className="flex flex-col gap-2.5">
            <FieldSet>
              <div className="bg-muted/50 rounded-md p-2.5 flex items-center justify-between text-xs border">
                <span className="text-muted-foreground font-medium">Barcode:</span>
                <span className="font-mono font-bold tracking-wider">{barcode}</span>
              </div>

              <Field className="gap-1 mt-2">
                <FieldLabel htmlFor="quick-name" className="text-xs">Product Name</FieldLabel>
                <Input
                  id="quick-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lucky Me Pancit Canton Kalamansi"
                  autoFocus
                  required
                />
              </Field>

              <Field className="gap-1 mt-2">
                <div className="flex flex-row justify-between items-center mb-1">
                  <FieldLabel htmlFor="quick-category" className="text-xs">Category</FieldLabel>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>New Category</span>
                    <Switch
                      checked={isNewCategory}
                      onCheckedChange={setIsNewCategory}
                    />
                  </div>
                </div>

                {isNewCategory ? (
                  <Input
                    id="quick-new-category"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                ) : (
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger id="quick-category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat, idx) => (
                        <SelectItem key={idx} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-2.5 mt-2">
                <Field className="gap-1">
                  <FieldLabel htmlFor="quick-cost" className="text-xs">Cost (₱)</FieldLabel>
                  <Input
                    id="quick-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </Field>

                <Field className="gap-1">
                  <FieldLabel htmlFor="quick-price" className="text-xs">Selling Price (₱) *</FieldLabel>
                  <Input
                    id="quick-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-2">
                <Field className="gap-1">
                  <FieldLabel htmlFor="quick-qty" className="text-xs">Initial Stock</FieldLabel>
                  <Input
                    id="quick-qty"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </Field>

                <Field className="gap-1">
                  <FieldLabel htmlFor="quick-thresh" className="text-xs">Alert Threshold</FieldLabel>
                  <Input
                    id="quick-thresh"
                    type="number"
                    min="0"
                    value={stockThreshold}
                    onChange={(e) => setStockThreshold(e.target.value)}
                    required
                  />
                </Field>
              </div>
            </FieldSet>
          </FieldGroup>

          <div className="flex items-center justify-end gap-2 pt-3 border-t mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : context === "pos" ? (
                "Save & Add to Sale"
              ) : (
                "Save to Inventory"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
