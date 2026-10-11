import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/site/section";
import { NewTab } from "@/components/site/new-tab";
import { projects } from "@/data/projects";
import { toWorkListData } from "@/lib/tina";
import { WorkList } from "@/components/sections/work-list";

export function WorkSection() {
  return (
    <Section
      id="work"
      index="01"
      title="Selected work"
      description="Independent products of mine — not my employer's. Live systems people use to run a business and see patients, each built solo from schema to interface to deploy."
    >
      <WorkList initial={toWorkListData(projects)} />

      <p className="mt-8 font-mono text-xs text-muted-foreground">
        More on{" "}
        <a
          href="https://github.com/adhamaa"
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline touch-target text-foreground"
        >
          github.com/adhamaa
          <ArrowUpRight className="h-3 w-3" />
          <NewTab />
        </a>
      </p>
    </Section>
  );
}
