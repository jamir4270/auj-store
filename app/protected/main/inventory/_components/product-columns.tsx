"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product, ProductStatus, ProductCategory } from "@/lib/models";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Categort",
  },
  {
    accessorKey: "quantity",
    header: "Stock",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  { accessorKey: "price", header: "Price" },
];
