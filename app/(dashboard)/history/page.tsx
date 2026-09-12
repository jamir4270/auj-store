"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistoryOrderItem } from "@/types/domain";
import { DatePicker } from "@/components/history/date-picker";
import { useState, useMemo } from "react";
import { OrderItemCard } from "@/components/history/order-item-card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { formatPHP } from "@/lib/utils/currency";
import { History as HistoryIcon, Loader2, PackageSearch } from "lucide-react";

export default function History() {
  const [orderItemList, setOrderItemList] = useState<HistoryOrderItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 250);

  const displayList = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return orderItemList;
    return orderItemList.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query) ?? false;
      const catMatch = item.category?.toLowerCase().includes(query) ?? false;
      return nameMatch || catMatch;
    });
  }, [orderItemList, debouncedSearch]);

  const totalDayRevenue = useMemo(() => {
    return displayList.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  }, [displayList]);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="p-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <HistoryIcon className="h-6 w-6" />
                Sales History
              </CardTitle>
              <CardDescription>
                View all items sold by date with detailed line-item breakdowns.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input
                type="search"
                placeholder="Filter by product or category..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full sm:w-64"
              />
              <DatePicker
                handleOrderItemListChange={setOrderItemList}
                onLoadingChange={setIsLoading}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm">
            <div className="text-muted-foreground font-medium">
              Found <span className="font-bold text-foreground">({displayList.length})</span> items sold
            </div>
            <div className="text-sm text-muted-foreground">
              Period Gross: <span className="font-bold text-foreground text-base">{formatPHP(totalDayRevenue)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Loading sales records...</span>
            </div>
          ) : displayList.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3 text-center">
              <PackageSearch className="h-10 w-10 opacity-30" />
              <div>
                <p className="font-medium text-foreground">No sales records found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try selecting a different date or clearing your search filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {displayList.map((item) => (
                <OrderItemCard key={item.id} orderItem={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
