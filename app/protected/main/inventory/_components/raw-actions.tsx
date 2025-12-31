"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, PlusIcon, Trash2 } from "lucide-react";
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

import { Product } from "@/lib/models";
import { addStock, deleteProduct } from "../actions";
import { toast } from "sonner";
import { EditProductForm } from "./forms";
export type ProductActionsProp = {
  product: Product;
  categories?: string[];
};

export function AddStock({ product }: ProductActionsProp) {
  async function handleAddStockSubmit(formData: FormData) {
    const amount = parseInt(formData.get("stock") as string);

    if (amount && amount > 0) {
      toast.promise(addStock(product, amount), {
        loading: "Adding stock to product...",
        success: "Successfully added stock to product!",
        error: "Failed to add stock to product.",
      });
    } else {
      console.error("Invalid input: ", amount);
      toast.error("Invalid input!", {
        style: {
          "--normal-bg":
            "light-dark(var(--destructive), color-mix(in oklab, var(--destructive) 60%, var(--background)))",
          "--normal-text": "var(--color-white)",
          "--normal-border": "transparent",
        } as React.CSSProperties,
      });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-green-400">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={handleAddStockSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Add {product.name} Stock</DialogTitle>
            <DialogDescription>
              Add stock to existing products in inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Label htmlFor="stock">Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                defaultValue={1}
                min={1}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" onClick={() => handleAddStockSubmit}>
                Confirm
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditProduct({ product, categories = [] }: ProductActionsProp) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="p-1">
          <Edit />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full gap-3">
        <SheetHeader>
          <SheetTitle>Edit Product: {product.name}</SheetTitle>
          <SheetDescription>
            Make changes to an existing product inyour inventory.
          </SheetDescription>
        </SheetHeader>
        <div className="h-full flex flex-col p-5 pt-0">
          <EditProductForm product={product} categories={categories} />
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
  async function handleDeleteProduct() {
    toast.promise(deleteProduct(product), {
      loading: "Deleting product...",
      success: "Successfully deleted product!",
      error: "Failed to delete to product.",
    });
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="p-1">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product and remove the data from the server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 text-white"
            onClick={handleDeleteProduct}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
