import API from "@/axios/api";
import style from "@/styles/homePage/postModal.module.sass";
import moment from "moment";
import { IRootState } from "@/redux";
import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IPostList, updatePostList } from "@/redux/discoverSlice";
import { EPostType } from "@/pages";
import { setPostList } from "@/redux/cyberConnectSlice";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGumSDK } from "@/hooks/useGumSDK";
import { Connection, PublicKey } from "@solana/web3.js";
import { GRAPHQL_ENDPOINTS } from "@gumhq/sdk";
import {
  like,
  fetchPostById,
  connectWallet,
  createCyberConnectClient,
} from "@/utils/cyberConnect";
import {
  updateAuthModal,
  updatePostModalData,
  updatePostModalIndex,
  updateLoadingStatus,
  updateShowPostModal,
} from "@/redux/globalSlice";

const PostModal = () => {
  const connection = useMemo(
    () =>
      new Connection(
        "https://lingering-holy-wind.solana-devnet.discover.quiknode.pro/169c1aa008961ed4ec13c040acd5037e8ead18b1/",
        "confirmed"
      ),
    []
  );

  const { userProfile } = useSelector(
    (state: IRootState) => state.persistedReducer.gum
  );
  let sdk = useGumSDK(
    connection,
    { preflightCommitment: "confirmed" },
    "devnet",
    GRAPHQL_ENDPOINTS.devnet
  );
  const { screenWidth, postModalIndex, postModalData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const dispatch = useDispatch();
  const { userData, isLogin, discoverPostList, address, cyberConnectPostList } =
    useSelector((state: IRootState) => {
      return {
        userData: state.persistedReducer.global.userData,
        isLogin: state.persistedReducer.global.isLogin,
        discoverPostList: state.persistedReducer.discover.postList,
        address: state.persistedReducer.cyberConnect.address,
        cyberConnectPostList: state.persistedReducer.cyberConnect.postList,
      };
    });
  const wallet = useWallet();

  const updateLike = async () => {
    if (!userData?.id || !isLogin) {
      alert("Please login");
      return;
    }

    dispatch(updateLoadingStatus(true));
    switch (postModalData.type) {
      case EPostType.RSS_ITEM:
        const updatedItem = await API.updateRssItemLike(
          postModalData.id,
          userData.id
        );

        if (updatedItem) {
          const updatedList = discoverPostList.map((item) => {
            if (item.id === updatedItem.data._id) {
              const obj = JSON.parse(JSON.stringify(item));
              obj.likes = updatedItem.data.likes;
              return obj;
            }
            return item;
          });
          dispatch(updatePostList(updatedList));
        }
        break;

      case EPostType.CC_ITEM:
        try {
          if (!address) {
            dispatch(updateAuthModal(true));
            return;
          }
          if (!postModalData.id) {
            dispatch(updateAuthModal(true));
            return;
          }
          const isLiked = postModalData.likes.includes(userData.id);

          const provider = await connectWallet();
          const cyberConnectClient = createCyberConnectClient(provider);
          await like(postModalData.id, cyberConnectClient, !isLiked);

          const updatedPost = await fetchPostById(postModalData.id, address);

          if (updatedPost) {
            const post: IPostList = {
              type: EPostType.CC_ITEM,
              created: new Date(updatedPost.createdAt).getTime().toString(),
              isUserPost: true,
              userAddress: postModalData.userAddress,
              sourceIcon: postModalData.sourceIcon,
              sourceId: updatedPost.contentID,
              itemTitle: updatedPost.title,
              itemDescription: updatedPost.body.split("\n\n")[0],
              itemImage: "",
              itemLink: updatedPost.body.split("\n\n").reverse()[0],
              likes: updatedPost.likedStatus.liked
                ? new Array(updatedPost.likeCount).fill(userData.id)
                : new Array(updatedPost.likeCount).fill("123"),
              forwards: [],
              linkCreated: new Date(updatedPost.createdAt).getTime().toString(),
              id: updatedPost.contentID,
            };

            const updatedList = discoverPostList.map((post) => {
              if (post.id === updatedPost.contentID) {
                return post;
              }
              return post;
            });
            const updatedCCPosts = cyberConnectPostList.map((p) => {
              if (p.id === updatedPost.contentID) {
                return post;
              }
              return p;
            });
            dispatch(setPostList(updatedCCPosts));
            dispatch(updatePostList(updatedList));
          }
        } catch (err) {
          console.log(err);
        }
        break;

      case EPostType.GUM_ITEM:
        handleLike();
        break;

      default:
        throw "ERROR: unknown post type";
    }
    dispatch(updateLoadingStatus(false));
  };

  const handleLike = async () => {
    try {
      dispatch(updateLoadingStatus(true));

      let result = await createGumLike(postModalData.cl_pubkey.toString());

      if (result.success) {
        setTimeout(() => {
          dispatch(updateLoadingStatus(false));
          window.location.reload();
        }, 5000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createGumLike = async (post: string) => {
    try {
      if (!wallet.publicKey) {
        throw "wallet Not Connected";
      }
      let likeTx = (
        await sdk?.reaction.create(
          userProfile.profile,
          new PublicKey(post),
          "Like",
          userProfile.user,
          wallet.publicKey
        )
      )?.instructionMethodBuilder.rpc();
    } catch (err) {
      console.log(err);
      return { success: false };
    }
    return { success: true };
  };

  const getAdjoiningPost = (value: number) => {
    const nextNumber = postModalIndex + value;
    if (nextNumber < 0) {
      return;
    }
    dispatch(updatePostModalIndex(postModalIndex + value));
  };

  return (
    <div className={style.postModal}>
      <div
        className={style.bg}
        onClick={() => {
          dispatch(updatePostModalData(null));
          dispatch(updateShowPostModal(false));
        }}
      ></div>
      <div className={style.modalContainer}>
        {postModalData && (
          <>
            <div className={style.btnBlock}>
              <div className={style.quickBtnBlock}>
                <div
                  onClick={() => getAdjoiningPost(-1)}
                  className={`${postModalIndex === 0 && style.disabledBtn}`}
                >
                  <i className="fa fa-arrow-left"></i>
                </div>
                <br />
                <div
                  onClick={() => getAdjoiningPost(1)}
                  className={`${postModalData.isLastItem && style.disabledBtn}`}
                >
                  <i className="fa fa-arrow-right"></i>
                </div>
              </div>
              <a href={postModalData.itemLink} target="_blank">
                <div
                  className={style.linkButton}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {screenWidth > 1024 ? <div>Read more</div> : null}
                  <i className="fa fa-external-link" aria-hidden="true"></i>
                </div>
              </a>
            </div>

            <h1>{postModalData.itemTitle}</h1>
            {postModalData.itemDescription !== "" && (
              <div className={style.summaryBlock}>
                <div className={style.title}>TL;DR</div>
                <div>
                  {postModalData.itemDescription.split("- ").map((item) => {
                    return <div>• {item}</div>;
                  })}
                </div>
              </div>
            )}
            <div className={style.timeBlock}>
              {moment(parseInt(postModalData.linkCreated)).format(
                "MMMM DD, YYYY"
              )}
            </div>
            <img
              src={
                postModalData.itemImage && postModalData.itemImage != ""
                  ? postModalData.itemImage
                  : `https://picsum.photos/200/300?${Math.random()}`
              }
              alt="cover"
              className={style.coverImage}
            />
            <div className={style.interactNumBlock}>
              <div
                className={style.socialActionBlock}
                onClick={(e) => {
                  e.stopPropagation();
                  updateLike();
                }}
              >
                {userData && postModalData.likes.includes(userData.id) ? (
                  <div className={style.icon}>
                    <i className="fa fa-heart " aria-hidden="true" />
                  </div>
                ) : (
                  <div className={style.icon}>
                    <i className="fa fa-heart-o" />
                  </div>
                )}
                <div className={style.actionNumber}>
                  {postModalData.likes.length}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostModal;
