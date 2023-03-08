import CyberConnect from "@cyberlab/cyberconnect-v2";

export const like = async (
  contendId: string,
  cyberConnect: CyberConnect,
  isLike: boolean
) => {
  try {
    if (isLike) {
      const res = await cyberConnect.like(contendId);

      return {
        status: res.status,
        message: `post id: ${contendId} is liked.`,
      };
    } else {
      const res = await cyberConnect.dislike(contendId);
      console.log("like response:", res);
      return {
        status: res.status,
        message: res.message,
      };
    }
  } catch (err) {
    console.log(err);
  }
};
