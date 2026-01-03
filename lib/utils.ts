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

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
}
