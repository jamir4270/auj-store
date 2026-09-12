"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/types/domain";
import { formatPHP } from "@/lib/utils/currency";
import { getStockStatusMetadata } from "@/lib/utils/stock-status";
import { EditProduct, AddStock, DeleteProduct } from "./raw-actions";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const getColumns = (categories: string[]): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-semibold text-xs uppercase"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "barcode",
    header: () => <span className="font-semibold text-xs uppercase text-muted-foreground">Barcode</span>,
    cell: ({ row }) => {
      const barcode = row.original.barcode;
      if (!barcode) {
        return <span className="text-xs text-muted-foreground/60 italic">Unbarcoded</span>;
      }
      return (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted border font-semibold tracking-wide text-foreground/90">
          {barcode}
        </span>
      );
    },
  },
  {
    accessorKey: "category",
    header: () => <span className="font-semibold text-xs uppercase text-muted-foreground">Category</span>,
    cell: ({ row }) => (
      <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
        {row.getValue("category")}
      </span>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-semibold text-xs uppercase"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Stock
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const product = row.original;
      return <span className="font-mono font-medium">{product.quantity}</span>;
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold text-xs uppercase text-muted-foreground">Status</span>,
    cell: ({ row }) => {
      const status = row.original.status || "in_stock";
      const meta = getStockStatusMetadata(status);

      return (
        <span className={cn("px-2.5 py-0.5 rounded-full border text-[11px] font-semibold", meta.className)}>
          {meta.label}
        </span>
      );
    },
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-semibold text-xs uppercase"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Unit Cost
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground">{formatPHP(row.getValue("cost"))}</span>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="font-semibold text-xs uppercase"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Selling Price
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-foreground">{formatPHP(row.getValue("price"))}</span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="font-semibold text-xs uppercase text-muted-foreground">Actions</span>,
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="flex flex-row items-center gap-1.5">
          <AddStock product={data} />
          <EditProduct product={data} categories={categories} />
          <DeleteProduct product={data} />
        </div>
      );
    },
  },
];
