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
import { addStock } from "../actions";
import { toast } from "sonner";
import { fetchProductsColumn } from "../data";
type ProductActionsProp = {
  product: Product;
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

export function EditProduct({ product }: ProductActionsProp) {
  async function handleFetchColumns() {
    const data = await fetchProductsColumn("category");
    console.log(data);
  }
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="p-1">
          <Edit />
        </Button>
      </SheetTrigger>

      <SheetContent className="h-full">
        <form action="" className="h-full">
          <div className="h-full flex flex-col">
            <SheetHeader>
              <SheetTitle>Edit Product: {product.name}</SheetTitle>
              <SheetDescription>
                Edit {product.name} in inventory
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 flex flex-col gap-6 px-4 py-6">
              <div className="flex flex-col gap-3">
                <Label htmlFor="name">Name</Label>
                <Input type="string" id="name" defaultValue={product.name} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="name">Name</Label>
                <Input type="string" id="name" defaultValue={product.name} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="quantity">Stock</Label>
                <Input
                  type="number"
                  id="quantity"
                  defaultValue={product.quantity}
                  min={1}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="cost">Cost</Label>
                <Input
                  type="number"
                  id="cost"
                  defaultValue={product.cost}
                  min={1}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  id="price"
                  defaultValue={product.price}
                  min={1}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="quantity">Stock Threshhold</Label>
                <Input
                  type="number"
                  id="quantity"
                  defaultValue={product.stock_threshhold}
                  min={1}
                />
              </div>
            </div>
            <SheetFooter className="flex">
              <Button
                onClick={() => {
                  handleFetchColumns();
                }}
              >
                Fetch
              </Button>
              <Button type="submit">Confirm</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function DeleteProduct({ product }: ProductActionsProp) {
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
            onClick={() => {}}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
