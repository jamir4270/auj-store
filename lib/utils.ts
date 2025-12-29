import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const twoDecimal = (num: number): string => {
  if (isNaN(num)) return "0.00";

  return num.toFixed(2);
};
