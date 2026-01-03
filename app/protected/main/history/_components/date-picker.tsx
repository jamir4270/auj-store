"use react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HistoryOrderItem } from "@/lib/models";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchOrderItems } from "../data";

type DatePickerProps = {
  handleOrderItemListChange: (newList: HistoryOrderItem[]) => void;
};

export function DatePicker({ handleOrderItemListChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!date) return;
    const newDate = new Date(date);
    newDate?.setHours(0, 0, 0, 0);
    const nextDate = new Date(newDate);
    nextDate.setDate(newDate.getDate() + 1);

    const updateList = async () => {
      const newList = await fetchOrderItems(
        newDate.toISOString(),
        nextDate.toISOString()
      );
      handleOrderItemListChange(newList);
    };

    updateList();
  }, [date]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className="w-48 justify-between font-normal"
        >
          {date ? date.toLocaleDateString() : "Select date"}
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={(newDate) => {
            setDate(newDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
