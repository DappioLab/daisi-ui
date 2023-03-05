import { IAuthData } from "@/components/common/authModal";
import * as apiUrl from "../api-url";
import axios from "../interceptors";

export const createUser = (data: IAuthData) => {
  return axios({
    method: "POST",
    url: `${apiUrl.USER}`,
    data,
  });
};

export const getUsers = () => {
  return axios({
    method: "GET",
    url: `${apiUrl.USER}/all`,
  });
};

export const getUserByAddress = (address: string) => {
  return axios({
    method: "GET",
    url: `${apiUrl.USER}/${address}`,
  });
};
