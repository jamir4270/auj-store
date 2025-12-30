"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/lib/models";
import { twoDecimal } from "@/lib/utils";
import EditProduct, { AddStock, DeleteProduct } from "./raw-actions";

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
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "quantity",
    header: "Stock",
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
    header: "Price",
    cell: ({ row }) => {
      const value = twoDecimal(row.getValue("price"));
      return value;
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
