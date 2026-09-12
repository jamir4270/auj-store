"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HistoryOrderItem } from "@/types/domain";
import { ChevronDown, CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchOrderItemsWithDetails } from "@/lib/data";

type DatePickerProps = {
  handleOrderItemListChange: (newList: HistoryOrderItem[]) => void;
  onLoadingChange?: (isLoading: boolean) => void;
};

export function DatePicker({ handleOrderItemListChange, onLoadingChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!date) return;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const updateList = async () => {
      onLoadingChange?.(true);
      try {
        const list = await fetchOrderItemsWithDetails(
          startDate.toISOString(),
          endDate.toISOString()
        );
        handleOrderItemListChange(list);
      } catch (err) {
        console.error("Failed to load history items for date:", err);
      } finally {
        onLoadingChange?.(false);
      }
    };

    updateList();
  }, [date]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className="w-52 justify-between font-normal"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 opacity-50" />
            <span>
              {date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Select date"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="end">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(newDate) => {
            if (newDate) {
              setDate(newDate);
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
