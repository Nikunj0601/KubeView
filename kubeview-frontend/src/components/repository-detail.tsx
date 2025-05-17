import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { useGithubRepo, useGithubPullRequests } from "../hooks/useGithub";
import { RepositoryHeader } from "./repository/repository-header";
import { PullRequestList } from "./pull-request/pull-request-list";
import { GithubPullRequest, GithubRepo } from "@/models/github";

export const RepositoryDetail: React.FC = () => {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const { state } = useLocation();

  const initialRepo = state?.repo as GithubRepo;

  const {
    data: repo,
    isLoading: isRepoLoading,
    isError: repoError,
  } = useGithubRepo(owner!, name!);
  const { data: pullRequests, isLoading: isPRLoading } = useGithubPullRequests(
    owner!,
    name!
  );

  if (isRepoLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading repository...</div>
      </div>
    );
  }

  if (repoError || !repo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Error loading repository. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RepositoryHeader repo={initialRepo ? initialRepo : repo} />
      <PullRequestList
        pullRequests={pullRequests || []}
        isLoading={isPRLoading}
      />
    </div>
  );
};
