import { fetchProducts } from "@/lib/data";
import { OrderInterface } from "@/components/orders/order-page-interface";
import { ProductAtSale } from "@/types/domain";

export default async function Orders() {
  const products: ProductAtSale[] = await fetchProducts();
  return (
    <div className="h-full">
      <OrderInterface products={products} />
    </div>
  );
}
