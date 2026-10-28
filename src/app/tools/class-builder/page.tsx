import type { Metadata } from "next";
import { Suspense } from "react";
import PageTitle from "@/components/PageTitle";
import ClassBuilder from "./ClassBuilder";

export const metadata: Metadata = { title: "Class builder" };

export default function ClassBuilderPage() {
  return (
    <>
      <PageTitle
        title="Class builder"
        subtitle={
          <>
            Pick three of the ten skill trees to see your class name and key skills, or search for a class by name. Copy the
            link to share a build. Skill info is from the{" "}
            <a className="underline" href="https://wiki.aa-classic.com/Skill_Trees">
              AAClassic wiki
            </a>
            .
          </>
        }
      />
      <Suspense>
        <ClassBuilder />
      </Suspense>
    </>
  );
}
