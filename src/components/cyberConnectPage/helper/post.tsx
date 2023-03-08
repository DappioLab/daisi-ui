import CyberConnect from "@cyberlab/cyberconnect-v2";
import { ARWEAVE_ENDPOINT } from "../constants";

export const createPost = async (
  title: string,
  description: string,
  summitLink: string,
  handle: string,
  cyberConnectClient: CyberConnect,
  image: string = ""
) => {
  try {
    if (!title) {
      alert("title can't be undefined!");
      return;
    }
    if (!description) {
      alert("description can't be undefined!");
      return;
    }
    if (!summitLink) {
      alert("summitLink can't be undefined!");
      return;
    }
    if (!handle) {
      alert("handle can't be undefined!");
      return;
    }
    if (!cyberConnectClient) {
      alert("cyberConnectClient can't be undefined!");
      return;
    }

    const res = await cyberConnectClient.createPost({
      title,
      body: `${description}\n\n${summitLink}`,
      author: handle,
    });
    console.log("create post cc res:", res);

    return {
      status: "SUCCESS",
      contentId: res.contentID as string,
      metadataUrl: `${ARWEAVE_ENDPOINT}${res.arweaveTxHash}`,
    };
  } catch (err) {
    console.log(err);
    return {
      status: "FAILED",
      contentId: "",
      metadataUrl: "",
    };
  }
};
