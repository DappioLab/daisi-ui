import * as apiUrl from "../api-url";
import axios from "../interceptors";

export const getRssData = () => {
  return axios({
    method: "GET",
    url: `${apiUrl.RSS_DATA}/source_items`,
  });
};

export const updateRssItemLike = (itemId: string, userId: string) => {
  return axios({
    method: "PUT",
    url: `${apiUrl.RSS_DATA}/update_item_like/${itemId}`,
    data: { user_id: userId },
  });
};
