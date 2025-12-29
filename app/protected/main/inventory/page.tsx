import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Inventory() {
  //const products: Product[] = (await fetchProducts()) ?? [];

  return (
    <div className="flex flex-col p-3 py-0">
      <div className="flex flex-col gap-3">
        <div className="text-3xl font-bold">Inventory</div>
        <div className="flex flex-row">
          <Card className="flex-1 rounded-r-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl">Total Asset Value</CardTitle>
            </CardHeader>
            <CardContent className="py-0 items-center justify-center">
              <p className="text-3xl">{`₱100,000`}</p>
            </CardContent>
          </Card>
          <Card className="flex-2 rounded-l-none">
            <CardHeader className="py-3">
              <CardTitle className="flex flex-row gap-2">
                <div className="text-2xl">2379 </div>
                <div className="text-2xl font-medium">Products</div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row w-full pb-3 gap-1">
              <Card className="h-3 w-[50%] bg-green-400"></Card>
              <Card className="h-3 w-[25%] bg-orange-400"></Card>
              <Card className="h-3 w-[25%] bg-red-500"></Card>
            </CardContent>
            <CardFooter className="flex flex-row w-full gap-4">
              <div className="flex flex-row gap-2">
                <Card className="h-5 w-2 bg-green-400"></Card>
                <p className="items-center justify-center">In stock: 1452</p>
              </div>
              <div className="flex flex-row gap-2">
                <Card className="h-5 w-2 bg-orange-400"></Card>
                <p className="items-center justify-center">Low stock: 1452</p>
              </div>
              <div className="flex flex-row gap-2">
                <Card className="h-5 w-2 bg-red-500"></Card>
                <p className="items-center justify-center">
                  Out of stock: 1452
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
