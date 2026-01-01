import { fetchProducts } from "@/lib/data";
import { OrderInterface } from "./_components/order-page-interface";
import { ProductAtSale } from "@/lib/models";

export default async function Orders() {
  const products: ProductAtSale[] = await fetchProducts();
  return (
    <div>
      <OrderInterface products={products} />
    </div>
  );
}
