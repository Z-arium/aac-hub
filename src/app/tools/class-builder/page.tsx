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
            Pick three of the ten skill trees to see your class name, then pick skills and passives in each. Copy the link to
            share the build, or save it in this browser. Skill info is from the{" "}
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
