import API from "@/axios/api";
import { IRootState } from "@/redux";
import {
  IFeedList,
  IRssSourceData,
  IRssSourceItem,
  updateFeedList,
} from "@/redux/dailySlice";
import style from "@/styles/homePage/horizontalFeed.module.sass";
import moment from "moment";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IFeedProps } from "./gridFeed";
import {
  checkNetwork,
  connectWallet,
  createCyberConnectClient,
  fetchPostById,
  like,
} from "../cyberConnectPage/helper";
import { setPostList } from "@/redux/cyberConnectSlice";
import { updateAuthModal, updateLoadingStatus } from "@/redux/globalSlice";
// import { IFeedProps } from "./feed";
import { toChecksumAddress } from "ethereum-checksum-address";

export enum EFeedType {
  USER_POST = "USER POST",
  RSS_ITEM = "RSS ITEM",
  CC_ITEM = "CC ITEM",
  GUM_ITEM = "GUM ITEM",
}

interface IHorizontalFeedProps extends IFeedProps {
  type: EFeedType;
  children: ReactNode;
}

const HorizontalFeed = (props: IHorizontalFeedProps) => {
  const router = useRouter();
  const [showLinkButton, setShowLinkButton] = useState(false);
  const { userData, isLogin, feedList, address, postList } = useSelector(
    (state: IRootState) => {
      return {
        userData: state.persistedReducer.global.userData,
        isLogin: state.persistedReducer.global.isLogin,
        feedList: state.persistedReducer.daily.feedList,
        address: state.persistedReducer.cyberConnect.address,
        postList: state.persistedReducer.cyberConnect.postList,
      };
    }
  );

  const { userProfilePageData } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );
  const dispatch = useDispatch();

  const updateLike = async () => {
    if (!userData?.id || !isLogin) {
      alert("Please login");
      return;
    }

    dispatch(updateLoadingStatus(true));
    switch (props.type) {
      case EFeedType.RSS_ITEM:
        const updatedItem = await API.updateRssItemLike(
          props.article.id,
          userData.id
        );

        if (updatedItem) {
          const updatedList = feedList.map((item) => {
            if (item.id === updatedItem.data._id) {
              const obj = JSON.parse(JSON.stringify(item));
              obj.likes = updatedItem.data.likes;
              return obj;
            }
            return item;
          });
          dispatch(updateFeedList(updatedList));
        }
        break;

      case EFeedType.CC_ITEM:
        try {
          if (!address) {
            dispatch(updateAuthModal(true));
            return;
          }
          if (!props.article.id) {
            dispatch(updateAuthModal(true));
            return;
          }
          const isLiked = props.article.likes.includes(userData.id);

          const provider = await connectWallet();
          await checkNetwork(provider);
          const cyberConnectClient = createCyberConnectClient(provider);
          await like(props.article.id, cyberConnectClient, !isLiked);

          const updatedPost = await fetchPostById(props.article.id, address);

          if (updatedPost) {
            const post: IFeedList = {
              type: EFeedType.CC_ITEM,
              created: new Date(updatedPost.createdAt).getTime().toString(),
              isUserPost: true,
              userAddress: props.article.userAddress,
              sourceIcon: props.article.sourceIcon,
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

            const updatedList = feedList.map((feed) => {
              if (feed.id === updatedPost.contentID) {
                return post;
              }
              return feed;
            });
            const updatedCCPosts = postList.map((p) => {
              if (p.id === updatedPost.contentID) {
                return post;
              }
              return p;
            });
            dispatch(setPostList(updatedCCPosts));
            dispatch(updateFeedList(updatedList));
          }
        } catch (err) {
          console.log(err);
        }
        break;

      // case EFeedType.GUM_ITEM:
      //   break;

      case EFeedType.USER_POST:
      // Deprecate
      // await API.updateUserPostLike(props.article.id, userData.id);
      // window.location.reload();
      // break;

      default:
        throw "ERROR: unknown feed type";
    }
    dispatch(updateLoadingStatus(false));
  };

  return (
    <div
      className={style.horizontalFeed}
      onMouseEnter={() => setShowLinkButton(true)}
      onMouseLeave={() => setShowLinkButton(false)}
    >
      <div
        className={style.articleIcon}
        onClick={(e) => {
          if (props.article.userAddress) {
            e.stopPropagation();
            router.push(`/profile?address=${props.article.userAddress}`);
          }
        }}
      >
        {/* {props.type === EFeedType.CC_ITEM ? (
          <img
            src="https://yt3.googleusercontent.com/9BS6z4-q-tUFIt3c-amgoNv0QRrEBIMG992Q1lmwsoJTxTmOK6uREjemm0ebe-18VbPOZzVFtw=s900-c-k-c0x00ffffff-no-rj"
            alt="icon"
          />
        ) : ( */}
        <img src={props.article.sourceIcon} alt="icon" />
        {/* )} */}
      </div>
      {showLinkButton ? (
        <a href={props.article.itemLink} target="_blank">
          <div
            className={style.linkButton}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Read more <i className="fa fa-external-link" aria-hidden="true"></i>
          </div>
        </a>
      ) : null}
      <div className={style.titleBlock}>
        <div className={style.title}>{props.article.itemTitle}</div>
        {props.type !== EFeedType.RSS_ITEM && (
          <div className={style.description}>
            {props.article.itemDescription}
          </div>
        )}
        <div className={style.space}></div>
        <div className={style.timeBlock}>
          {moment(parseInt(props.article.linkCreated)).format("MMMM DD, YYYY")}
        </div>
        <div className={style.socialActionBlock}>{props.children}</div>
        {(props.type === EFeedType.RSS_ITEM ||
          props.type === EFeedType.CC_ITEM) && (
          <div
            className={style.socialActionBlock}
            onClick={(e) => {
              e.stopPropagation();
              updateLike();
            }}
          >
            {userData && props.article.likes.includes(userData.id) ? (
              <div style={{ fontSize: "1.6rem" }}>
                <i className="fa fa-heart " aria-hidden="true"></i>
              </div>
            ) : (
              <div style={{ fontSize: "1.6rem" }}>
                <i className="fa fa-heart-o"></i>
              </div>
            )}
            <div className={style.actionNumber}>
              {props.article.likes.length}
            </div>
          </div>
        )}
      </div>
      <div className={style.articleImage}>
        <img
          src={`https://picsum.photos/200/300?${Math.random()}`}
          alt="icon"
        />
        {/* <img src={props.article.itemImage} alt="icon" /> */}
      </div>
    </div>
  );
};

export default HorizontalFeed;
