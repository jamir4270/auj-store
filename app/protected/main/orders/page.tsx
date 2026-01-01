import { fetchProducts } from "@/lib/data";
import { OrderInterface } from "./_components/order-page-interface";

export default async function Orders() {
  const products = await fetchProducts();
  return (
    <div>
      <OrderInterface products={products} />
    </div>
  );
}
