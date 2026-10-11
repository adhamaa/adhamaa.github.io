import type { Profile } from "@/content/load.mts";
import profileJson from "./generated/profile.json";

/**
 * Everything about Adham as a person. Compiled from `content/profile.yml` —
 * edit it there, or at /admin.
 */
export const profile: Profile = profileJson;

export type SocialLink = {
  name: string;
  handle: string;
  href: string;
  icon: "github" | "linkedin" | "x" | "instagram" | "mail";
};

export const socials: SocialLink[] = [
  {
    name: "GitHub",
    handle: "@adhamaa",
    href: "https://github.com/adhamaa",
    icon: "github",
  },
  {
    name: "LinkedIn",
    handle: "adham-akmal-azmi",
    href: "https://www.linkedin.com/in/adham-akmal-azmi-421a7b134/",
    icon: "linkedin",
  },
  {
    name: "X",
    handle: "@adhamakmal",
    href: "https://twitter.com/adhamakmal",
    icon: "x",
  },
  {
    name: "Email",
    handle: profile.email,
    href: `mailto:${profile.email}`,
    icon: "mail",
  },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Lab", href: "/table" },
] as const;

/** In-page anchors offered by the command palette. */
export const sectionLinks = [
  { label: "Selected work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Stack", href: "/#stack" },
  { label: "How I work", href: "/#approach" },
  { label: "Contact", href: "/#contact" },
] as const;
