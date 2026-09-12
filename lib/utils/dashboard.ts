import { HistoryOrderItem } from "@/types/domain";

export const calcTotals = (items: HistoryOrderItem[]) => {
  let sales = 0;
  let products = 0;
  let profit = 0;
  for (const item of items) {
    sales += item.subtotal || 0;
    products += item.quantity || 0;
    profit += item.profit || 0;
  }
  return { grossSale: sales, totalProducts: products, netProfit: profit };
};

export const getProductSalesCount = (items: HistoryOrderItem[]) => {
  const salesMap = items.reduce((acc, item) => {
    const name = item.name || "Unknown Product";
    const currentCount = acc[name] || 0;
    acc[name] = currentCount + (item.quantity || 0);
    return acc;
  }, {} as Record<string, number>);

  const result = Object.entries(salesMap).map(([name, count]) => ({
    name,
    count,
  }));

  return result.sort((a, b) => b.count - a.count);
};
