import config from "../../lib/config";
import axios from "axios";

export const kubeviewAxios = axios.create({
  baseURL: config.API_URL,
});

kubeviewAxios.interceptors.request.use((config) => {
  const bearer = localStorage.getItem("accessToken");

  if (bearer) {
    config.headers.Authorization = `Bearer ${bearer}`;
  }

  return config;
});
