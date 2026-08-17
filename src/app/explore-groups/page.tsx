import React from "react";
import ThreePaneLayout from "@/components/layout/ThreePaneLayout";
import ExploreGroupsView from "@/components/ExploreGroupsView";

export const metadata = {
  title: "Explore Groups | Marigold",
  description: "Discover and join local civic audit groups.",
};

export default function ExploreGroupsPage() {
  return (
    <ThreePaneLayout>
      <div className="h-full pt-4">
        <ExploreGroupsView />
      </div>
    </ThreePaneLayout>
  );
}
