import React from "react";
import ThreePaneLayout from "@/components/layout/ThreePaneLayout";
import { DataExplorerLayout } from "@/components/storytelling/DataExplorerLayout";

export const metadata = {
  title: "Data Stories | Marigold",
  description: "Explore zero-cloud, private data stories and analytics.",
};

export default function DataStoriesPage() {
  return (
    <ThreePaneLayout>
      <div className="h-[calc(100vh-4rem)]">
        <DataExplorerLayout />
      </div>
    </ThreePaneLayout>
  );
}
