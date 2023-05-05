import axios from "axios";

export const getGeneratedContent = async (link: string) => {
  const res = await axios.post("https://service-beta.daisi.social/chatgpt", {
    link,
  });
  return res;
};
