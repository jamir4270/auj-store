import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="flex flex-col">
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
    </div>
  );
}
