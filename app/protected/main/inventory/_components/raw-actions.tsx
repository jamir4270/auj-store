import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, PlusIcon } from "lucide-react";
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

import { Product } from "@/lib/models";

type ProductActionsProp = {
  product: Product;
};

export default function EditProduct({ product }: ProductActionsProp) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="p-1">
          <Edit />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Product: {product.name}</SheetTitle>
          <SheetDescription>Edit {product.name} in inventory</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Name</Label>
            <Input id="sheet-demo-name" defaultValue={product.name} />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">Username</Label>
            <Input id="sheet-demo-username" defaultValue="@peduarte" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Confirm</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function AddStock({ product }: ProductActionsProp) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="ghost" className="p-1">
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add {product.name} Stock</DialogTitle>
            <DialogDescription>
              Add stock to existing products in inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Quantity</Label>
              <Input
                id="name-1"
                name="name"
                type="number"
                defaultValue={1}
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export function DeleteProduct({ product }: ProductActionsProp) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="destructive" className="p-1">
            <PlusIcon />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product: {product.name}</DialogTitle>
            <DialogDescription>Delete product in inventory.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Quantity</Label>
              <Input
                id="name-1"
                name="name"
                type="number"
                defaultValue={1}
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
