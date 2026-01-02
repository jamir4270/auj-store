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
        <Card className="flex flex-col h-[89vh] pb-5">
          <CardHeader className="flex flex-col">
            <Input type="search" placeholder="Search products..." />
            <ScrollArea className="h-[73vh] mt-5">
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
          <Card className="flex flex-col h-screen">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>List of orders</CardDescription>
              <ScrollArea className="h-[50vh] border-2 rounded-2xl">
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
        <CardHeader className="flex flex-row justify-between items-center pb-0">
          <div className="flex flex-col h- gap-1">
            <CardTitle className="mt-2">{product.name}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </div>
          <div className="text-2xl">{twoDecimal(product.price)}</div>
        </CardHeader>
        <CardFooter
          className={`${setStatusColor(
            product.status ?? ""
          )} flex flex-row gap-1`}
        >
          {product.status}
          <div className="text-">{`(${product.quantity})`}</div>
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

export default function OrderItemCard({
  product,
  orderList,
  updateProductList,
}: OrderItemCardProps) {
  function updateAmount(newAmount: number) {
    if (newAmount < 1) newAmount = 1;
    if (newAmount > product.quantity) newAmount = product.quantity;

    const newOrderList = orderList.map((item) => {
      if (item.id === product.id) {
        return {
          ...item,
          amount: newAmount,
          subtotal: item.price * newAmount,
          profit: item.price * newAmount - item.cost * newAmount,
          unit_price_at_sale: item.price,
        };
      }
      return item;
    });

    updateProductList(newOrderList);
  }

  function handleDelete() {
    const newProductList = orderList.filter((item) => {
      return item.id !== product.id;
    });
    updateProductList(newProductList);
  }

  const currentSubTotal = product.price * (product.amount ?? 1);

  return (
    <div>
      <Card className="p-0 m-5">
        <CardHeader className="flex flex-row justify-between items-center pb-0">
          <div className="flex flex-col h-fit gap-1">
            <CardTitle className="mt-2">{product.name}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </div>
          <div className="text-2xl">{twoDecimal(currentSubTotal)}</div>
        </CardHeader>
        <CardFooter className="flex flex-row justify-between">
          <div className="flex flex-row gap-1 items-center">
            <Minus
              className="cursor-pointer"
              onClick={() => updateAmount((product.amount ?? 2) - 1)}
            />

            <Input
              type="number"
              min={1}
              max={product.quantity}
              value={product.amount ?? 1}
              onChange={(event) => {
                const val = event.target.value;
                const parsed = parseInt(val === "" ? "1" : val);
                updateAmount(parsed);
              }}
              className="w-20 text-center"
            />

            <PlusIcon
              className="cursor-pointer"
              onClick={() => updateAmount((product.amount ?? 1) + 1)}
            />
          </div>
          <div>
            <Trash2
              className="text-red-500 cursor-pointer"
              onClick={handleDelete}
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
