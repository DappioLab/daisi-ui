import * as USER from "./user";
import * as RSS from "./rss";
import * as CHAT_GPT from "./chatGpt";

const API = {
  ...USER,
  ...RSS,
  ...CHAT_GPT,
};

export default API;
