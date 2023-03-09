import CyberConnect from "@cyberlab/cyberconnect-v2";
import { ARWEAVE_ENDPOINT, CYBERCONNECT_ENDPOINT } from "../constants";
import { handleCreator } from "./profile";
import request from "graphql-request";
import { POST_BY_ADDRESS_QUERY } from "@/graphql/cyberConnect/query";
import { Post } from "../postList";

export const createPost = async (
  title: string,
  description: string,
  summitLink: string,
  handle: string,
  cyberConnectClient: CyberConnect,
  image: string = ""
) => {
  try {
    if (!title) {
      alert("title can't be undefined!");
      return;
    }
    if (!description) {
      alert("description can't be undefined!");
      return;
    }
    if (!summitLink) {
      alert("summitLink can't be undefined!");
      return;
    }
    if (!handle) {
      alert("handle can't be undefined!");
      return;
    }
    if (!cyberConnectClient) {
      alert("cyberConnectClient can't be undefined!");
      return;
    }

    const res = await cyberConnectClient.createPost({
      title,
      body: `${description}\n\n${summitLink}`,
      author: handle,
    });
    console.log("create post cc res:", res);

    return {
      status: "SUCCESS",
      contentId: res.contentID as string,
      metadataUrl: `${ARWEAVE_ENDPOINT}${res.arweaveTxHash}`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "FAILED",
      contentId: "",
      metadataUrl: "",
    };
  }
};

export const fetchPosts = async (address: string, myAddress: string) => {
  const daisiHandle = handleCreator(address);

  try {
    const res = await request(CYBERCONNECT_ENDPOINT, POST_BY_ADDRESS_QUERY, {
      address,
      myAddress,
    });

    // @ts-ignore
    let profiles = res.address.wallet.profiles.edges
      .map((e: any) => e.node) // get all profile objects
      .reduce((prev: any, curr: any) => prev.concat(curr), []) // flatten
      .filter((n: any) => n.posts.edges.length > 0); // get profiles who have at least 1 post

    let posts = parsePostsByProfile(profiles);

    // filter Daisi created Handle only
    posts = posts.filter(
      (post: Post) => post.authorHandle.split(".")[0] == daisiHandle
    );

    return posts;
  } catch (err) {
    console.log(err);
  }
};

export const parsePostsByProfile = (profile: any) => {
  return profile
    .map((n: any) => n.posts.edges.map((e: any) => e.node)) // get posts object
    .reduce((prev: any, curr: any) => prev.concat(curr), []); // flatten
};
