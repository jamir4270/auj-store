import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row justify-between">
        <div>Date Here</div>
        <div>Time Here</div>
      </div>
      <div className="flex flex-row justify-between w-full gap-5">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Gross Sales</CardTitle>
          </CardHeader>
          <CardContent>2000</CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>1000.00</CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Products Sold</CardTitle>
          </CardHeader>
          <CardContent>100</CardContent>
        </Card>
      </div>
      <div className="flex flex-row w-full gap-5">
        <div className="flex-3 w-full h-full flex-col border-2 rounded-2xl"></div>
        <div className="flex flex-1 flex-col gap-3 w-full h-full">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>1. Ice Water</p>
              <p>2. Ice Candy</p>
              <p>3. Ice Pop</p>
              <p>4. Ice</p>
              <p>5. Coke Sakto</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Out of Stock Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>1. Ice Water</p>
              <p>2. Ice Candy</p>
              <p>3. Ice Pop</p>
              <p>4. Ice</p>
              <p>5. Coke Sakto</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p>1. Ice Water</p>
              <p>2. Ice Candy</p>
              <p>3. Ice Pop</p>
              <p>4. Ice</p>
              <p>5. Coke Sakto</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
