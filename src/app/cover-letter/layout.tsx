import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cover letter",
  description:
    "An open cover letter from Adham Akmal Azmi — full-stack engineer, five years shipping production software and three live products built solo, schema to deploy.",
};

export default function CoverLetterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
