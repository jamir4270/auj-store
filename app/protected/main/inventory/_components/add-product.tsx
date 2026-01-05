import { Button } from "@/components/ui/button";
import { CirclePlusIcon } from "lucide-react";
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

export type AddNewProductProp = {
  categories: string[];
};

export function AddNewProduct({ categories }: AddNewProductProp) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default">
          <CirclePlusIcon />
          <p>Add New Product</p>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full gap-3">
        <SheetHeader>
          <SheetTitle>Add New Product</SheetTitle>
          <SheetDescription>Add a new product your inventory.</SheetDescription>
        </SheetHeader>
        <div className="h-full flex flex-col p-5 pt-0">
          <AddNewProductForm categories={categories} />
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
