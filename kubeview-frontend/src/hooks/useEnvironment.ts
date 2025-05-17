import { kubeviewAxios } from "../components/api/base";
import { useQuery } from "@tanstack/react-query";
import { Environment } from "../models/environment";
export const useKubeEnvironment = (
  owner: string,
  name: string,
  pullNumber: number
) => {
  return useQuery<Environment>({
    queryKey: ["envrionment", owner, name, pullNumber],
    queryFn: async () => {
      const response = await kubeviewAxios.get(
        `/kube/environment/${owner}/${name}/${pullNumber}`
      );
      return response.data;
    },
    enabled: !!owner && !!name && !!pullNumber,
  });
};
