import type { MetadataRoute } from "next";
import { profile } from "@/data/profile";

// Next 16 stopped caching route-handler GETs by default, and the metadata
// files compile to route handlers. Under `output: "export"` the build refuses
// to collect them without an explicit static opt-in.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${profile.siteUrl}/sitemap.xml`,
  };
}
