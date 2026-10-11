import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Where a Project's Case Study is read. */
export function caseStudyPath(slug: string) {
  return `/work/${slug}`;
}

/** The two-digit number shown beside an item, from its position in its list. */
export function listNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}
