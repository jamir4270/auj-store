"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/lib/models";
import { twoDecimal } from "@/lib/utils";
import { EditProduct, AddStock, DeleteProduct } from "./raw-actions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

function setStatusClor(status: string) {
  if (status === "In Stock") {
    return "text-green-400";
  } else if (status === "Low Stock") {
    return "text-orange-400";
  } else {
    return "text-red-500";
  }
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;

      return <div className="text-center">{product.quantity}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = () => {
        const value = row.getValue("status");
        if (value === "in_stock") {
          return "In Stock" as string;
        } else if (value === "low_stock") {
          return "Low Stock" as string;
        } else if (value === "out_of_stock") {
          return "Out of Stock" as string;
        } else {
          return "NaN" as string;
        }
      };

      const statusText = status();
      return <div className={setStatusClor(statusText)}>{statusText}</div>;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = twoDecimal(row.getValue("price"));
      return <div className="text-center">{value}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="flex flex-row gap-2">
          <AddStock product={data} />
          <EditProduct product={data} />
          <DeleteProduct product={data} />
        </div>
      );
    },
  },
];
