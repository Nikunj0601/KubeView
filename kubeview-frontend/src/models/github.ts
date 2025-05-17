export type GithubRepo = {
  id: number;
  name: string;
  full_name?: string;
  html_url?: string;
  language?: string;
  description?: string;
  stars?: number;
  forks?: number;
  updatedAt?: string;
  isPrivate?: boolean;
  license?: string;
};

export type GithubPullRequest = {
  id: number;
  html_url: string;
  number: number;
  title: string;
  description: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  status: string;
  fromBranch: string;
  toBranch: string;
};
