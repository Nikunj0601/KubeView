import { useQuery } from "@tanstack/react-query";
import { OAuth2GithubConf, User } from "../models/auth";
import { kubeviewAxios } from "../components/api/base";

export const useGithubConfig = () => {
  return useQuery<OAuth2GithubConf>({
    queryKey: ["githubConfig"],
    queryFn: async () => {
      const response = await kubeviewAxios.get(`/auth/oauth2/github`);
      return response.data;
    },
  });
};

export const useAuthUser = () => {
  return useQuery<User>({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await kubeviewAxios.get(`/auth/info`);
      console.log("hook", response.data);

      return response.data;
    },
    enabled: !!localStorage.getItem("accessToken"),
  });
};
