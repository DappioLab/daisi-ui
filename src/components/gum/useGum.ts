import { useState, useMemo, useCallback } from "react";
import { useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey, Connection } from "@solana/web3.js";
import { GRAPHQL_ENDPOINTS } from "../../gpl-core/src";
import axios from "axios";
import { mainGateway } from "./gumStorage";
import { useDispatch, useSelector } from "react-redux";
import { updatePostList } from "@/redux/gumSlice";
import { IRootState } from "@/redux";
import { updateUserProfilePageHandle } from "@/redux/globalSlice";
import { IFeedList } from "@/redux/dailySlice";
import { EFeedType } from "../homePage/horizontalFeed";
import moment from "moment";
import useGumState from "./useGumState";

export interface BlockInterface {
  id: string;
  type: string;
  data: {
    text?: string;
    level?: string;
    file?: { url: string };
    style: string;
  };
}

export const CREATED_IN_DAISI_TAG = "Created in Daisi";

export interface postInterface {
  metadatauri: string;
  daisiContent: {
    itemTitle: string;
    itemDescription: string;
    itemLink: string;
    itemImage: string;
    created: Date;
  };
  cl_pubkey: PublicKey;
  content: { blocks: BlockInterface[] };
  type: string;
  title: string;
  description: string;
  image_url: string;
  profile: PublicKey;
}

const useGum = () => {
  useGumState();
  const dispatch = useDispatch();

  const [postList, setPostList] = useState<postInterface[]>([]);
  const { userProfilePageData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const connection = useMemo(
    () =>
      new Connection(
        "https://lingering-holy-wind.solana-devnet.discover.quiknode.pro/169c1aa008961ed4ec13c040acd5037e8ead18b1/",
        "confirmed"
      ),
    []
  );

  let sdk = useGumSDK(
    connection,
    { preflightCommitment: "confirmed" },
    "devnet",
    GRAPHQL_ENDPOINTS.devnet
  );

  const fetchPostData = useCallback(async (checkingAddress) => {
    try {
      const address = checkingAddress;
      const allPostLocal = await sdk.post.getPostAccountsByUser(
        new PublicKey(address)
      );

      let userPostAccounts = allPostLocal
        ? await Promise.all(
            allPostLocal.map(async (post) => {
              try {
                if (post.account.metadataUri.includes("/ipfs/")) {
                  let postData = await axios.get(
                    mainGateway +
                      post.account.metadataUri.substring(
                        post.account.metadataUri.indexOf("/ipfs/") + 6
                      )
                  );
                  return {
                    postData,
                    metadatauri: post.account.metadataUri,
                    cl_pubkey: post.publicKey,
                    profile: post.account.profile as PublicKey,
                    replyTo: post.account.replyTo
                      ? (post.account.replyTo as PublicKey)
                      : null,
                  };
                }
                let postData = await axios.get(post.account.metadataUri);
                return {
                  postData,
                  metadatauri: post.account.metadataUri,
                  cl_pubkey: post.publicKey,
                  profile: post?.account.profile as PublicKey,
                  replyTo: post.account.replyTo
                    ? (post.account.replyTo as PublicKey)
                    : null,
                };
              } catch (err) {
                console.log(err);
              }
            })
          )
        : [];

      const data = [...userPostAccounts]
        .filter((data) => {
          let postContext = data?.postData.data as postInterface;
          return (
            postContext.daisiContent &&
            postContext.daisiContent.itemImage.includes("https") &&
            data?.postData.status == 200 &&
            postContext.content.blocks?.find((block) => {
              return (
                block.type == "header" &&
                block.data.text == CREATED_IN_DAISI_TAG
              );
            })
          );
        })
        .map((data) => {
          let postContext = data?.postData.data as postInterface;
          return {
            ...postContext,
            metadatauri: data?.metadatauri,
            cl_pubkey: data ? data.cl_pubkey : PublicKey.default,
            profile: data ? data.profile : PublicKey.default,
          };
        });

      if (data.length > 0) {
        dispatch(updateUserProfilePageHandle(data[0].profile));
      }

      const sortedData = data
        .map((item) => {
          return {
            ...item,
            created: item.daisiContent.created,
          };
        })
        .sort((a, b) =>
          a.created < b.created ? 1 : a.created > b.created ? -1 : 0
        );
      setPostList(sortedData);

      let parsedPostList = [];

      for (let item of data) {
        const daisiContent = item.daisiContent;

        const obj: IFeedList = {
          isUserPost: true,
          type: EFeedType.GUM_ITEM,
          sourceId: "",
          userAddress: address,
          id: "",
          itemTitle: daisiContent.itemTitle,
          itemDescription: daisiContent.itemDescription,
          itemLink: daisiContent.itemLink,
          itemImage: daisiContent.itemImage,
          created: moment(daisiContent.created).valueOf().toString(),
          likes: [],
          forwards: [],
          sourceIcon: userProfilePageData.profilePicture,
          linkCreated: moment(daisiContent.created).valueOf().toString(),
          cl_pubkey: item.cl_pubkey,
          gumPost: item,
        };
        parsedPostList.push(obj);
      }
      dispatch(updatePostList(parsedPostList));
    } catch (err) {
      console.log("error", err);
    }
  }, []);

  return { postList, fetchPostData };
};

export default useGum;
