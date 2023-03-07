import CyberConnect from "@cyberlab/cyberconnect-v2";
import axios from "axios";
import { ARWEAVE_ENDPOINT, DAISI_DB_ENDPOINT } from "../constants";

export const createPost = async (
  userId: string,
  title: string,
  description: string,
  summitLink: string,
  handle: string,
  cyberConnectClient: CyberConnect
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
      body: summitLink,
      author: handle,
    });
    console.log("create post cc res:", res);

    return {
      status: "SUCCESS",
      itemTitle: title,
      contentId: res.contentID as string,
      metadataUrl: `${ARWEAVE_ENDPOINT}${res.arweaveTxHash}`,
    };

    // TODO: remove `return` and uncomment below if you want to update to Daisi DB in this function.
    if (res.status == "SUCCESS") {
      await axios.post(`${DAISI_DB_ENDPOINT}/api/user/post`, {
        userId,
        itemTitle: title,
        itemLink: summitLink,
        contentId: res.contentID,
        itemMetadataUrl: `${ARWEAVE_ENDPOINT}${res.arweaveTxHash}`,
      });
    }
  } catch (err) {
    console.log(err);
  }
};
