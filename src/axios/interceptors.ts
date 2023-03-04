import axios, { AxiosError } from "axios";

export interface IAxiosError extends AxiosError {
  data: any;
}

const service = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 1000 * 10,
});

service.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `${token}`;
    }
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
