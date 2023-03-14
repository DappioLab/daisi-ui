import CyberConnect from "@cyberlab/cyberconnect-v2";
import { AddressZero } from "@ethersproject/constants";
import request from "graphql-request";
import { CYBER_CONNECT_ENDPOINT } from "../constants";
import {
  GET_FOLLOWER_QUERY,
  GET_FOLLOWINGS_QUERY,
} from "@/graphql/cyberConnect/query";
import { handleCreator, isDaisiHandle } from "./profile";

export const follow = async (
  handle: string,
  cyberConnect: CyberConnect,
  isFollow: boolean // true => follow the handle; false => un-follow the handle
) => {
  try {
    if (isFollow) {
      await cyberConnect.follow(handle);
    } else {
      await cyberConnect.unfollow(handle);
    }
    // no return data
  } catch (err) {
    console.log(err);
  }
};

export const fetchFollowers = async (
  checkingAddress: string,
  currentAddress: string = AddressZero
) => {
  try {
    if (!checkingAddress) {
      alert("checkingAddress is missing!");
      return;
    }

    if (currentAddress == "") {
      console.log("currentAddress is empty");
      currentAddress = AddressZero;
    }
    const daisiHandle = handleCreator(checkingAddress);
    const res = await request(CYBER_CONNECT_ENDPOINT, GET_FOLLOWER_QUERY, {
      handle: daisiHandle,
      address: currentAddress,
    });

    //@ts-ignore
    let profiles = res.profileByHandle.followers.edges
      .map((e) => e.node.address.wallet)
      .reduce((prev: any, curr: any) => prev.concat(curr), []) // flatten
      .map(
        (w) =>
          w.profiles.edges
            .map((e) => e.node)
            .reduce((prev: any, curr: any) => prev.concat(curr), []) // flatten
      )
      .reduce((prev: any, curr: any) => prev.concat(curr), []); // flatten

    profiles = profiles.filter((p) => isDaisiHandle(p.handle));

    return profiles;
  } catch (err) {
    console.log(err);
  }
};

export const fetchFollowings = async (
  checkingAddress: string,
  currentAddress: string = AddressZero
) => {
  try {
    if (!checkingAddress) {
      alert("checkingAddress is missing!");
      return;
    }

    if (currentAddress == "") {
      console.log("currentAddress is empty");
      currentAddress = AddressZero;
    }
    const res = await request(CYBER_CONNECT_ENDPOINT, GET_FOLLOWINGS_QUERY, {
      address: checkingAddress,
      myAddress: currentAddress,
    });

    //@ts-ignore
    let profiles = res.address.followings.edges
      .map((e) => e.node.profile)
      .reduce((prev: any, curr: any) => prev.concat(curr), []); // flatten

    profiles = profiles.filter((p) => isDaisiHandle(p.handle));

    return profiles;
  } catch (err) {
    console.log(err);
  }
};
