"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistoryOrderItem } from "@/lib/models";
import { DatePicker } from "./_components/date-picker";

import { useState } from "react";
import { OrderItemCard } from "./_components/order-item-card";
import { Input } from "@/components/ui/input";

export default function History() {
  const [orderItemList, setOrderItemList] = useState<HistoryOrderItem[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const displayList: HistoryOrderItem[] = orderItemList.filter((item) => {
    return item.name.toLowerCase().match(searchValue.toLowerCase());
  });

  function handleOrderItemListChange(newOrderItemList: HistoryOrderItem[]) {
    setOrderItemList(newOrderItemList);
  }

  /*useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date();
      startDate.setUTCDate(startDate.getUTCDate() - 1);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getUTCDate() + 1);
      const orderItems = await fetchOrderItems(
        startDate.toISOString(),
        endDate.toISOString()
      );
      console.log(`First render: ${orderItems}`);
      setOrderItemList(orderItems);
    };
    fetchData();
  }, []);*/

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Sales History</CardTitle>
          <CardDescription className="text-[18px]">
            Check the store&apos;s entire history of sales.
          </CardDescription>
          <div className="flex flex-row justify-between gap-3 mt-8">
            <div className="text-2xl">{`Found (${orderItemList.length}) items`}</div>
            <div className="flex flex-row gap-3">
              <div>
                <Input
                  type="search"
                  placeholder="Search product..."
                  onChange={(event) =>
                    setTimeout(() => {
                      setSearchValue(event.target.value);
                    }, 300)
                  }
                />
              </div>
              <div className="flex flex-row gap-5">
                <div>
                  <DatePicker
                    handleOrderItemListChange={handleOrderItemListChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {displayList.length === 0 ? (
            <div className="w-full text-center">No items found</div>
          ) : (
            displayList.map((item) => {
              return <OrderItemCard key={item.id} orderItem={item} />;
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
