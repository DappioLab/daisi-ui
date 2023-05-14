import API from "@/axios/api";
import { IRootState } from "@/redux";
import { updatePostList } from "@/redux/discoverSlice";
import { updateLoadingStatus } from "@/redux/globalSlice";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useRss = () => {
  const { postList } = useSelector(
    (state: IRootState) => state.persistedReducer.discover
  );
  const { userData, isLogin } = useSelector(
    (state: IRootState) => state.persistedReducer.global
  );

  const dispatch = useDispatch();
  const updateLike = useCallback(async (id: string) => {
    if (!userData?.id || !isLogin) {
      alert("Please login");
      return;
    }

    dispatch(updateLoadingStatus(true));
    const updatedItem = await API.updateRssItemLike(id, userData.id);

    if (updatedItem) {
      const updatedList = postList.map((item) => {
        if (item.id === updatedItem.data._id) {
          const obj = JSON.parse(JSON.stringify(item));
          obj.likes = updatedItem.data.likes;
          return obj;
        }
        return item;
      });
      dispatch(updatePostList(updatedList));
    }
    dispatch(updateLoadingStatus(false));
  }, []);

  return { updateLike };
};

export default useRss;
