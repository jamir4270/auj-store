"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Product } from "@/types/domain";
import { addStock, deleteProduct } from "@/lib/actions/inventory.actions";
import { toast } from "sonner";
import { EditProductForm } from "./forms";
import { useState } from "react";

export type ProductActionsProp = {
  product: Product;
  categories?: string[];
};

export function AddStock({ product }: ProductActionsProp) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddStockSubmit(formData: FormData) {
    const amount = parseInt(formData.get("stock") as string);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid stock amount greater than 0");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Adding stock to product...");

    try {
      const result = await addStock({ id: product.id, amount });
      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error || "Failed to add stock.");
        return;
      }

      toast.success(`Successfully added ${amount} items to ${product.name}!`);
      setOpen(false);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : "Failed to add stock.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleAddStockSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Add Stock: {product.name}</DialogTitle>
            <DialogDescription>
              Increase available stock quantity in inventory.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="stock">Quantity to Add</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                defaultValue={1}
                min={1}
                required
                autoFocus
              />
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  "Confirm Stock"
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditProduct({ product, categories = [] }: ProductActionsProp) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full gap-3">
        <SheetHeader>
          <SheetTitle>Edit Product: {product.name}</SheetTitle>
          <SheetDescription>
            Modify details, pricing, and threshold alerts.
          </SheetDescription>
        </SheetHeader>
        <div className="h-full flex flex-col p-2 pt-0">
          <EditProductForm
            product={product}
            categories={categories}
            onSuccess={() => setOpen(false)}
          />
          <SheetFooter className="flex p-0 gap-0 mt-3">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DeleteProduct({ product }: ProductActionsProp) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteProduct() {
    setIsDeleting(true);
    const loadingToast = toast.loading(`Deleting ${product.name}...`);

    try {
      const result = await deleteProduct(product.id);
      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.error || "Failed to delete product.");
        return;
      }

      toast.success(`Successfully deleted ${product.name}`);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err instanceof Error ? err.message : "Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Products linked to past sales transactions cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-rose-600 text-white hover:bg-rose-700"
            onClick={handleDeleteProduct}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Product"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
