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
import { ProductAtSale } from "@/lib/models";
import { twoDecimal } from "@/lib/utils";
import { Minus, PlusIcon, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type OrderProps = {
  products: ProductAtSale[];
};

export function OrderInterface({ products }: OrderProps) {
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderList, setOrderList] = useState<ProductAtSale[]>([]);
  console.log(`Parent isOrdering: ${isOrdering}`);

  const handleOrderListUpdate = (newList: ProductAtSale[]) => {
    setOrderList(newList);
  };
  return (
    <div className="flex flex-row h-screen gap-3 px-3">
      <div className="flex flex-col flex-2 w-full gap-5">
        <div>
          <div className="flex flex-row justify-between">
            <CardTitle className="text-3xl">Orders</CardTitle>{" "}
            <Button
              onClick={() => {
                setIsOrdering(true);
                console.log(`Parent isOrdering: ${isOrdering}`);
              }}
              disabled={isOrdering}
            >
              Order
            </Button>
          </div>
          <CardDescription>Record Orders</CardDescription>
        </div>
        <Card className="flex flex-col h-[73vh] pb-5">
          <CardHeader className="flex flex-col gap-5">
            <Input type="search" placeholder="Search products..." />
            <ScrollArea className="h-[55vh]">
              <div className="flex flex-col gap-2 mr-5">
                {products?.map((product) => {
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      productList={orderList}
                      updateIsOrdering={setIsOrdering}
                      updateProductList={handleOrderListUpdate}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </CardHeader>
          <CardContent></CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
      {isOrdering && (
        <div className="flex flex-col h-screen flex-1 animate-in fade-in slide-in-from-right-5 duration-300">
          <Card className="flex flex-col h-[84vh]">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>List of orders</CardDescription>
              <ScrollArea className="h-[30vh] border-2 rounded-2xl">
                <div>
                  {orderList.map((order) => {
                    return (
                      <OrderItemCard
                        key={order.id}
                        product={order}
                        orderList={orderList}
                        updateProductList={setOrderList}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  setIsOrdering(false);
                  console.log(`Parent isOrdering: ${isOrdering}`);
                  const emptyArray: ProductAtSale[] = [];
                  setOrderList(emptyArray);
                }}
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

type ProductProps = {
  product: ProductAtSale;
  productList: ProductAtSale[];
  updateIsOrdering: (isOrdering: boolean) => void;
  updateProductList: (newList: ProductAtSale[]) => void;
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

function ProductCard({
  product,
  productList = [],
  updateIsOrdering,
  updateProductList,
}: ProductProps) {
  const [isClicked, setIsClicked] = useState(false);

  function handleOnClick() {
    if (product.status !== "out_of_stock") {
      updateIsOrdering(true);
      if (productList.includes(product)) {
        updateProductList(productList);
      } else {
        const newList: ProductAtSale[] = [...productList, product];
        updateProductList(newList);
        setIsClicked(true);
      }
    } else {
      updateProductList(productList);
    }
  }
  return (
    <div>
      <Card
        className={`p-0 ${
          product.status === "out_of_stock" && "border-red-500"
        } ${
          isClicked &&
          product.status !== "out_of_stock" &&
          productList.includes(product) &&
          "border-green-400"
        }`}
        onClick={handleOnClick}
      >
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col h- gap-1">
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

type OrderItemCardProps = {
  product: ProductAtSale;
  orderList: ProductAtSale[];
  updateProductList: (product: ProductAtSale[]) => void;
};

function OrderItemCard({
  product,
  orderList,
  updateProductList,
}: OrderItemCardProps) {
  const [amount, setAmount] = useState(1);

  function handleDelete() {
    const newProductList = orderList.filter((item) => {
      return item.id !== product.id;
    });
    updateProductList(newProductList);
  }

  return (
    <div>
      <Card className={`p-0`}>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-col h-screen gap-1">
            <CardTitle className="mt-2">{product.name}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </div>
          <div className="text-2xl">
            {twoDecimal(product.subtotal as number)}
          </div>
        </CardHeader>
        <CardFooter className="flex flex-row justify-between">
          <div className="flex flex-row gap-1">
            <Minus
              onClick={() => {
                if (amount >= 1 && amount <= product.quantity) {
                  setAmount(amount - 1);
                  product.amount = amount;
                } else {
                  setAmount(1);
                  product.amount = amount;
                }
              }}
            />
            <Input
              type="number"
              min={1}
              max={product.quantity}
              value={amount}
              onChange={(event) =>
                setAmount(
                  parseInt(!event.target.value ? "1" : event.target.value)
                )
              }
              className="w-20 text-center"
            ></Input>
            <PlusIcon
              onClick={() => {
                if (amount >= 1 && amount <= product.quantity) {
                  setAmount(amount + 1);
                  product.amount = amount;
                } else {
                  setAmount(1);
                  product.amount = amount;
                }
              }}
            />
          </div>
          <div>
            <Trash2 className="text-red-500" onClick={handleDelete} />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
