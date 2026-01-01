import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const twoDecimal = (num: number): string => {
  if (isNaN(num)) return "₱0.00";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
  }).format(num);

  return formatted;
};
