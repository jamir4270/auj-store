"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { AddNewProductForm } from "./forms";
import { useState } from "react";

export type AddNewProductProp = {
  categories: string[];
};

export function AddNewProduct({ categories }: AddNewProductProp) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2 bg-primary">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full gap-3">
        <SheetHeader>
          <SheetTitle>Add New Product</SheetTitle>
          <SheetDescription>Record a new product into store inventory.</SheetDescription>
        </SheetHeader>
        <div className="h-full flex flex-col p-2 pt-0">
          <AddNewProductForm
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
