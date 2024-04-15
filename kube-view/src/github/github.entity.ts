export class GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

export class GithubPullRequest {
  id: number;
  html_url: string;
  number: number;
  title: string;
  user: {
    login: string;
  };
  created_at: string;
  fromBranch: string;
  toBranch: string;
}
