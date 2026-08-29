import { Hero } from "@/components/sections/hero";
import { PipelineSection } from "@/components/sections/pipeline-section";
import { WorkSection } from "@/components/sections/work-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { StackSection } from "@/components/sections/stack-section";
import { ApproachSection } from "@/components/sections/approach-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <>
      <Hero />
      <PipelineSection />
      <div className="container">
        <WorkSection />
        <ExperienceSection />
        <StackSection />
        <ApproachSection />
        <ContactSection />
      </div>
    </>
  );
}
