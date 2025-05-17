import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { GithubRepo, GithubPullRequest } from "../models/github";
import { kubeviewAxios } from "../components/api/base";

// Get user's repositories
export const useGithubRepos = () => {
  return useQuery<GithubRepo[]>({
    queryKey: ["repos"],
    queryFn: async () => {
      const response = await kubeviewAxios.get(`/github/repos`);
      return response.data;
    },
  });
};

// Get specific repository
export const useGithubRepo = (
  owner: string,
  name: string,
  initialRepo?: GithubRepo
) => {
  return useQuery<GithubRepo>({
    queryKey: ["repo", owner, name],
    queryFn: async () => {
      const response = await kubeviewAxios.get(
        `/github/repos/${owner}/${name}`
      );
      return response.data;
    },
    enabled: !!owner && !!name && !initialRepo,
  });
};

// Get repository pull requests
export const useGithubPullRequests = (owner: string, name: string) => {
  return useQuery<GithubPullRequest[]>({
    queryKey: ["pulls", owner, name],
    queryFn: async () => {
      const response = await kubeviewAxios.get(
        `/github/repos/${owner}/${name}/pulls`
      );
      return response.data;
    },
    enabled: !!owner && !!name,
  });
};

// Get specific pull request
export const useGithubPullRequest = (
  owner: string,
  name: string,
  pullNumber: number,
  initialPullRequest?: GithubPullRequest
) => {
  return useQuery<GithubPullRequest>({
    queryKey: ["pull", owner, name, pullNumber],
    queryFn: async () => {
      const response = await kubeviewAxios.get(
        `/github/repos/${owner}/${name}/pulls/${pullNumber}`
      );
      return response.data;
    },
    initialData: initialPullRequest,
    enabled: !!owner && !!name && !!pullNumber,
  });
};

// Create environment for a pull request
export const useCreateEnvironment = () => {
  return useMutation({
    mutationFn: async ({
      owner,
      name,
      pullNumber,
      filePaths,
    }: {
      owner: string;
      name: string;
      pullNumber: number;
      filePaths: string[];
    }) => {
      const response = await kubeviewAxios.post(
        `/github/repos/${owner}/${name}/createEnvironment/${pullNumber}`,
        { filePaths }
      );
      return response.data;
    },
  });
};

// Delete environment for a pull request
export const useDeleteEnvironment = () => {
  return useMutation({
    mutationFn: async ({
      owner,
      name,
      pullNumber,
    }: {
      owner: string;
      name: string;
      pullNumber: number;
    }) => {
      const response = await kubeviewAxios.delete(
        `/github/repos/${owner}/${name}/deleteEnviornment/${pullNumber}`
      );
      return response.data;
    },
  });
};
