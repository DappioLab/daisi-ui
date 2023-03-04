import * as apiUrl from "./api-url";
import axios from "./interceptors";

const API = {
  getRssData() {
    return axios({
      method: "GET",
      url: `${apiUrl.RSS_DATA}/all_resources`,
    });
  },
};

export default API;
