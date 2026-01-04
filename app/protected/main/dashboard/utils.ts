import { HistoryOrderItem } from "@/lib/models";

export const calcTotals = (items: HistoryOrderItem[]) => {
  let sales = 0;
  let products = 0;
  let profit = 0;
  for (const item of items) {
    sales += item.subtotal;
    products += item.quantity;
    profit += item.profit;
  }
  return { grossSale: sales, totalProducts: products, netProfit: profit };
};

export const getProductSalesCount = (items: HistoryOrderItem[]) => {
  const salesMap = items.reduce((acc, item) => {
    const currentCount = acc[item.name] || 0;

    acc[item.name] = currentCount + item.quantity;

    return acc;
  }, {} as Record<string, number>);

  const result = Object.entries(salesMap).map(([name, count]) => ({
    name,
    count,
  }));

  return result.sort((a, b) => a.count - b.count);
};
