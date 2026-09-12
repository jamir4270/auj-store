"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Product } from "@/types/domain";
import { addProduct, editProduct } from "@/lib/actions/inventory.actions";
import { ProductSchema } from "@/lib/validators/product.schema";
import { toast } from "sonner";
import { Loader2, Camera, ScanLine } from "lucide-react";
import { CameraScannerModal } from "@/components/ui/camera-scanner-modal";

type ProductCategoryProp = {
  categories: string[];
  onSuccess?: () => void;
};

type EditProductProp = {
  product: Product;
} & ProductCategoryProp;

export function EditProductForm({ product, categories, onSuccess }: EditProductProp) {
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(product.category || "");
  const [barcode, setBarcode] = useState(product.barcode || "");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEditProduct(formData: FormData) {
    const rawCategory = isNewCategory
      ? (formData.get("new_category") as string)
      : selectedCategory;

    const payload = {
      id: product.id,
      barcode: barcode.trim() || null,
      name: formData.get("name"),
      category: rawCategory,
      quantity: formData.get("quantity"),
      stock_threshold: formData.get("stock_threshold"),
      cost: formData.get("cost"),
      price: formData.get("price"),
    };

    const parsed = ProductSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please fix validation errors.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating product details...");

    try {
      const result = await editProduct(parsed.data);
      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error || "Failed to update product.");
        return;
      }

      toast.success("Successfully updated product!");
      onSuccess?.();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : "Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form action={handleEditProduct} className="flex flex-col h-full justify-between gap-4">
        <FieldGroup className="flex flex-col gap-3">
          <FieldSet>
            <Field className="gap-1">
              <div className="flex justify-between items-center">
                <FieldLabel htmlFor="barcode">Barcode (Optional)</FieldLabel>
                <span className="text-[11px] text-muted-foreground">Optional for loose/repacked goods</span>
              </div>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <ScanLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="barcode"
                    name="barcode"
                    type="text"
                    placeholder="Scan or enter barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="pl-8 font-mono text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCameraOpen(true)}
                  title="Scan with Camera"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </Field>

            <Field className="gap-1 mt-3">
              <FieldLabel htmlFor="name">Product Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={product.name ?? ""}
                required
              />
            </Field>

            <Field className="gap-1 mt-3">
              <div className="flex flex-row justify-between items-center mb-1">
                <FieldLabel htmlFor="category">Category</FieldLabel>
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
                  id="new_category"
                  name="new_category"
                  type="text"
                  placeholder="Enter new category name"
                  required
                />
              ) : (
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
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

            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field className="gap-1">
                <FieldLabel htmlFor="quantity">Current Stock</FieldLabel>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  defaultValue={product.quantity ?? 0}
                  required
                />
              </Field>

              <Field className="gap-1">
                <FieldLabel htmlFor="stock_threshold">Alert Threshold</FieldLabel>
                <Input
                  id="stock_threshold"
                  name="stock_threshold"
                  type="number"
                  min={0}
                  defaultValue={product.stock_threshold ?? 5}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field className="gap-1">
                <FieldLabel htmlFor="cost">Unit Cost (₱)</FieldLabel>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={product.cost ?? 0}
                  required
                />
              </Field>

              <Field className="gap-1">
                <FieldLabel htmlFor="price">Selling Price (₱)</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={product.price ?? 0}
                  required
                />
              </Field>
            </div>
          </FieldSet>
        </FieldGroup>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-4">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>

      <CameraScannerModal
        open={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onScan={(scanned) => {
          setBarcode(scanned);
          toast.success(`Scanned barcode: ${scanned}`);
        }}
        title="Scan Barcode for Product"
      />
    </>
  );
}

export function AddNewProductForm({ categories, onSuccess }: ProductCategoryProp) {
  const [isNewCategory, setIsNewCategory] = useState(categories.length === 0);
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");
  const [barcode, setBarcode] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddProduct(formData: FormData) {
    const rawCategory = isNewCategory
      ? (formData.get("new_category") as string)
      : selectedCategory;

    const payload = {
      barcode: barcode.trim() || null,
      name: formData.get("name"),
      category: rawCategory,
      quantity: formData.get("quantity"),
      stock_threshold: formData.get("stock_threshold"),
      cost: formData.get("cost"),
      price: formData.get("price"),
    };

    const parsed = ProductSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please fix validation errors.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Adding new product...");

    try {
      const result = await addProduct(parsed.data);
      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error || "Failed to add product.");
        return;
      }

      toast.success("Successfully added new product!");
      onSuccess?.();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : "Failed to add product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form action={handleAddProduct} className="flex flex-col h-full justify-between gap-4">
        <FieldGroup className="flex flex-col gap-3">
          <FieldSet>
            <Field className="gap-1">
              <div className="flex justify-between items-center">
                <FieldLabel htmlFor="new-barcode">Barcode (Optional)</FieldLabel>
                <span className="text-[11px] text-muted-foreground">Optional for loose/repacked goods</span>
              </div>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <ScanLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-barcode"
                    name="barcode"
                    type="text"
                    placeholder="Scan or enter barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="pl-8 font-mono text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCameraOpen(true)}
                  title="Scan with Camera"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </Field>

            <Field className="gap-1 mt-3">
              <FieldLabel htmlFor="new-name">Product Name</FieldLabel>
              <Input
                id="new-name"
                name="name"
                type="text"
                placeholder="e.g. Spiral Notebook 80L"
                required
              />
            </Field>

            <Field className="gap-1 mt-3">
              <div className="flex flex-row justify-between items-center mb-1">
                <FieldLabel htmlFor="new-category-select">Category</FieldLabel>
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
                  id="new_category"
                  name="new_category"
                  type="text"
                  placeholder="Enter new category name"
                  required
                />
              ) : (
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="new-category-select">
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

            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field className="gap-1">
                <FieldLabel htmlFor="new-quantity">Initial Stock</FieldLabel>
                <Input
                  id="new-quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  defaultValue={0}
                  required
                />
              </Field>

              <Field className="gap-1">
                <FieldLabel htmlFor="new-threshold">Alert Threshold</FieldLabel>
                <Input
                  id="new-threshold"
                  name="stock_threshold"
                  type="number"
                  min={0}
                  defaultValue={5}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field className="gap-1">
                <FieldLabel htmlFor="new-cost">Unit Cost (₱)</FieldLabel>
                <Input
                  id="new-cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  required
                />
              </Field>

              <Field className="gap-1">
                <FieldLabel htmlFor="new-price">Selling Price (₱)</FieldLabel>
                <Input
                  id="new-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  required
                />
              </Field>
            </div>
          </FieldSet>
        </FieldGroup>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-primary">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating Product...
            </>
          ) : (
            "Add Product"
          )}
        </Button>
      </form>

      <CameraScannerModal
        open={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onScan={(scanned) => {
          setBarcode(scanned);
          toast.success(`Scanned barcode: ${scanned}`);
        }}
        title="Scan Barcode for New Product"
      />
    </>
  );
}
