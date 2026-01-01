"use client";

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/models";
import { twoDecimal } from "@/lib/utils";

type OrderProps = {
  products: Product[];
};

export function OrderInterface({ products }: OrderProps) {
  const [isOrdering, setIsOrdering] = useState(false);
  return (
    <div className="flex flex-row h-full gap-3 px-3">
      <div className="flex flex-col flex-2 w-full gap-5">
        <div>
          <div className="flex flex-row justify-between">
            <CardTitle className="text-3xl">Orders</CardTitle>{" "}
            <Button
              onClick={() => setIsOrdering(!isOrdering)}
              disabled={isOrdering ? true : false}
            >
              Order
            </Button>
          </div>
          <CardDescription>Record Orders</CardDescription>
        </div>
        <Card>
          <CardHeader className="flex flex-col gap-5">
            <Input type="search" placeholder="Search products..."></Input>
            {products?.map((product) => {
              return <ProductCard key={product.id} product={product} />;
            })}
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
      {isOrdering && (
        <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-5 duration-300">
          <Card>
            <CardHeader>
              <CardTitle></CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter>
              <Button onClick={() => setIsOrdering(!isOrdering)}>Cancel</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

type ProductProps = {
  product: Product;
};

function setStatusColor(status: string) {
  if (status === "in_stock") {
    return "text-green-400";
  } else if (status === "low_stock") {
    return "text-orange-400";
  } else {
    return "text-red-500";
  }
}

function ProductCard({ product }: ProductProps) {
  return (
    <div>
      <Card className="p-0">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col h-full gap-1">
            <CardTitle className="mt-2">{product.name}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </div>
          <div className="text-2xl">{twoDecimal(product.price)}</div>
        </CardHeader>
        <CardFooter className={setStatusColor(product.status ?? "")}>
          {product.status}
        </CardFooter>
      </Card>
    </div>
  );
}
