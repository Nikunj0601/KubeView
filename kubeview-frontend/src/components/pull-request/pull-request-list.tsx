import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { GithubPullRequest } from "../../models/github";
import { PullRequestCard } from "./pull-request-card";

interface PullRequestListProps {
  pullRequests: GithubPullRequest[];
  isLoading?: boolean;
}

export const PullRequestList: React.FC<PullRequestListProps> = ({
  pullRequests,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading pull requests...
      </div>
    );
  }

  if (!pullRequests?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pull requests found
      </div>
    );
  }

  const filterPullRequests = (status: string) => {
    return pullRequests.filter((pr) => pr.status === status);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Pull Requests</h2>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="merged">Merged</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-4">
            {pullRequests.map((pr) => (
              <PullRequestCard key={pr.id} pullRequest={pr} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="open" className="mt-4">
          <div className="space-y-4">
            {filterPullRequests("open").map((pr) => (
              <PullRequestCard key={pr.id} pullRequest={pr} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="closed" className="mt-4">
          <div className="space-y-4">
            {filterPullRequests("closed").map((pr) => (
              <PullRequestCard key={pr.id} pullRequest={pr} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="merged" className="mt-4">
          <div className="space-y-4">
            {filterPullRequests("merged").map((pr) => (
              <PullRequestCard key={pr.id} pullRequest={pr} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
