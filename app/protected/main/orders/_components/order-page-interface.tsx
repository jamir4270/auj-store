"use client";

import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order, ProductAtSale } from "@/lib/models";
import { twoDecimal } from "@/lib/utils";
import { Minus, PlusIcon, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { submitNewOrder } from "../actions";

type OrderProps = {
  products: ProductAtSale[];
};

export function OrderInterface({ products }: OrderProps) {
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderList, setOrderList] = useState<ProductAtSale[]>([]);
  const [order, setOrder] = useState<Order>({
    total: 0,
    status: "incomplete",
    total_profit: 0,
    partial_payment: 0,
  });
  const [submit, setSubmit] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [productList, setProductList] = useState(products);

  console.log(`Parent isOrdering: ${isOrdering}`);

  const handleOrderListUpdate = (newList: ProductAtSale[]) => {
    const newOrder: Order = {
      total: 0,
      status: "complete",
      total_profit: 0,
      partial_payment: 0,
    };

    for (const item of newList) {
      newOrder.total += item.subtotal ?? 0;
      newOrder.total_profit += item.profit ?? 0;
      console.log((item.price - item.cost) * (item.amount ?? 1));
      console.log(item.subtotal);
    }

    setOrder(newOrder);
    setOrderList(newList);
  };

  useEffect(() => {
    if (submit) {
      toast.promise(submitNewOrder(order, orderList), {
        loading: "Adding new record...",
        success: "Successfully added new record!",
        error: "Failed to add new record.",
      });
      setSubmit(false);
      const emptyArray: ProductAtSale[] = [];
      setIsOrdering(false);
      console.log(`Parent isOrdering: ${isOrdering}`);
      setOrderList(emptyArray);
    }

    const newProductList = products.filter((product) => {
      return product.name.toLowerCase().match(searchInput);
    });

    setProductList(newProductList);
  }, [submit, searchInput]);
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
            <Input
              type="search"
              placeholder="Search products..."
              onChange={(event) =>
                setTimeout(() => {
                  setSearchInput(event.target.value);
                }, 300)
              }
            />
            <ScrollArea className="h-[73vh] mt-5">
              <div className="flex flex-col gap-2 mr-5">
                {productList?.map((product) => {
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
                        updateProductList={handleOrderListUpdate}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 h-full">
              <div className="flex flex-row justify-between">
                <p className="text-2xl">Total: </p>
                <p className="text-2xl">{twoDecimal(order.total)}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 justify-self-end">
              <Button
                className="w-full bg-green-400"
                onClick={() => {
                  setSubmit(true);
                }}
              >
                Submit
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  const emptyArray: ProductAtSale[] = [];
                  setIsOrdering(false);
                  console.log(`Parent isOrdering: ${isOrdering}`);
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
  productList,
  updateIsOrdering,
  updateProductList,
}: ProductProps) {
  const [isClicked, setIsClicked] = useState(false);
  const isAlreadyInList = productList.some((item) => item.id === product.id);

  function handleOnClick() {
    if (product.status !== "out_of_stock") {
      updateIsOrdering(true);
      if (isAlreadyInList) {
        updateProductList(productList);
      } else {
        const newProduct: ProductAtSale = {
          ...product,
          profit: product.price - product.cost,
          subtotal: product.price,
        };
        const newList: ProductAtSale[] = [...productList, newProduct];
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
          product.status !== "out_of_stock" &&
          isAlreadyInList &&
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
  const [inputValue, setInputValue] = useState<string | number>(
    product.amount ?? 1
  );

  useEffect(() => {
    setInputValue(product.amount ?? 1);
  }, [product.amount]);

  function updateAmount(newAmount: number) {
    if (newAmount < 1) newAmount = 1;
    if (newAmount > product.quantity) newAmount = product.quantity;

    const newOrderList = orderList.map((item) => {
      if (item.id === product.id) {
        return {
          ...item,
          amount: newAmount,
          subtotal: item.price * newAmount,
          profit: (item.price - (item.cost ?? 0)) * newAmount,
          unit_price_at_sale: item.price,
        };
      }
      return item;
    });

    updateProductList(newOrderList);
  }

  function handleBlur() {
    let parsed = parseInt(inputValue.toString());

    if (isNaN(parsed) || parsed < 1) {
      parsed = 1;
    } else if (parsed > product.quantity) {
      parsed = product.quantity;
    }

    setInputValue(parsed);
    updateAmount(parsed);
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
              onClick={() => updateAmount((product.amount ?? 1) - 1)}
            />

            <Input
              type="number"
              min={1}
              max={product.quantity}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
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
