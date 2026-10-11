import type { CaseStudy } from "@/content/load.mts";
import caseStudiesJson from "./generated/case-studies.json";

export type { CaseStudy };

/**
 * Published Case Studies, rendered to HTML at build time. Only the Case Study
 * pages import this, so the write-ups never reach the client bundle.
 */
export const caseStudies = caseStudiesJson as CaseStudy[];
