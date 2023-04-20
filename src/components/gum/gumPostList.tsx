import React, { useEffect, useState, useMemo } from "react";
import { useGumSDK } from "@/hooks/useGumSDK";
import { PublicKey, Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { GRAPHQL_ENDPOINTS } from "../../gpl-core/src";
import axios from "axios";
import style from "@/styles/gumPage/explore.module.sass";
import { mainGateway } from "./gumStorage";
import { useDispatch, useSelector } from "react-redux";
import { updatePostList } from "@/redux/gumSlice";
import { IRootState } from "@/redux";
import {
  EFeedModalType,
  updateFeedModalIndex,
  updateFeedModalType,
  updateShowFeedModal,
  updateUserProfilePageHandle,
} from "@/redux/globalSlice";
import { IFeedList } from "@/redux/dailySlice";
import HorizontalFeed, { EFeedType } from "../homePage/horizontalFeed";
import moment from "moment";
import useGumState from "./useGumState";
import GumLikeButton from "../homePage/gumLikeButton";
import ReplyForm from "./gumCommentForm";
import ReplyList from "./gumCommentList";
import GridFeed from "../homePage/gridFeed";
// import { BlockInterface } fro./BlockMigrated-deprecatedted";
import { useRouter } from "next/router";

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

interface IExplorePostsProps {
  checkingAddress: string;
}

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

const ExplorePosts = (props: IExplorePostsProps) => {
  const wallet = useWallet();
  useGumState();
  const dispatch = useDispatch();
  const { userProfile, commentMap } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );

  const [explore, setExplore] = useState<postInterface[]>([]);
  const { userProfilePageData, screenWidth } = useSelector(
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

  const fetchPostData = async () => {
    try {
      const address = props.checkingAddress;
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
      setExplore(sortedData);

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
          // @ts-ignore
          cl_pubkey: item.cl_pubkey,
        };
        parsedPostList.push(obj);
      }
      dispatch(updatePostList(parsedPostList));
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    fetchPostData();
  }, [wallet.connected, userProfile, props.checkingAddress]);

  const [list, setList] = useState([]);
  const [isShowCommentList, setIsShowCommentList] = useState<
    Map<string, boolean>
  >(new Map());

  useEffect(() => {
    let list = [];
    const isShowComment = new Map();

    for (let item of explore) {
      isShowComment.set(item.cl_pubkey.toString(), false);

      let daisiContent = item.daisiContent;
      const feed: IFeedList = {
        isUserPost: true,
        type: EFeedType.GUM_ITEM,
        sourceId: "",
        userAddress: "",
        id: item.cl_pubkey.toString(),
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
      list.push(feed);
      setIsShowCommentList(() => isShowComment);
    }
    setList(() => list);
  }, [explore, userProfilePageData]);

  const getListPostKey = (key: string) => {
    const clone = new Map(isShowCommentList);
    clone.set(key, true);
    setIsShowCommentList(clone);
  };

  return (
    <div>
      {list?.map((item: IFeedList, index: number) => {
        return (
          <div className={style.feed} key={item.id}>
            <>
              {screenWidth > 900 ? (
                <>
                  <div
                    onClick={() => {
                      dispatch(updateFeedModalType(EFeedModalType.PROFILE_GUM));
                      dispatch(updateFeedModalIndex(index));
                      dispatch(updateShowFeedModal(true));
                    }}
                  >
                    <HorizontalFeed item={item}>
                      <div className={style.btnBlock}>
                        <div style={{ marginTop: "1rem", display: "flex" }}>
                          <div style={{ marginRight: "2rem", display: "flex" }}>
                            <GumLikeButton
                              post={item.gumPost}
                              updateList={fetchPostData}
                            />{" "}
                          </div>
                          <ReplyForm
                            from={item.gumPost.profile.toString()}
                            post={item.gumPost.cl_pubkey.toString()}
                            type="Post"
                            commentsNumber={
                              commentMap.get(item.gumPost.cl_pubkey.toString())
                                ? commentMap.get(
                                    item.gumPost.cl_pubkey.toString()
                                  ).length
                                : 0
                            }
                            // getListPostKey={getListPostKey}
                            postKey={item.gumPost.cl_pubkey.toString()}
                            // showMoreCommentBtn={
                            //   commentMap.get(
                            //     item.gumPost.cl_pubkey.toString()
                            //   ) &&
                            //   commentMap.get(item.gumPost.cl_pubkey.toString())
                            //     .length > 0 &&
                            //   !isShowCommentList.get(item.id)
                            // }
                          />
                        </div>
                      </div>
                    </HorizontalFeed>
                  </div>
                  {commentMap.size > 0 &&
                  item.type === EFeedType.GUM_ITEM &&
                  isShowCommentList.size > 0 &&
                  isShowCommentList.get(item.id) ? (
                    <ReplyList
                      replies={commentMap.get(
                        item.gumPost.cl_pubkey.toString()
                      )}
                      postPubkey={item.gumPost.cl_pubkey.toString()}
                    />
                  ) : null}
                </>
              ) : (
                <div
                  onClick={() => {
                    dispatch(updateFeedModalType(EFeedModalType.PROFILE_GUM));
                    dispatch(updateFeedModalIndex(index));
                    dispatch(updateShowFeedModal(true));
                  }}
                >
                  <GridFeed item={item}>
                    <div className={style.btnBlock}>
                      <div style={{ marginTop: "1rem", display: "flex" }}>
                        <div style={{ marginRight: "2rem", display: "flex" }}>
                          <GumLikeButton
                            post={item.gumPost}
                            updateList={fetchPostData}
                          />
                        </div>
                        <ReplyForm
                          from={item.gumPost.profile.toString()}
                          post={item.gumPost.cl_pubkey.toString()}
                          type="Post"
                          commentsNumber={
                            commentMap.get(item.gumPost.cl_pubkey.toString())
                              ? commentMap.get(
                                  item.gumPost.cl_pubkey.toString()
                                ).length
                              : 0
                          }
                          // getListPostKey={getListPostKey}
                          postKey={item.gumPost.cl_pubkey.toString()}
                          // showMoreCommentBtn={
                          //   commentMap.get(item.gumPost.cl_pubkey.toString()) &&
                          //   commentMap.get(item.gumPost.cl_pubkey.toString())
                          //     .length > 0 &&
                          //   !isShowCommentList.get(item.id)
                          // }
                        />
                      </div>
                    </div>
                  </GridFeed>
                  {commentMap.size > 0 &&
                  item.type === EFeedType.GUM_ITEM &&
                  isShowCommentList.size > 0 &&
                  isShowCommentList.get(item.id) ? (
                    <ReplyList
                      replies={commentMap.get(
                        item.gumPost.cl_pubkey.toString()
                      )}
                      postPubkey={item.gumPost.cl_pubkey.toString()}
                    />
                  ) : null}
                </div>
              )}
            </>
          </div>
        );
      })}
    </div>
  );
};

export default ExplorePosts;
