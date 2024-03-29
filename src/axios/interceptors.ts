import axios, { AxiosError } from "axios";

export interface IAxiosError extends AxiosError {
  data: any;
}

const service = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}`,
  timeout: 1000 * 100,
});

service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error.response);
  }
);

export default service;
