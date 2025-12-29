import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddProduct from "./_components/add-product";
import { fetchProducts } from "@/lib/data";
import { Product } from "@/lib/models";

export default async function Inventory() {
  const products: Product[] = (await fetchProducts()) ?? [];

  let total_asset_value = 0;

  for (const product of products) {
    total_asset_value += product.price * product.quantity;
  }

  return (
    <div className="flex flex-col p-3 py-0 h-full w-full">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex flex-row justify-between">
          <div className="text-3xl font-bold">Inventory</div>
          <AddProduct />
        </div>

        <div className="flex flex-row">
          <Card className="flex-1 rounded-r-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">Total Asset Value</CardTitle>
            </CardHeader>
            <CardContent className="py-0 items-center justify-center">
              <p className="text-3xl">{`₱ ${total_asset_value}`}</p>
            </CardContent>
          </Card>

          <Card className="flex-[2] rounded-l-none">
            <CardHeader className="py-3">
              <CardTitle className="flex flex-row gap-2">
                <div className="text-2xl">2379 </div>
                <div className="text-2xl font-medium">Products</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row w-full pb-3 gap-1">
              <Card className="h-3 w-[50%] bg-green-400 border-none"></Card>
              <Card className="h-3 w-[25%] bg-orange-400 border-none"></Card>
              <Card className="h-3 w-[25%] bg-red-500 border-none"></Card>
            </CardContent>
            <CardFooter className="flex flex-row w-full gap-4">
              <div className="flex flex-row gap-2 items-center">
                <div className="h-5 w-2 bg-green-400 rounded-sm"></div>
                <p>In stock: 1452</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="h-5 w-2 bg-orange-400 rounded-sm"></div>
                <p>Low stock: 1452</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="h-5 w-2 bg-red-500 rounded-sm"></div>
                <p>Out of stock: 1452</p>
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className="flex-1 w-full min-h-0">
          <Card className="h-full w-full flex flex-col">
            <CardHeader>
              <CardTitle>All Products</CardTitle>
            </CardHeader>
            <CardContent>Table Here</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
