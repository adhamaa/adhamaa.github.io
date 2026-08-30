import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";

// Next 16 stopped caching route-handler GETs by default, and the metadata
// files compile to route handlers. Under `output: "export"` the build refuses
// to collect them without an explicit static opt-in.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: profile.siteUrl, lastModified, priority: 1 },
    { url: `${profile.siteUrl}/about`, lastModified, priority: 0.8 },
    { url: `${profile.siteUrl}/table`, lastModified, priority: 0.5 },
  ];
}
