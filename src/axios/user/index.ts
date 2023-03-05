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

export const getFollowerListByAddress = (address: string) => {
  return axios({
    method: "GET",
    url: `${apiUrl.USER}/${address}/follower_list`,
  });
};

export const getFollowingListByAddress = (address: string) => {
  return axios({
    method: "GET",
    url: `${apiUrl.USER}/${address}/following_list`,
  });
};

export const updateUserFollowData = (userData: {
  id: string;
  targetId: string;
}) => {
  return axios({
    method: "PUT",
    url: `${apiUrl.USER}/follow/${userData.id}`,
    data: { target_id: userData.targetId },
  });
};
