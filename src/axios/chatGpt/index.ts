import axios from "axios";

export const getGeneratedContent = async (link: string) => {
  // const res = await fetch("https://service-beta.daisi.social/chatgpt", {
  //   method: "GET",
  //   body: JSON.stringify({ link }),
  // });
  const res = await axios.post("https://service-beta.daisi.social/chatgpt", {
    link,
  });
  return res;
};
