import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** The two-digit number shown beside an item, from its position in its list. */
export function listNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}
