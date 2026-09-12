"use client";

import { useMemo } from "react";
import { getColumns } from "./_components/product-columns";
import { ProductsTable } from "./_components/products-table";
import { Product } from "@/types/domain";

interface ProductsTableProps {
  products: Product[];
  categories: string[];
}

export function ProductsTableWrapper({
  products,
  categories,
}: ProductsTableProps) {
  const columns = useMemo(() => getColumns(categories), [categories]);

  return <ProductsTable columns={columns} data={products} />;
}
