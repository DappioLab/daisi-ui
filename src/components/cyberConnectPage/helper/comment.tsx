import CyberConnect from "@cyberlab/cyberconnect-v2";
import { handleCreator } from "./profile";
import { ARWEAVE_ENDPOINT } from "../constants";

export const comment = async (
  targetId: string, // Can be postId or commentId
  title: string,
  description: string,
  address: string,
  cyberConnectClient: CyberConnect,
  image: string = ""
) => {
  try {
    if (!(targetId && title && description && address)) {
      alert(
        `ERROR: Something is missing...\ntargetId: ${targetId}\ntitle: ${title}\ndescription: ${description}\naddress: ${address}`
      );
      return;
    }
    if (!cyberConnectClient) {
      console.log(
        `Error: CyberConnectClient not found. value=${cyberConnectClient}`
      );
      return;
    }

    const daisiHandle = handleCreator(address);

    const res = await cyberConnectClient.createComment(targetId, {
      title,
      body: description,
      author: daisiHandle,
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
