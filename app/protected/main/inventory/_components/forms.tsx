"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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

import { ProductActionsProp } from "./raw-actions";
import { useState } from "react";
import * as z from "zod";
import { Product } from "@/lib/models";
import { editProduct } from "../actions";
import { toast } from "sonner";

type ProductCategoryProp = {
  categories: string[];
};

type EditProductProp = ProductActionsProp & ProductCategoryProp;

const ProductSchema = z.object({
  name: z.string(),
  category: z.string(),
  quantity: z.coerce.number(),
  stock_threshhold: z.number(),
  cost: z.coerce.number(),
  price: z.coerce.number(),
});

export function EditProductForm({ product, categories }: EditProductProp) {
  const [categoryState, setCategoryState] = useState(false);

  async function handleEditProductFormSubmit(formData: FormData) {
    const currentDate = new Date();
    const result = ProductSchema.safeParse({
      name: formData.get("name"),
      category: formData.get("category"),
      quantity: parseInt(formData.get("quantity") as string),
      stock_threshhold: parseInt(formData.get("stock_threshhold") as string),
      cost: parseFloat(formData.get("cost") as string),
      price: formData.get("price"),
    });

    if (!result.success) {
      console.error("Invalid form data: ", result.error);
    } else {
      const updatedProduct: Product = {
        ...result.data,
        id: product.id,
        status: product.status,
        created_at: product.created_at,
        updated_at: currentDate.toISOString(),
      };
      toast.promise(editProduct(updatedProduct), {
        loading: "Updating product...",
        success: "Successfully updated product!",
        error: "Failed to update product.",
      });
    }
  }
  return (
    <div className="w-full max-w-md">
      <form action={handleEditProductFormSubmit}>
        <FieldGroup className="flex flex-col">
          <FieldSet>
            <FieldGroup className="flex flex-col gap-2">
              <Field className="gap-1">
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={product.name}
                  required
                />
              </Field>

              <Field className="gap-1">
                <div className="flex flex-row justify-between">
                  <FieldLabel htmlFor="category">
                    {categoryState && "New "}Category
                  </FieldLabel>
                  <div className="flex flex-row">
                    <div className="text-sm mr-1"> New Category </div>
                    <Switch
                      onClick={() => {
                        setCategoryState(!categoryState);
                      }}
                    />
                  </div>
                </div>
                {!categoryState && (
                  <Select name="category" defaultValue={product.category}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => {
                        return (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
                {categoryState && (
                  <Field className="gap-1">
                    <Input
                      id="category"
                      name="category"
                      placeholder={product.category}
                    />
                  </Field>
                )}
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="quantity">Stock</FieldLabel>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  defaultValue={product.quantity}
                  required
                />
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="stock_threshhold">
                  Stock Threshhold
                </FieldLabel>
                <Input
                  id="stock_threshhold"
                  name="stock_threshhold"
                  type="number"
                  defaultValue={product.stock_threshhold}
                  required
                />
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="cost">Cost</FieldLabel>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  defaultValue={product.cost}
                  step={0.01}
                  required
                />
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="price">Price</FieldLabel>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  defaultValue={product.price}
                  step={0.01}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <Field orientation="vertical">
            <Button type="submit">Submit</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
