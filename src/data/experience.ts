import type { Role } from "@/content/load.mts";
import rolesJson from "./generated/roles.json";

export type { Role };

/** Roles, most relevant first. Compiled from `content/roles.yml`. */
export const experience: Role[] = rolesJson;

export const education = [
  {
    title: "JavaScript Algorithms & Data Structures",
    org: "freeCodeCamp",
    year: "2020",
  },
  {
    title: "Responsive Web Design",
    org: "freeCodeCamp",
    year: "2019",
  },
  {
    title: "Degree, Islamic Studies with Management",
    org: "Open University Malaysia",
    year: "2017",
  },
  {
    title: "Diploma, Quran wal Qiraat",
    org: "Kolej Universiti Islam Johor Sultan Ibrahim",
    year: "2013",
  },
];

export const languages = ["English", "Malay"];
