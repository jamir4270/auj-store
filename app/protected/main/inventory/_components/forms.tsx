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

import { ProductActionsProp } from "./raw-actions";

type ProductCategoryProp = {
  categories: string[];
};

type EditProductProp = ProductActionsProp & ProductCategoryProp;

export function EditProductForm({ product, categories }: EditProductProp) {
  return (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup className="flex flex-col">
          <FieldSet>
            <FieldGroup className="flex flex-col gap-2">
              <Field className="gap-1">
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" placeholder={product.name} required />
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="category">Category</FieldLabel>
                <Select defaultValue={product.category}>
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
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="quantity">Stock</FieldLabel>
                <Input
                  id="quantity"
                  placeholder={`${product.quantity}`}
                  required
                />
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="stock_threshhold">
                  Stock Threshhold
                </FieldLabel>
                <Input
                  id="stock_threshhold"
                  placeholder={`${product.stock_threshhold}`}
                  required
                />
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="cost">Cost</FieldLabel>
                <Input id="cost" placeholder={`${product.cost}`} required />
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="price">Price</FieldLabel>
                <Input id="price" placeholder={`${product.price}`} required />
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
