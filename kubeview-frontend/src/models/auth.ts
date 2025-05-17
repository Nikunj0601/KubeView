export type User = {
  id: number;
  email: string;
  username: string;
  apiKey: string;
};

export type OAuth2GithubConf = {
  clientID: string;
  scope: string[];
};

export type GithubPullRequest = {
  id: number;
  html_url: string;
  number: number;
  title: string;
  user: {
    login: string;
  };
  created_at: string;
};
