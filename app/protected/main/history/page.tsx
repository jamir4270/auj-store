"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function History() {
  /*const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - 1);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 1);
  const response: OrderItem[] =
    (await fetchOrderItems(startDate.toISOString(), endDate.toISOString())) ??
    [];*/

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">History</CardTitle>
          <CardDescription className="text-[18px]">
            Check the store&apos;s recent activities.
          </CardDescription>
          <div className="flex flex-row justify-between mt-8">
            <div>
              <Input type="search" className="w-2xl"></Input>
            </div>
            <div className="flex flex-row gap-5">
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button>
                      <p>See History</p> <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Store History</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Today</DropdownMenuItem>
                    <DropdownMenuItem>Yesterday</DropdownMenuItem>
                    <DropdownMenuItem>One Week Ago</DropdownMenuItem>
                    <DropdownMenuItem>One Month Ago</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-col gap-3">
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
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setDate(date);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Card>
            <CardHeader className="flex flex-row">
              <CardTitle className="text-2xl p-0">{`Notebook (Big)`}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row justify-between">
              <div>
                <div className="flex flex-row gap-2">
                  <p>Category: </p>
                  <p>School Supplies</p>
                </div>
                <div className="flex flex-row gap-2">
                  <p>Price: </p>
                  <p>10.00</p>
                </div>
                <div className="flex flex-row gap-2">
                  <p>Amount: </p>
                  <p>2</p>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-center">Total</div>
                <div className="text-3xl">20.00</div>
              </div>
            </CardContent>
            <CardFooter>{`Date: 2025-01-03 05:00 PM`}</CardFooter>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
