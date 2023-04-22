import HorizontalFeed from "../homePage/horizontalFeed";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/redux";
import { updateLoadingStatus } from "@/redux/globalSlice";
import { useState } from "react";
import API from "@/axios/api";
import { IFeedList, updateFeedList } from "@/redux/dailySlice";

export interface IRssHorizontalPost {
  item: IFeedList;
  updateList: () => void;
}

const RssHorizontalPost = (props: IRssHorizontalPost) => {
  const { feedList } = useSelector(
    (state: IRootState) => state.persistedReducer.daily
  );
  const { userData, isLogin } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );

  const dispatch = useDispatch();

  const updateLike = async () => {
    if (!userData?.id || !isLogin) {
      alert("Please login");
      return;
    }

    dispatch(updateLoadingStatus(true));
    const updatedItem = await API.updateRssItemLike(props.item.id, userData.id);

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

    dispatch(updateLoadingStatus(false));
  };

  return (
    <>
      <HorizontalFeed item={props.item}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginTop: "1rem",
          }}
        >
          {
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
              onClick={(e) => {
                e.stopPropagation();
                updateLike();
              }}
            >
              {userData && props.item.likes.includes(userData.id) ? (
                <div style={{ fontSize: "1.6rem" }}>
                  <i className="fa fa-heart " aria-hidden="true"></i>
                </div>
              ) : (
                <div style={{ fontSize: "1.6rem" }}>
                  <i className="fa fa-heart-o"></i>
                </div>
              )}
              <div
                style={{
                  marginLeft: "1rem",
                }}
              >
                {props.item.likes.length}
              </div>
            </div>
          }
        </div>
      </HorizontalFeed>
    </>
  );
};

export default RssHorizontalPost;
